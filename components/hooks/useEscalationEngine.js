'use client';

import { useEffect, useRef } from 'react';

/**
 * Checks tasks periodically and triggers browser notifications / audio chimes
 * for urgent/overdue tasks.
 *

 */
export default function useEscalationEngine(tasks) {
  const notifiedTasksRef = useRef(new Set());

  useEffect(() => {
    // Request notification permission if it has not been decided yet.
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkTasks = () => {
      if (!tasks || tasks.length === 0) return;

      if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
      }

      if (Notification.permission !== 'granted') return;

      const now = new Date();
      let shouldPlayChime = false;

      tasks.forEach((task) => {
        // Ignore completed tasks.
        if (task.status === 'completed') return;

        const deadline = new Date(task.deadline);
        const hoursLeft = (deadline - now) / (1000 * 60 * 60);

        // Conditions for escalation:
        // 1. Task just became overdue
        // 2. Task is critical (< 1 hour left)

        let escalationType = null;

        if (hoursLeft < 0 && hoursLeft > -1) {
          escalationType = 'overdue';
        } else if (hoursLeft > 0 && hoursLeft < 1) {
          escalationType = 'critical';
        }

        if (escalationType) {
          const notificationId = `${task.id}-${escalationType}`;

          // Only notify/chime once for each escalation type.
          if (!notifiedTasksRef.current.has(notificationId)) {
            notifiedTasksRef.current.add(notificationId);
            shouldPlayChime = true;

            const title =
              escalationType === 'overdue'
                ? `🚨 OVERDUE: ${task.title}`
                : `⏳ CRITICAL: ${task.title}`;

            const body =
              escalationType === 'overdue'
                ? 'This task missed its deadline.'
                : 'This task is due in less than an hour!';

            new Notification(title, {
              body,
              icon: '/favicon.ico',
              vibrate: [200, 100, 200],
            });
          }
        }
      });

      /*
       * Check the user's sound preference.
       *
       * "remindkaro-sound" is the key used by the dashboard sound toggle.
       *
       * true / missing  -> sound enabled
       * false            -> sound disabled
       */
      const soundEnabled = localStorage.getItem('remindkaro-sound') !== 'false';

      // Only play the chime when:
      // 1. An escalation happened
      // 2. The user has not disabled sounds
      if (shouldPlayChime && soundEnabled) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;

          if (!AudioContext) {
            console.warn('AudioContext is not supported by this browser.');
            return;
          }

          const audioCtx = new AudioContext();

          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.type = 'sine';

          // Start at A5 (880Hz)
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

          // Drop to A4 (440Hz) over 0.5 seconds
          oscillator.frequency.exponentialRampToValueAtTime(
            440,
            audioCtx.currentTime + 0.5
          );

          // Start with a low volume
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

          // Fade the sound out smoothly
          gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + 0.5
          );

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.5);

          // Close the AudioContext after the chime finishes.
          oscillator.addEventListener('ended', () => {
            audioCtx.close().catch(() => {});
          });
        } catch (err) {
          console.error('Audio chime failed:', err);
        }
      }
    };

    // Run immediately.
    checkTasks();

    // Then check every minute.
    const interval = setInterval(checkTasks, 60 * 1000);

    // Cleanup interval when the component unmounts
    // or the tasks change.
    return () => clearInterval(interval);
  }, [tasks]);
}
