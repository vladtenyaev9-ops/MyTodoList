import { parseDate, addDays, diffDays, addMonth } from "./dates.js";

export const REPEAT_OPTIONS = [
  ["none", "Не повторять"],
  ["daily", "Каждый день"],
  ["weekdays", "По будням"],
  ["weekly", "Раз в неделю"],
  ["monthly", "Раз в месяц"],
];

// выпадает ли повторяющийся элемент (начало start) на день date
export const occursOn = (start, repeat, date) => {
  if (!start || date < start) return false;

  switch (repeat) {
    case "daily":
      return true;
    case "weekdays": {
      const wd = parseDate(date).getDay(); // 0 = воскресенье
      return wd >= 1 && wd <= 5;
    }
    case "weekly":
      return diffDays(start, date) % 7 === 0;
    case "monthly":
      return parseDate(date).getDate() === parseDate(start).getDate();
    default:
      return date === start;
  }
};

// следующая дата повтора строго после from
export const nextOccurrence = (repeat, from) => {
  switch (repeat) {
    case "daily":
      return addDays(from, 1);
    case "weekdays": {
      let next = addDays(from, 1);
      while ([0, 6].includes(parseDate(next).getDay())) next = addDays(next, 1);
      return next;
    }
    case "weekly":
      return addDays(from, 7);
    case "monthly":
      return addMonth(from);
    default:
      return null;
  }
};