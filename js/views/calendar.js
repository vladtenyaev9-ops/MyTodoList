import { el } from "../utils.js";
import { toDateStr, parseDate, MONTHS, minToTime } from "../dates.js";
import { getTodayStr, getDayBlocks, countForDate } from "../selectors.js";
import { assignLanes } from "../layout.js";
import { openTaskModal, openEventModal } from "./modal.js";

const $ = selector => document.querySelector(selector);

const HOUR_H = 56; // высота одного часа на шкале, px
const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// если в index.html ещё нет страницы календаря, просто ничего не делаем
const ready = Boolean($(".cal-grid"));

let selected = getTodayStr();
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

const fmtMin = min => {
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
};

const priorityKey = priority => (priority || "middle").toLowerCase();

// ---------- сетка месяца ----------
const renderMonth = () => {
  $(".cal-title").textContent = `${MONTHS[viewMonth]} ${viewYear}`;

  const grid = $(".cal-grid");
  grid.innerHTML = "";

  const first = new Date(viewYear, viewMonth, 1);
  const offset = (first.getDay() + 6) % 7; // сколько клеток до понедельника
  const today = getTodayStr();

  for (let i = 0; i < 42; i++) {
    const date = new Date(viewYear, viewMonth, 1 - offset + i);
    const str = toDateStr(date);

    const cell = el("button", "cal-cell");
    cell.type = "button";
    if (date.getMonth() !== viewMonth) cell.classList.add("other");
    if (str === today) cell.classList.add("today");
    if (str === selected) cell.classList.add("selected");

    const dots = el("span", "cal-dots");
    for (let n = 0; n < Math.min(countForDate(str), 3); n++) dots.append(el("i"));

    cell.append(el("span", "cal-num", String(date.getDate())), dots);
    cell.addEventListener("click", () => {
      selected = str;
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      renderCalendar();
    });
    grid.append(cell);
  }
};

// ---------- план дня по часам ----------
const renderDay = () => {
  const title = parseDate(selected).toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  $(".cal-day-title").textContent = title.charAt(0).toUpperCase() + title.slice(1);

  const { blocks, unscheduled, total } = getDayBlocks(selected);

  const load = $(".cal-day-load");
  const overloaded = total > 480;
  load.classList.toggle("warn", overloaded);
  load.textContent =
    total === 0
      ? "День свободен"
      : `Запланировано: ${fmtMin(total)}${overloaded ? " · день перегружен" : ""}`;

  // задачи без времени
  const unBox = $(".cal-unscheduled");
  unBox.innerHTML = "";
  if (unscheduled.length) {
    unBox.append(el("p", "cal-unscheduled-title", "Без времени"));
    const chips = el("div", "cal-chips");
    unscheduled.forEach(task => {
      const chip = el("button", `cal-chip p-${priorityKey(task.priority)}`, task.title);
      chip.type = "button";
      chip.addEventListener("click", () => openTaskModal(task.id));
      chips.append(chip);
    });
    unBox.append(chips);
  }

  // шкала: по умолчанию 8:00-22:00, расширяется, если дела выходят за рамки
  const laid = assignLanes(blocks);
  const startH = Math.min(8, ...laid.map(b => Math.floor(b.start / 60)));
  const endH = Math.min(24, Math.max(22, ...laid.map(b => Math.ceil(b.end / 60))));
  const rangeStart = startH * 60;

  const timeline = $(".cal-timeline");
  timeline.innerHTML = "";
  timeline.style.height = `${(endH - startH) * HOUR_H}px`;

  for (let h = startH; h <= endH; h++) {
    const row = el("div", "cal-hour");
    row.style.top = `${(h - startH) * HOUR_H}px`;
    row.append(el("span", "", `${String(h).padStart(2, "0")}:00`));
    timeline.append(row);
  }

  const area = el("div", "cal-blocks");

  // клик по свободному месту создаёт дело на это время (шаг 30 минут)
  area.addEventListener("click", e => {
    if (e.target !== area) return;
    const y = e.clientY - area.getBoundingClientRect().top;
    const min = rangeStart + Math.floor((y / HOUR_H) * 2) * 30;
    openTaskModal(null, { date: selected, time: minToTime(min) });
  });

  laid.forEach(b => {
    const classes = ["cal-block", b.kind];
    if (b.kind === "task") classes.push(`p-${priorityKey(b.priority)}`);
    if (b.done) classes.push("done");

    const block = el("button", classes.join(" "));
    block.type = "button";
    block.style.top = `${((b.start - rangeStart) / 60) * HOUR_H}px`;
    block.style.height = `${Math.max(((b.end - b.start) / 60) * HOUR_H - 2, 22)}px`;
    block.style.left = `${(b.lane / b.lanes) * 100}%`;
    block.style.width = `calc(${100 / b.lanes}% - 4px)`;

    const repeated = b.repeat && b.repeat !== "none" ? "↻ " : "";
    block.append(
      el("b", "", repeated + b.title),
      el("span", "", `${minToTime(b.start)}–${minToTime(b.end)}`),
    );
    block.addEventListener("click", e => {
      e.stopPropagation();
      if (b.kind === "event") openEventModal({ id: b.id });
      else openTaskModal(b.id);
    });
    area.append(block);
  });

  timeline.append(area);

  // красная линия "сейчас"
  if (selected === getTodayStr()) {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (nowMin >= rangeStart && nowMin <= endH * 60) {
      const line = el("div", "cal-now");
      line.style.top = `${((nowMin - rangeStart) / 60) * HOUR_H}px`;
      timeline.append(line);
    }
  }
};

export const renderCalendar = () => {
  if (!ready) return;
  renderMonth();
  renderDay();
};

// ---------- кнопки (вешаем один раз) ----------
const shiftMonth = delta => {
  const d = new Date(viewYear, viewMonth + delta, 1);
  viewYear = d.getFullYear();
  viewMonth = d.getMonth();
  renderCalendar();
};

if (ready) {
  $(".cal-weekdays").append(...WEEKDAYS.map(name => el("span", "", name)));
  $(".cal-prev").addEventListener("click", () => shiftMonth(-1));
  $(".cal-next").addEventListener("click", () => shiftMonth(1));
  $(".cal-today").addEventListener("click", () => {
    selected = getTodayStr();
    viewYear = new Date().getFullYear();
    viewMonth = new Date().getMonth();
    renderCalendar();
  });
  $(".cal-add").addEventListener("click", () => openTaskModal(null, { date: selected }));
}