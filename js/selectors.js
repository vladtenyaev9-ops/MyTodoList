import { tasks, events } from "./storage.js";
import { toDateStr, timeToMin } from "./dates.js";
import { occursOn } from "./recurrence.js";

export { toDateStr };

export const getTodayStr = () => toDateStr(new Date());

// события, которые выпадают на день (с учётом повторов)
export const eventsOn = date =>
  events.filter(e => occursOn(e.date, e.repeat, date));

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

// сколько "дел" в этот день (для точек под днём)
export const countForDate = date =>
  eventsOn(date).length +
  tasks.filter(
    t => t.status !== "done" && (t.plannedDate === date || t.dueDate === date),
  ).length;

// всё, что нужно для плана дня по часам
export const getDayBlocks = date => {
  const blocks = [];
  const unscheduled = [];

  eventsOn(date).forEach(e => {
    if (!e.time) return;
    const start = timeToMin(e.time);
    blocks.push({
      kind: "event",
      id: e.id,
      title: e.title,
      start,
      end: Math.min(start + e.duration, 1440),
      repeat: e.repeat,
      done: false,
    });
  });

  tasks
    .filter(t => t.plannedDate === date)
    .forEach(t => {
      if (t.plannedTime) {
        const start = timeToMin(t.plannedTime);
        blocks.push({
          kind: "task",
          id: t.id,
          title: t.title,
          start,
          end: Math.min(start + (t.estimate || 30), 1440),
          priority: t.priority,
          repeat: t.repeat,
          done: t.status === "done",
        });
      } else if (t.status !== "done") {
        unscheduled.push(t);
      }
    });

  // сколько минут запланировано (выполненное не считаем)
  const total =
    blocks.filter(b => !b.done).reduce((sum, b) => sum + (b.end - b.start), 0) +
    unscheduled.reduce((sum, t) => sum + (t.estimate || 0), 0);

  return { blocks, unscheduled, total };
};