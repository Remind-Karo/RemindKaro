'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import styles from './WakeWordListener.module.css';

const STORAGE_KEY = 'remindkaro:wake-word-enabled';
const RESTART_DELAY_MS = 750;
const WAKE_WORD_PATTERN = /^\s*hey[\s,-]+remind\b[\s,:-]*(.*)$/i;

function persistEnabledState(isEnabled) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(isEnabled));
  } catch {
    // Wake-word listening still works when storage is unavailable.
  }
}

export default function WakeWordListener({ onWakeWord, paused = false }) {
  const [isSupported, setIsSupported] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const recognitionRef = useRef(null);
  const restartTimerRef = useRef(null);
  const startRecognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const onWakeWordRef = useRef(onWakeWord);

  useEffect(() => {
    onWakeWordRef.current = onWakeWord;
  }, [onWakeWord]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatusMessage('Wake-word recognition is unavailable in this browser.');
      return undefined;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const clearRestartTimer = () => {
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
    };

    const startRecognition = () => {
      if (!shouldListenRef.current || recognitionRef.current !== recognition) {
        return;
      }

      clearRestartTimer();

      try {
        recognition.start();
      } catch (error) {
        if (error?.name !== 'InvalidStateError') {
          setStatusMessage('Unable to start wake-word listening.');
        }
      }
    };

    startRecognitionRef.current = startRecognition;

    recognition.onstart = () => {
      if (!shouldListenRef.current) {
        recognition.abort();
        return;
      }

      setIsListening(true);
      setStatusMessage('Listening for “Hey Remind”.');
    };

    recognition.onresult = (event) => {
      if (!shouldListenRef.current) return;

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index];
        if (!result.isFinal) continue;

        const transcript = result[0].transcript.trim();
        const match = transcript.match(WAKE_WORD_PATTERN);
        if (!match) continue;

        const command = match[1].trim();
        const taskRequest = command ? `Remind ${command}` : '';

        shouldListenRef.current = false;
        clearRestartTimer();
        recognition.stop();
        setStatusMessage('Wake word detected. Opening a new task.');
        onWakeWordRef.current?.(taskRequest);
        return;
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === 'aborted' || event.error === 'no-speech') return;

      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        shouldListenRef.current = false;
        setIsEnabled(false);
        persistEnabledState(false);
        setStatusMessage(
          'Microphone permission was denied. Enable it to use “Hey Remind”.'
        );
        return;
      }

      if (event.error === 'audio-capture') {
        shouldListenRef.current = false;
        setIsEnabled(false);
        persistEnabledState(false);
        setStatusMessage('No microphone is available for wake-word listening.');
        return;
      }

      setStatusMessage('Wake-word listening was interrupted. Retrying…');
    };

    recognition.onend = () => {
      setIsListening(false);

      if (!shouldListenRef.current) return;

      clearRestartTimer();
      restartTimerRef.current = window.setTimeout(
        startRecognition,
        RESTART_DELAY_MS
      );
    };

    recognitionRef.current = recognition;

    try {
      setIsEnabled(window.localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      setIsEnabled(false);
    }

    return () => {
      shouldListenRef.current = false;
      clearRestartTimer();
      startRecognitionRef.current = null;
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // Recognition may already be stopped.
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const shouldListen = isSupported === true && isEnabled && !paused;
    shouldListenRef.current = shouldListen;

    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (shouldListen) {
      startRecognitionRef.current?.();
      return;
    }

    if (isEnabled && paused) {
      setStatusMessage('Wake-word listening is paused while a modal is open.');
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      // Recognition may already be stopped.
    }
  }, [isEnabled, isSupported, paused]);

  const handleToggle = useCallback(() => {
    if (isSupported !== true) return;

    const nextEnabled = !isEnabled;
    setIsEnabled(nextEnabled);
    persistEnabledState(nextEnabled);

    if (!nextEnabled) {
      shouldListenRef.current = false;
      setStatusMessage('Wake-word listening is off.');
      try {
        recognitionRef.current?.abort();
      } catch {
        // Recognition may already be stopped.
      }
      return;
    }

    setStatusMessage('Requesting microphone access…');
    shouldListenRef.current = !paused;
    if (!paused) startRecognitionRef.current?.();
  }, [isEnabled, isSupported, paused]);

  const label =
    isSupported === false
      ? 'Hey Remind unavailable'
      : !isEnabled
        ? 'Enable Hey Remind'
        : paused
          ? 'Hey Remind paused'
          : isListening
            ? 'Hey Remind on'
            : 'Starting Hey Remind';

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.toggle} ${isEnabled ? styles.enabled : ''} ${
          isListening ? styles.listening : ''
        }`}
        onClick={handleToggle}
        disabled={isSupported !== true}
        aria-label={label}
        aria-pressed={isEnabled}
      >
        {isEnabled ? (
          <Mic size={15} aria-hidden="true" />
        ) : (
          <MicOff size={15} aria-hidden="true" />
        )}
        <span>{label}</span>
        {isEnabled && <span className={styles.statusDot} aria-hidden="true" />}
      </button>
      <span
        className={styles.tooltip}
        role={statusMessage.includes('denied') ? 'alert' : 'status'}
        aria-live="polite"
      >
        {statusMessage || 'Say “Hey Remind” to open a new task.'}
      </span>
    </div>
  );
}
