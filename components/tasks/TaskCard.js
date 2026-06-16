'use client';
import { useState, useMemo } from 'react';
import styles from './TaskCard.module.css';

export default function TaskCard({ task, onStatusChange, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const urgency = useMemo(() => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);

    if (task.status === 'completed')
      return { state: 'done', label: 'Done', color: 'done' };
    if (
      task.status === 'missed' ||
      (hoursLeft < 0 && task.status !== 'completed')
    )
      return { state: 'overdue', label: 'Overdue', color: 'overdue' };
    if (hoursLeft < 1)
      return {
        state: 'critical',
        label: `${Math.round(hoursLeft * 60)}m left`,
        color: 'critical',
      };
    if (hoursLeft < 6)
      return {
        state: 'urgent',
        label: `${Math.round(hoursLeft)}h left`,
        color: 'urgent',
      };
    if (hoursLeft < 24)
      return { state: 'today', label: 'Today', color: 'today' };
    const daysLeft = Math.ceil(hoursLeft / 24);
    return { state: 'upcoming', label: `${daysLeft}d left`, color: 'upcoming' };
  }, [task.deadline, task.status]);

  const formattedDeadline = useMemo(() => {
    return new Date(task.deadline).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [task.deadline]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await onStatusChange(task.id, 'completed');
    } finally {
      setCompleting(false);
    }
  };
  const handleCopyShare = async () => {
    const shareText = `[${task.category}] Task: ${task.title} - Due: ${formattedDeadline}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };
  const cardCls = [
    styles.card,
    styles[`priority--${task.priority}`],
    styles[`urgency--${urgency.state}`],
    task.status === 'completed' ? styles.completed : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardCls}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Task: ${task.title}`}
    >
      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{task.title}</h3>
          <span
            className={`${styles.urgencyBadge} ${styles[`badge--${urgency.color}`]}`}
          >
            {urgency.label}
          </span>
        </div>

        {task.description ? (
          <p className={styles.description}>{task.description}</p>
        ) : (
          <p className={`${styles.description} ${styles.descriptionPlaceholder}`}>
            No description added
          </p>
        )}

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            {/* Clock icon */}
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formattedDeadline}
          </span>
          <span className={styles.category}>{task.category}</span>
          {task.recurring && (
            <span className={styles.recurring}>
              {/* Repeat icon */}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {task.recurring}
            </span>
          )}
        </div>
      </div>

      <div
        className={`${styles.actions} ${hovered ? styles.actionsVisible : ''}`}
      >
        {task.status !== 'completed' && (
          <button
            className={`${styles.actionBtn} ${styles.completeBtn}`}
            onClick={handleComplete}
            disabled={completing}
            title="Mark complete"
            aria-label="Mark task as completed"
          >
            {completing ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}
        <button
          className={`${styles.actionBtn} ${styles.editBtn}`}
          onClick={() => onEdit?.(task)}
          title="Edit"
          aria-label="Edit task"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={styles.actionBtn}
          onClick={handleCopyShare}
          title={copied ? 'Copied!' : 'Copy Share Link'}
          aria-label="Copy task details"
        >
          {copied ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete?.(task.id)}
          title="Delete"
          aria-label="Delete task"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}
