import {
  tasks,
  deletedTasks,
  saveTasks,
  saveDeletedTasks,
} from "./storage.js";
import { toDateStr, addDays, diffDays } from "./dates.js";
import { nextOccurrence } from "./recurrence.js";

export const createTodo = ({
  title,
  description,
  priority,
  dueDate = "",
  dueTime = "",
  plannedDate = "",
  plannedTime = "",
  estimate = 0,
  repeat = "none",
}) => {
  if (!title.trim() || !description.trim()) return;

  const task = {
    id: crypto.randomUUID(),
    title,
    description,
    priority,
    status: "todo",
    dueDate,
    dueTime,
    plannedDate,
    plannedTime,
    estimate: Number(estimate) || 0,
    repeat,
    spawned: false,
    spentMinutes: 0,
    completedAt: "",
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks();
  return task;
};

export const updateTask = (id, changes) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  Object.assign(task, changes);
  saveTasks();
};

// Повторяющаяся задача: когда её выполнили, создаём копию на следующую дату.
// Так все остальные части приложения продолжают работать с обычными задачами.
const spawnNext = task => {
  if (!task.repeat || task.repeat === "none" || task.spawned) return;

  const today = toDateStr(new Date());
  const base = task.plannedDate || task.dueDate || today;

  let next = nextOccurrence(task.repeat, base);
  while (next <= today) next = nextOccurrence(task.repeat, next); // не создаём задачи в прошлом

  const shift = diffDays(base, next);
  tasks.push({
    ...task,
    id: crypto.randomUUID(),
    status: "todo",
    completedAt: "",
    spawned: false,
    spentMinutes: 0,
    createdAt: new Date().toISOString(),
    plannedDate: next,
    dueDate: task.dueDate ? addDays(task.dueDate, shift) : "",
  });
  task.spawned = true; // повторное "выполнено" после reopen копию не дублирует
};

export const changeTodoStatus = (id, status) => {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  Object.assign(task, {
    status,
    completedAt: status === "done" ? new Date().toISOString() : "",
  });
  if (status === "done") spawnNext(task);
  saveTasks();
};

export const deleteTask = id => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;
  deletedTasks.push(tasks[index]);
  tasks.splice(index, 1);
  saveTasks();
  saveDeletedTasks();
};

export const deleteForever = id => {
  const index = deletedTasks.findIndex(t => t.id === id);
  if (index === -1) return;
  deletedTasks.splice(index, 1);
  saveDeletedTasks();
};

export const restoreFromTrash = id => {
  const index = deletedTasks.findIndex(t => t.id === id);
  if (index === -1) return;
  tasks.push(deletedTasks[index]);
  deletedTasks.splice(index, 1);
  saveTasks();
  saveDeletedTasks();
};