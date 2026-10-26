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

export const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

export const saveDeletedTasks = () => {
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
};

export const saveEvents = () => {
  localStorage.setItem("events", JSON.stringify(events));
};