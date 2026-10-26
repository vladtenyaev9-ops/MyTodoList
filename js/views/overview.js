import { tasks, events } from "../storage.js";
import { changeTodoStatus } from "../tasks.js";
import { deleteEvent } from "../events.js";
import { renderAll } from "../app.js";
import {
  el, plural, formatDate, formatDuration,
  statusLabels, nextStatus, sortTasks,
} from "../utils.js";
import {
  getTodayStr, toDateStr, getPlannedFor, getInProgress,
  getOverdue, getOverdueDays, getDoneThisWeek, countForDate,
} from "../selectors.js";
import { openTaskModal, openEventModal } from "./modal.js";

const $ = selector => document.querySelector(selector);
const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// день, выбранный в блоке "Неделя"
let selectedDate = getTodayStr();

$(".ov-add-event").addEventListener("click", () => openEventModal(selectedDate));

const priorityKey = task => (task.priority || "middle").toLowerCase();

// ---------- статистика ----------
const setStat = (name, value, note) => {
  const card = $(`[data-stat="${name}"]`);
  card.querySelector(".ov-stat-value").textContent = value;
  card.querySelector(".ov-stat-note").textContent = note;
};

// ---------- что происходит в день: события + дедлайны ----------
const getDayItems = date => {
  const items = [];

  events
    .filter(e => e.date === date)
    .forEach(e =>
      items.push({
        kind: "event",
        id: e.id,
        time: e.time,
        title: e.title,
        sub: formatDuration(e.duration) + (e.place ? ` · ${e.place}` : ""),
      }),
    );

  tasks
    .filter(t => t.dueDate === date && t.status !== "done")
    .forEach(t =>
      items.push({
        kind: "deadline",
        id: t.id,
        time: t.dueTime || "",
        title: `Дедлайн: ${t.title}`,
        sub: `задача · ${t.priority}`,
      }),
    );

  // без времени уходят в конец
  return items.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
};

// ---------- блок "Сегодня" ----------
const dueLabel = task => {
  if (!task.dueDate) return "";
  if (task.dueDate === selectedDate) {
    return task.dueTime ? `до ${task.dueTime}` : "сегодня";
  }
  return `до ${formatDate(task.dueDate)}`;
};

const createTodayRow = task => {
  const row = el("div", "ov-row");

  const check = el("input", "ov-check");
  check.type = "checkbox";
  check.addEventListener("change", () => {
    changeTodoStatus(task.id, "done");
    renderAll();
  });

  const info = el("div", "ov-row-info");
  info.append(el("div", "ov-row-title", task.title), el("div", "ov-row-sub", task.description));
  info.addEventListener("click", () => openTaskModal(task.id));

  const badge = el("span", `badge badge-${priorityKey(task)}`, task.priority);
  const due = el("span", "ov-row-time", dueLabel(task));

  const btn = el("button", "ov-btn", statusLabels[task.status]);
  btn.addEventListener("click", () => {
    changeTodoStatus(task.id, nextStatus[task.status]);
    renderAll();
  });

  row.append(check, info, badge, due, btn);
  return row;
};

