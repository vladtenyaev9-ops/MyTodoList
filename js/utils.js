export const statusLabels = {
  todo: "Start",
  inProgress: "Finish",
  done: "Reopen",
};

export const nextStatus = {
  todo: "inProgress",
  inProgress: "done",
  done: "todo",
};

const priorityOrder = { HIGH: 0, MIDDLE: 1, LOW: 2 };

const getPriority = task =>
  priorityOrder[(task.priority || "").toUpperCase()] ?? 3;

const getDueTime = task =>
  task.dueDate ? new Date(task.dueDate).getTime() : Infinity;

// сначала по дедлайну, при равных датах по приоритету
export const sortTasks = list =>
  [...list].sort((a, b) => {
    const ta = getDueTime(a);
    const tb = getDueTime(b);
    if (ta !== tb) return ta < tb ? -1 : 1;
    return getPriority(a) - getPriority(b);
  });

export const formatDate = iso => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ru-RU");
};

// создать элемент с классом и текстом (текст безопасно, через textContent)
export const el = (tag, className = "", text = "") => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

// 1 задача, 2 задачи, 5 задач
export const plural = (n, [one, few, many]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

export const formatDuration = minutes =>
  minutes % 60 === 0 ? `${minutes / 60} ч` : `${minutes} мин`;