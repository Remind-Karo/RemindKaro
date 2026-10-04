export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad = (value) => String(value).padStart(2, "0");

export const getDateKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getMonthLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

export const getLocalDateTimeValue = (date, hour = 9, minute = 0) =>
  `${getDateKey(date)}T${pad(hour)}:${pad(minute)}`;

export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    const date = new Date(year, month, dayNumber);

    return {
      date,
      key: getDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

export const groupTasksByDate = (tasks = []) =>
  tasks.reduce((groupedTasks, task) => {
    if (!task.deadline || task.status === "archived") return groupedTasks;

    const taskDate = new Date(task.deadline);
    if (Number.isNaN(taskDate.getTime())) return groupedTasks;

    const key = getDateKey(taskDate);
    const tasksForDay = groupedTasks[key] || [];

    return {
      ...groupedTasks,
      [key]: [...tasksForDay, task].sort(
        (firstTask, secondTask) =>
          new Date(firstTask.deadline) - new Date(secondTask.deadline)
      ),
    };
  }, {});
