const load = key => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved).filter(Boolean) : [];
  } catch {
    return [];
  }
};

export const tasks = load("tasks");
export const deletedTasks = load("deletedTasks");
export const events = load("events");

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
  tasks.splice(0, tasks.length, ...(data.tasks || []));
  deletedTasks.splice(0, deletedTasks.length, ...(data.deletedTasks || []));
  events.splice(0, events.length, ...(data.events || []));

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
  localStorage.setItem("events", JSON.stringify(events));
  localStorage.setItem("updatedAt", String(updatedAt));
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