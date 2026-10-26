import { tasks, events } from "./storage.js";

// локальная дата "YYYY-MM-DD" (toISOString сдвинул бы часовой пояс)
export const toDateStr = date => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
};

export const getTodayStr = () => toDateStr(new Date());

// задачи, поставленные в план на день
export const getPlannedFor = date =>
  tasks.filter(t => t.plannedDate === date && t.status !== "done");

export const getInProgress = () => tasks.filter(t => t.status === "inProgress");

export const getOverdue = () => {
  const today = getTodayStr();
  return tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done");
};

export const getOverdueDays = task => {
  if (!task.dueDate || task.status === "done") return 0;
  const diff = new Date(getTodayStr()) - new Date(task.dueDate);
  return Math.max(0, Math.round(diff / 86400000));
};

// выполнено за последние 7 дней
export const getDoneThisWeek = () =>
  tasks.filter(
    t =>
      t.status === "done" &&
      t.completedAt &&
      Date.now() - new Date(t.completedAt).getTime() < 7 * 86400000,
  );

// сколько "дел" в этот день (для точек под днём недели)
export const countForDate = date =>
  events.filter(e => e.date === date).length +
  tasks.filter(
    t => t.status !== "done" && (t.plannedDate === date || t.dueDate === date),
  ).length;