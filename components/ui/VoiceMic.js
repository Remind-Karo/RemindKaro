'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './VoiceMic.module.css';

/**
 * Premium VoiceMic — Web Speech API with animated pulse rings
 */
export default function VoiceMic({ onResult, onError, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript);
        };
        recognition.onerror = (event) => {
          if (onError) onError(event.error);
          setIsRecording(false);
        };
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
      }
    }
  }, [onResult, onError]);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error', err);
      }
    }
  }, [isRecording]);

  if (!isSupported) {
    return (
      <button
        className={`${styles.micButton} ${styles.disabled}`}
        disabled
        title="Voice input not supported in this browser"
        type="button"
        aria-label="Voice input unavailable"
      >
        {/* Mic-off icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    );
  }

  return (
    <div className={styles.wrapper}>
      {isRecording && (
        <>
          <div className={`${styles.pulseRing} ${styles.pulseRing1}`} />
          <div className={`${styles.pulseRing} ${styles.pulseRing2}`} />
        </>
      )}
      <span className={styles.tooltip}>
        {isRecording ? 'Click to stop recording' : 'Click to use voice input'}
      </span>
      <button
        type="button"
        className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
        onClick={toggleRecording}
        disabled={disabled}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
        aria-label={isRecording ? 'Stop voice recording' : 'Start voice input'}
      >
        {isRecording ? (
          /* Stop icon when recording */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        ) : (
          /* Mic icon */
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </button>
    </div>
  );
}
