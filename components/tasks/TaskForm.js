'use client';

import { useState, useEffect } from 'react';
import styles from './TaskForm.module.css';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import VoiceMic from '@/components/ui/VoiceMic';
import { SkeletonField } from '@/components/ui/Skeleton';

const DEADLINE_ERROR = 'Deadline must be in the future';

// Format current client time
const toLocalDateTimeValue = (date) => {
  const pad = (value) => String(value).padStart(2, '0');

  return `${[
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Compare deadline against user local time
const isDeadlineInPast = (value) => {
  if (!value) return false;

  const now = new Date();
  now.setSeconds(0, 0);

  return new Date(value).getTime() < now.getTime();
};

export default function TaskForm({
  initialData = null,
  onClose,
  onSave,
  initialVoiceText = '',
}) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const getNextHourDefault = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1, 0, 0, 0);
    return toLocalDateTimeValue(date);
  };

  const [deadline, setDeadline] = useState(
    initialData?.deadline
      ? new Date(initialData.deadline).toISOString().slice(0, 16)
      : getNextHourDefault()
  );

  const [deadlineWarning, setDeadlineWarning] = useState('');
  const minDeadline = toLocalDateTimeValue(new Date());
  const isPastDeadline = isDeadlineInPast(deadline);
  const deadlineError = isPastDeadline ? DEADLINE_ERROR : deadlineWarning;

  const [priority, setPriority] = useState(initialData?.priority || 'medium');
  const [category, setCategory] = useState(initialData?.category || 'General');

  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceInput, setVoiceInput] = useState(initialVoiceText);

  // If opened with voice text, process it immediately
  useEffect(() => {
    if (initialVoiceText) {
      processVoiceInput(initialVoiceText);
    }
  }, [initialVoiceText]);
  // Listen for Escape key presses and dismiss the active modal.
  // Cleanup removes the listener when the modal unmounts.

  useEffect(() => {
    if (!onClose) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const processVoiceInput = async (text) => {
    setVoiceInput(text);
    setIsProcessingVoice(true);
    try {
      const res = await fetch('/api/voice/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');

      setTitle(data.title);
      setDeadline(data.deadline.slice(0, 16));
      setDeadlineWarning(
        isDeadlineInPast(data.deadline.slice(0, 16)) ? DEADLINE_ERROR : ''
      );
      setPriority(data.priority);
      setCategory(data.category);
    } catch (err) {
      console.error(err);
      // Fallback to basic assignment if API fails
      setTitle(text);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final date/time validation before saving
    if (isDeadlineInPast(deadline)) {
      setDeadlineWarning(DEADLINE_ERROR);
      return;
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      priority,
      category,
      status: initialData?.status || 'pending',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {!initialData && (
          <div className={styles.voiceSection}>
            <VoiceMic
              onResult={processVoiceInput}
              disabled={isProcessingVoice}
            />
            <div className={styles.voiceHint}>
              {isProcessingVoice ? (
                <span
                  className={styles.voiceActive}
                  role="status"
                  aria-live="polite"
                >
                  <span className={styles.voiceSpinner} aria-hidden="true" />
                  Parsing your request with AI...
                </span>
              ) : voiceInput ? (
                <span>Heard: "{voiceInput}"</span>
              ) : (
                <span>
                  Try saying: "Remind me to submit assignment tomorrow at 5pm,
                  urgent"
                </span>
              )}
            </div>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          {isProcessingVoice ? (
            <>
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <div className={styles.row}>
                <SkeletonField />
                <SkeletonField />
              </div>
            </>
          ) : (
            <>
              <Input
                id="title"
                label="Task Title"
                placeholder="e.g. Finish Next.js project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
              />

              <Input
                id="description"
                label="Description (Optional)"
                placeholder="Add details here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
              />

              <Input
                id="deadline"
                label="Deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  setDeadlineWarning(
                    isDeadlineInPast(e.target.value) ? DEADLINE_ERROR : ''
                  );
                }}
                onInvalid={(e) => {
                  if (isDeadlineInPast(e.currentTarget.value)) {
                    setDeadlineWarning(DEADLINE_ERROR);
                  }
                }}
                min={minDeadline}
                error={deadlineError}
                required
                fullWidth
              />

              <div className={styles.row}>
                <div className={styles.selectWrap}>
                  <label htmlFor="priority" className={styles.label}>
                    Priority
                  </label>
                  <select
                    id="priority"
                    aria-label="Task priority"
                    className={styles.select}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High / Urgent</option>
                  </select>
                </div>

                <div className={styles.selectWrap}>
                  <label htmlFor="category" className={styles.label}>
                    Category
                  </label>
                  <select
                    id="category"
                    aria-label="Task category"
                    className={styles.select}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Work">Work</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className={styles.footer}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isProcessingVoice}>
              {initialData ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
