export const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

// локальная дата "YYYY-MM-DD" 
export const toDateStr = date => {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
};

// "2026-10-26" -> Date в локальном времени 
export const parseDate = str => {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (str, n) => {
  const d = parseDate(str);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};

// сколько дней от from до to 
export const diffDays = (from, to) =>
  Math.round((parseDate(to) - parseDate(from)) / 86400000);

// тот же день следующего месяца (31 января -> 28/29 февраля)
export const addMonth = str => {
  const d = parseDate(str);
  const day = d.getDate();
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, last));
  return toDateStr(next);
};

// "14:30" -> 870 минут от полуночи
export const timeToMin = time => {
  const [h, m] = String(time).split(":").map(Number);
  return h * 60 + (m || 0);
};

// 870 -> "14:30"
export const minToTime = min =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;