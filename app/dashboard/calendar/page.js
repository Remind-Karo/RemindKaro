"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";
import {
  WEEK_DAYS,
  getCalendarDays,
  getDateKey,
  getLocalDateTimeValue,
  getMonthLabel,
  groupTasksByDate,
} from "./calendar-utils";

const TaskForm = dynamic(() => import("@/components/tasks/TaskForm"), {
  ssr: false,
});

const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const calendarDays = useMemo(
    () => getCalendarDays(year, month),
    [year, month]
  );

  const tasksByDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const todayKey = getDateKey(new Date());
  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : "";
  const monthTitle = getMonthLabel(currentMonth);

  const monthTaskCount = useMemo(
    () =>
      tasks.filter((task) => {
        const deadline = new Date(task.deadline);
        return (
          task.status !== "archived" &&
          deadline.getFullYear() === year &&
          deadline.getMonth() === month
        );
      }).length,
    [tasks, year, month]
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const openTaskFormForDate = (date) => {
    setSelectedDate(date);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveTask = (taskData) => {
    const mockTask = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      category: taskData.category || "general",
      deadline: taskData.deadline,
      status: "pending",
    };

    setTasks((currentTasks) => [...currentTasks, mockTask]);
    closeForm();
  };

  const selectedDeadline = selectedDate
    ? getLocalDateTimeValue(selectedDate, 9, 0)
    : "";
  const taskCountLabel = `${monthTaskCount} ${monthTaskCount === 1 ? "task" : "tasks"} scheduled this month`;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>CALENDAR</p>
          <h1 className={styles.monthTitle}>{monthTitle}</h1>
          <p className={styles.subtitle}>{taskCountLabel}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.monthControls} aria-label="Month navigation">
            <button
              type="button"
              className={styles.iconButton}
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} strokeWidth={2.4} aria-hidden />
            </button>
            <button
              type="button"
              className={styles.todayButton}
              onClick={goToToday}
            >
              Today
            </button>
            <button
              type="button"
              className={styles.iconButton}
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight size={18} strokeWidth={2.4} aria-hidden />
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => openTaskFormForDate(selectedDate || new Date())}
          >
            <>
              <Plus size={16} strokeWidth={2.5} aria-hidden />
              New Task
            </>
          </Button>
        </div>
      </header>

      <section className={styles.calendarShell} aria-label="Monthly calendar">
        <div className={styles.weekHeader}>
          {WEEK_DAYS.map((day) => (
            <div key={day} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarGrid}>
          {calendarDays.map(({ date, key, isCurrentMonth }) => {
            const dayTasks = tasksByDate[key] || [];
            const isToday = key === todayKey;
            const isSelected = key === selectedDateKey;

            return (
              <button
                key={key}
                type="button"
                className={[
                  styles.dayCell,
                  !isCurrentMonth ? styles.outsideMonth : "",
                  isToday ? styles.today : "",
                  isSelected ? styles.selected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => openTaskFormForDate(date)}
                aria-label={`${date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}. ${dayTasks.length} ${dayTasks.length === 1 ? "task" : "tasks"}`}
                aria-pressed={isSelected}
              >
                <span className={styles.dateRow}>
                  <span className={styles.dateNumber}>{date.getDate()}</span>
                  {isToday && <span className={styles.todayPill}>Today</span>}
                </span>

                <span className={styles.taskList}>
                  {dayTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.id}
                      className={`${styles.taskChip} ${styles[`priority-${task.priority}`]}`}
                      title={task.title}
                    >
                      <span className={styles.priorityDot} aria-hidden />
                      <span className={styles.taskTitle}>{task.title}</span>
                      <span className={styles.priorityLabel}>
                        {PRIORITY_LABELS[task.priority] || "Task"}
                      </span>
                    </span>
                  ))}

                  {dayTasks.length > 3 && (
                    <span className={styles.moreTasks}>
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.legend} aria-label="Priority legend">
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.high}`} />
          High
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.medium}`} />
          Medium
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.low}`} />
          Low
        </span>
      </div>

      {isFormOpen && (
        <TaskForm
          key={selectedDeadline}
          initialDeadline={selectedDeadline}
          showVoiceInput={false}
          validateDeadline={false}
          onClose={closeForm}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
