"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./page.module.css";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import CalendarView from "@/components/ui/CalendarView";
import VoiceMic from "@/components/ui/VoiceMic";
import TaskForm from "@/components/tasks/TaskForm";
import useEscalationEngine from "@/components/hooks/useEscalationEngine";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

export default function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [initialVoiceText, setInitialVoiceText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic document title with pending task count
  useEffect(() => {
    const pendingCount = tasks.filter((t) => t.status !== "completed" && t.status !== "archived").length;
    document.title = pendingCount > 0 ? `(${pendingCount}) RemindKaro` : "RemindKaro";
  }, [tasks]);

  useEscalationEngine(tasks);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks);
        }
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      urgent: tasks.filter(
        (t) => t.priority === "high" && t.status !== "completed"
      ).length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === "high")
          return t.priority === "high" && t.status !== "completed";
        if (filter === "completed") return t.status === "completed";
        return true;
      })
      .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks, filter, searchQuery]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 4);
  }, [tasks]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const completedIds = tasks
        .filter((t) => t.status === "completed")
        .map((t) => t.id);

      for (const id of completedIds) {
        await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "archived" }),
        });
      }

      setTasks((prev) => prev.filter((t) => t.status !== "completed"));
    } catch (err) {
      console.error("Failed to clear completed tasks:", err);
    }
  };

  const handleVoiceInput = (text) => {
    setInitialVoiceText(text);
    setIsFormOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (res.ok) {
          const { task } = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        }
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        if (res.ok) {
          const { task } = await res.json();
          setTasks((prev) => [...prev, task]);
        }
      }
      closeForm();
    } catch (err) {
      console.error(err);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
    setInitialVoiceText("");
  };

  const formatRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = date - now;
    const diffH = Math.round(diffMs / (1000 * 60 * 60));
    const diffD = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffH < 0) return "Overdue";
    if (diffH < 1) return "Due soon";
    if (diffH < 24) return `${diffH}h left`;
    if (diffD === 1) return "Tomorrow";
    return `${diffD}d left`;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* ── Page Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.greeting}>Overview</p>
          <h1 className={styles.title}>Your Tasks</h1>
        </div>
        <div className={styles.headerActions}>
          <VoiceMic onResult={handleVoiceInput} />
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsFormOpen(true)}
          >
            <>
              <Plus size={16} strokeWidth={2.5} aria-hidden />
              New Task
            </>
          </Button>
        </div>
      </header>

      {/* ── Stats ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles["statIcon--default"]}`}>
            <svg
              className={styles.statIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--urgent"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--urgent"]}`}>
            <svg
              className={styles.statIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{stats.urgent}</span>
            <span className={styles.statLabel}>High Priority</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles["statCard--completed"]}`}>
          <div className={`${styles.statIcon} ${styles["statIcon--success"]}`}>
            <svg
              className={styles.statIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
      </section>

      {/* ── Main content + sidebar ── */}
      <div className={styles.content}>
        {/* ── Task panel ── */}
        <div className={styles.mainPanel}>
          <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.searchClear}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear Search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.filterGroup}>
              <button
                className={styles.filterBtn}
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={styles.filterBtn}
                aria-pressed={filter === "high"}
                onClick={() => setFilter("high")}
              >
                Urgent
              </button>
              <button
                className={styles.filterBtn}
                aria-pressed={filter === "completed"}
                onClick={() => setFilter("completed")}
              >
                Done
              </button>
            </div>
            <span className={styles.taskCount}>
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>

            {stats.completed > 0 && (
              <button
                className={styles.clearBtn}
                onClick={handleClearCompleted}
              >
                Clear Completed
              </button>
            )}
          </div>

          <div className={styles.taskList}>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsFormOpen(true);
                  }}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <h3>No tasks found</h3>
                <p>You are all caught up. Add a new task to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidePanel}>
          <div className={styles.calendarWidget}>
            <CalendarView tasks={tasks} />
          </div>

          <div className={styles.sideCard}>
            <p className={styles.sideCardTitle}>Up Next</p>
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className={styles.upcomingItem}>
                  <span
                    className={`${styles.upcomingDot} ${styles[`upcomingDot--${task.priority}`]}`}
                  />
                  <div className={styles.upcomingMeta}>
                    <span className={styles.upcomingTitle}>{task.title}</span>
                    <span className={styles.upcomingTime}>
                      {formatRelativeTime(task.deadline)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.upcomingEmpty}>No upcoming tasks.</p>
            )}
          </div>
        </aside>
      </div>

      {isFormOpen && (
        <TaskForm
          initialData={editingTask}
          initialVoiceText={initialVoiceText}
          onClose={closeForm}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