const renderToday = () => {
  const list = $(".ov-today-list");
  list.innerHTML = "";

  const planned = sortTasks(getPlannedFor(selectedDate));
  $(".ov-today-count").textContent = planned.length;
  $(".ov-today-title").textContent =
    selectedDate === getTodayStr()
      ? "Сегодня"
      : new Date(selectedDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

  if (planned.length === 0) {
    list.append(el("p", "ov-empty", "На этот день задач нет"));
    return;
  }
  planned.forEach(task => list.append(createTodayRow(task)));
};

// ---------- блок "В процессе" ----------
const createProgressCard = task => {
  const card = el("div", `ov-progress is-${priorityKey(task)}`);

  const top = el("div", "ov-progress-top");
  top.append(el("span", `badge badge-${priorityKey(task)}`, task.priority));
  const late = getOverdueDays(task);
  if (late > 0) {
    top.append(el("span", "ov-late", `Просрочено на ${late} ${plural(late, ["день", "дня", "дней"])}`));
  }

  const dates = el("div", "ov-dates");
  const created = el("div");
  created.append(el("small", "", "Created"), el("b", "", formatDate(task.createdAt)));
  const deadline = el("div");
  deadline.append(el("small", "", "Deadline"), el("b", "", formatDate(task.dueDate)));
  dates.append(created, deadline);

  const finish = el("button", "ov-btn", statusLabels[task.status]);
  finish.addEventListener("click", () => {
    changeTodoStatus(task.id, nextStatus[task.status]);
    renderAll();
  });
  const edit = el("button", "ov-btn light", "Edit");
  edit.addEventListener("click", () => openTaskModal(task.id));
  const actions = el("div", "ov-actions");
  actions.append(finish, edit);

  card.append(top, el("h3", "", task.title), el("p", "", task.description), dates, actions);
  return card;
};

const renderProgress = () => {
  const list = $(".ov-progress-list");
  list.innerHTML = "";

  const inProgress = sortTasks(getInProgress());
  $(".ov-progress-count").textContent = inProgress.length;

  if (inProgress.length === 0) {
    list.append(el("p", "ov-empty", "Нет задач в процессе"));
    return;
  }
  inProgress.forEach(task => list.append(createProgressCard(task)));
};

// ---------- блок "События" ----------
const createNowLine = time => el("div", "ov-now", time);

const createEventRow = (item, isPast) => {
  const row = el("div", `ov-event${isPast ? " past" : ""}`);
  const body = el("div", "ov-event-body");
  body.append(el("div", "ov-event-title", item.title), el("div", "ov-event-sub", item.sub));

  row.append(el("div", "ov-event-time", item.time || "весь день"), el("span", "ov-event-dot"), body);

  if (item.kind === "event") {
    const del = el("button", "ov-event-del", "×");
    del.addEventListener("click", () => {
      deleteEvent(item.id);
      renderAll();
    });
    row.append(del);
  }
  return row;
};

const renderEvents = () => {
  const list = $(".ov-events-list");
  list.innerHTML = "";

  const items = getDayItems(selectedDate);
  $(".ov-events-count").textContent = items.length;

  if (items.length === 0) {
    list.append(el("p", "ov-empty", "Событий нет"));
    return;
  }

  const isToday = selectedDate === getTodayStr();
  const now = new Date().toTimeString().slice(0, 5); // "14:05"
  let nowDrawn = !isToday;

  items.forEach(item => {
    if (!nowDrawn && item.time && item.time > now) {
      list.append(createNowLine(now));
      nowDrawn = true;
    }
    list.append(createEventRow(item, isToday && item.time && item.time <= now));
  });

  if (!nowDrawn) list.append(createNowLine(now)); // все события уже прошли
};

// ---------- блок "Неделя" ----------
const renderWeek = () => {
  const box = $(".ov-week");
  box.innerHTML = "";

  const now = new Date();
  const offset = (now.getDay() + 6) % 7; // дней с понедельника

  DAY_NAMES.forEach((name, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset + i);
    const str = toDateStr(date);

    const btn = el("button", `ov-day${str === selectedDate ? " active" : ""}`);
    const dots = el("span", "ov-dots");
    for (let n = 0; n < Math.min(countForDate(str), 3); n++) dots.append(el("i"));

    btn.append(el("span", "ov-day-name", name), el("span", "ov-day-num", String(date.getDate())), dots);
    btn.addEventListener("click", () => {
      selectedDate = str;
      renderOverview();
    });
    box.append(btn);
  });
};

// ---------- главная функция ----------
export const renderOverview = () => {
  const today = getTodayStr();
  const plannedToday = getPlannedFor(today);
  const eventsToday = getDayItems(today).length;
  const inProgress = getInProgress();
  const overdue = getOverdue();

  const dateText = new Date().toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long",
  });
  $(".ov-subtitle").textContent =
    dateText.charAt(0).toUpperCase() + dateText.slice(1) +
    ` · на сегодня ${plannedToday.length} ${plural(plannedToday.length, ["задача", "задачи", "задач"])}` +
    ` и ${eventsToday} ${plural(eventsToday, ["событие", "события", "событий"])}`;

  const high = plannedToday.filter(t => t.priority === "HIGH").length;
  setStat("today", plannedToday.length, `высокий приоритет: ${high}`);
  setStat("progress", inProgress.length, inProgress[0] ? inProgress[0].title : "нет задач");
  setStat("overdue", overdue.length, overdue.length ? "нужно обновить дедлайн" : "всё вовремя");
  setStat("done", getDoneThisWeek().length, "за эту неделю");

  renderToday();
  renderProgress();
  renderEvents();
  renderWeek();
};