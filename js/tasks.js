import {
  tasks,
  deletedTasks,
  saveTasks,
  saveDeletedTasks,
} from "./storage.js";

export const createTodo = ({
  title,
  description,
  priority,
  dueDate = "",
  dueTime = "",
  plannedDate = "",
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

export const changeTodoStatus = (id, status) => {
  updateTask(id, {
    status,
    completedAt: status === "done" ? new Date().toISOString() : "",
  });
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