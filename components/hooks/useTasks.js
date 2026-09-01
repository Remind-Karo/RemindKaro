'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

let tasks = [];
let loading = true;
let hasLoaded = false;
let snapshot = { tasks, loading };
const listeners = new Set();

const getSnapshot = () => snapshot;

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  snapshot = { tasks, loading };
  listeners.forEach((listener) => listener());
};

const setTasks = (updater) => {
  tasks = typeof updater === 'function' ? updater(tasks) : updater;
  notify();
};

const setLoading = (value) => {
  loading = value;
  notify();
};

const replaceTask = (taskId, nextTask) => {
  setTasks((currentTasks) =>
    currentTasks.map((task) => (task.id === taskId ? nextTask : task))
  );
};

const removeTask = (taskId) => {
  setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
};

export default function useTasks() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const fetchTasks = useCallback(async ({ force = false } = {}) => {
    if (hasLoaded && !force) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        hasLoaded = true;
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData) => {
    const optimisticId = taskData.id || `temp-${Date.now()}`;
    const optimisticTask = {
      ...taskData,
      id: optimisticId,
    };

    setTasks((currentTasks) => [...currentTasks, optimisticTask]);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error('Task creation failed');
      }

      const { task } = await res.json();
      replaceTask(optimisticId, task);
      return task;
    } catch (err) {
      removeTask(optimisticId);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (taskData) => {
    const previousTasks = tasks;
    replaceTask(taskData.id, taskData);

    try {
      const res = await fetch(`/api/tasks/${taskData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error('Task update failed');
      }

      const { task } = await res.json();
      replaceTask(taskData.id, task);
      return task;
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId, status) => {
    const previousTasks = tasks;
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error('Task status update failed');
      }
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    const previousTasks = tasks;
    removeTask(taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Task delete failed');
      }
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  }, []);

  const archiveTasks = useCallback(async (taskIds) => {
    const previousTasks = tasks;
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !taskIds.includes(task.id))
    );

    try {
      const responses = await Promise.all(
        taskIds.map((taskId) =>
          fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
          })
        )
      );

      if (!responses.every((res) => res.ok)) {
        throw new Error('Some archive requests failed');
      }
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  }, []);

  return {
    tasks: snapshot.tasks,
    loading: snapshot.loading,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    archiveTasks,
  };
}
