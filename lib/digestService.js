/**
 * Digest Service: Aggregates 7-day completed tasks and currently overdue tasks.
 * Uses defensive date parsing to avoid treating missing timestamps as current.
 */
export function calculateWeeklyStatsFromTasks(tasks = []) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // 1. Completed in the last 7 days
  const completedCount = tasks.filter((t) => {
    if (t.status !== 'completed') return false;
    const rawUpdated = t.updated_at || t.updatedAt;
    if (!rawUpdated) return false;

    const updatedAt = new Date(rawUpdated);
    if (Number.isNaN(updatedAt.getTime())) return false;

    return updatedAt >= sevenDaysAgo;
  }).length;

  // 2. Currently overdue (deadline passed and not completed/archived)
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'archived') return false;
    if (!t.deadline) return false;

    const deadlineDate = new Date(t.deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;

    return deadlineDate < now;
  }).length;

  return { completedCount, overdueCount };
}
