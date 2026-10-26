import { events, saveEvents } from "./storage.js";

export const createEvent = ({ title, date, time, duration, place }) => {
  if (!title.trim() || !date || !time) return;

  const event = {
    id: crypto.randomUUID(),
    title: title.trim(),
    date, // "2026-10-26"
    time, // "15:30"
    duration: Number(duration) || 60,
    place: place.trim(),
  };
  events.push(event);
  saveEvents();
  return event;
};

export const deleteEvent = id => {
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return;
  events.splice(index, 1);
  saveEvents();
};