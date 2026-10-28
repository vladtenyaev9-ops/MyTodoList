const PRIORITIES = ["LOW", "MIDDLE", "HIGH"];
const STATUSES = ["todo", "inProgress", "done"];

const str = v => (typeof v === "string" ? v : "");

const cleanTask = t => {
  const priority = String(t.priority).toUpperCase();
  return {
    ...t,
    id: str(t.id) || crypto.randomUUID(),
    title: str(t.title),
    description: str(t.description),
    priority: PRIORITIES.includes(priority) ? priority : "MIDDLE",
    status: STATUSES.includes(t.status) ? t.status : "todo",
    dueDate: str(t.dueDate),
    dueTime: str(t.dueTime),
    plannedDate: str(t.plannedDate),
    completedAt: str(t.completedAt),
    createdAt: str(t.createdAt),
  };
};

const cleanEvent = e => ({
  id: str(e.id) || crypto.randomUUID(),
  title: str(e.title),
  date: str(e.date),
  time: str(e.time),
  duration: Number(e.duration) || 60,
  place: str(e.place),
});

// превращает что угодно в безопасный массив
const toList = (value, clean) =>
  Array.isArray(value)
    ? value.filter(x => x && typeof x === "object").map(clean)
    : [];

const load = (key, clean) => {
  try {
    return toList(JSON.parse(localStorage.getItem(key)), clean);
  } catch {
    return [];
  }
};

export const tasks = load("tasks", cleanTask);
export const deletedTasks = load("deletedTasks", cleanTask);
export const events = load("events", cleanEvent);

// ---- синхронизация ----
let syncHook = () => {};
export const setSyncHook = fn => {
  syncHook = fn;
};

const touch = () => {
  localStorage.setItem("updatedAt", String(Date.now()));
  syncHook();
};

export const getUpdatedAt = () => Number(localStorage.getItem("updatedAt")) || 0;

export const getAll = () => ({ tasks, deletedTasks, events });

// подменить содержимое массивов (они общие для всех файлов, поэтому меняем "на месте")
export const replaceAll = (data, updatedAt) => {
  const safe = data && typeof data === "object" ? data : {};

  tasks.splice(0, tasks.length, ...toList(safe.tasks, cleanTask));
  deletedTasks.splice(0, deletedTasks.length, ...toList(safe.deletedTasks, cleanTask));
  events.splice(0, events.length, ...toList(safe.events, cleanEvent));

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
  localStorage.setItem("events", JSON.stringify(events));
  localStorage.setItem("updatedAt", String(Number(updatedAt) || 0));
};

// ---- сохранение ----
export const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  touch();
};

export const saveDeletedTasks = () => {
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
  touch();
};

export const saveEvents = () => {
  localStorage.setItem("events", JSON.stringify(events));
  touch();
};