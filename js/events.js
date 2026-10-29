import { events, saveEvents } from "./storage.js";

const normalize = data => {
  const out = { ...data };
  if ("title" in out) out.title = out.title.trim();
  if ("place" in out) out.place = out.place.trim();
  if ("duration" in out) out.duration = Number(out.duration) || 60;
  return out;
};

export const createEvent = ({ title, date, time, duration, place = "", repeat = "none" }) => {
  if (!title.trim() || !date || !time) return;

  const event = {
    id: crypto.randomUUID(),
    ...normalize({ title, date, time, duration, place, repeat }),
  };
  events.push(event);
  saveEvents();
  return event;
};

export const updateEvent = (id, changes) => {
  const event = events.find(e => e.id === id);
  if (!event) return;
  Object.assign(event, normalize(changes));
  saveEvents();
};

// у повторяющегося события удаляется вся серия
export const deleteEvent = id => {
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return;
  events.splice(index, 1);
  saveEvents();
};