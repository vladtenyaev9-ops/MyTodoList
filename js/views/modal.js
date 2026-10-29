import { tasks, events } from "../storage.js";
import { createTodo, updateTask } from "../tasks.js";
import { createEvent, updateEvent, deleteEvent } from "../events.js";
import { getTodayStr } from "../selectors.js";
import { REPEAT_OPTIONS } from "../recurrence.js";
import { renderAll } from "../app.js";

// список "повтор" (значения берутся из констант, не от пользователя)
const repeatSelect = className => `
  <select class="${className}">
    ${REPEAT_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
  </select>
`;

// общий каркас: оверлей, закрытие по фону, Escape и кнопке Cancel
const openOverlay = html => {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `<div class="modal">${html}</div>`;

  const onKeydown = e => {
    if (e.key === "Escape") close();
  };
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKeydown);
  };

  overlay.addEventListener("click", e => {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".modal-close")?.addEventListener("click", close);
  document.addEventListener("keydown", onKeydown);
  document.body.append(overlay);

  return { overlay, close };
};

// переключатель Task / Event (только при создании)
const switchHtml = active => `
  <div class="modal-switch">
    <button type="button" class="switch-btn ${active === "task" ? "active" : ""}" data-type="task">Task</button>
    <button type="button" class="switch-btn ${active === "event" ? "active" : ""}" data-type="event">Event</button>
  </div>
`;

const wireSwitch = (overlay, close, active, preset) => {
  overlay.querySelectorAll(".switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.type === active) return;
      close();
      if (btn.dataset.type === "event") openEventModal({ date: preset.date, time: preset.time });
      else openTaskModal(null, preset);
    });
  });
};

// id - редактирование, preset { date, time } - значения для новой задачи
export const openTaskModal = (id, preset = {}) => {
  const currentTask = id ? tasks.find(t => t.id === id) : null;
  const isEdit = Boolean(currentTask);

  const { overlay, close } = openOverlay(`
    ${isEdit ? "" : switchHtml("task")}
    <h3>${isEdit ? "Edit task" : "Create task"}</h3>
    <form>
      <input class="title_of_task" type="text" placeholder="title" />
      <input class="description_of_task" type="text" placeholder="description" />
      <label>Priority
        <select class="priority_of_task">
          <option value="LOW">LOW</option>
          <option value="MIDDLE" selected>MIDDLE</option>
          <option value="HIGH">HIGH</option>
        </select>
      </label>
      <label>Deadline <input class="deadline_of_task" type="date" /></label>
      <label>Deadline time <input class="deadline_time_of_task" type="time" /></label>
      <label>Planned for <input class="planned_of_task" type="date" /></label>
      <label>Planned time <input class="planned_time_of_task" type="time" /></label>
      <label>Estimate (min)
        <input class="estimate_of_task" type="number" min="0" step="5" placeholder="например 30" />
      </label>
      <label>Repeat ${repeatSelect("repeat_of_task")}
        <small class="modal-hint">После выполнения появится новая копия на следующую дату</small>
      </label>
      <button type="submit">${isEdit ? "Save" : "Create"}</button>
      <button type="button" class="modal-close">Cancel</button>
    </form>
  `);

  if (!isEdit) wireSwitch(overlay, close, "task", preset);

  const form = overlay.querySelector("form");
  const titleInput = form.querySelector(".title_of_task");
  const descriptionInput = form.querySelector(".description_of_task");
  const priorityInput = form.querySelector(".priority_of_task");
  const deadlineInput = form.querySelector(".deadline_of_task");
  const deadlineTimeInput = form.querySelector(".deadline_time_of_task");
  const plannedInput = form.querySelector(".planned_of_task");
  const plannedTimeInput = form.querySelector(".planned_time_of_task");
  const estimateInput = form.querySelector(".estimate_of_task");
  const repeatInput = form.querySelector(".repeat_of_task");

  if (isEdit) {
    titleInput.value = currentTask.title;
    descriptionInput.value = currentTask.description;
    priorityInput.value = currentTask.priority;
    deadlineInput.value = currentTask.dueDate || "";
    deadlineTimeInput.value = currentTask.dueTime || "";
    plannedInput.value = currentTask.plannedDate || "";
    plannedTimeInput.value = currentTask.plannedTime || "";
    estimateInput.value = currentTask.estimate || "";
    repeatInput.value = currentTask.repeat || "none";
  } else {
    plannedInput.value = preset.date || getTodayStr(); // по умолчанию "на сегодня"
    plannedTimeInput.value = preset.time || "";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!titleInput.value.trim() || !descriptionInput.value.trim()) {
      titleInput.placeholder = "Обязательное значение";
      descriptionInput.placeholder = "Обязательное значение";
      return;
    }

    const data = {
      title: titleInput.value,
      description: descriptionInput.value,
      priority: priorityInput.value,
      dueDate: deadlineInput.value,
      dueTime: deadlineTimeInput.value,
      plannedDate: plannedInput.value,
      plannedTime: plannedTimeInput.value,
      estimate: Number(estimateInput.value) || 0,
      repeat: repeatInput.value,
    };

    if (isEdit) updateTask(id, data);
    else createTodo(data);

    close();
    renderAll();
  });
};

// arg: строка с датой (как раньше) или { id, date, time }
export const openEventModal = (arg = {}) => {
  const opts = typeof arg === "string" ? { date: arg } : arg || {};
  const current = opts.id ? events.find(e => e.id === opts.id) : null;
  const isEdit = Boolean(current);

  const { overlay, close } = openOverlay(`
    ${isEdit ? "" : switchHtml("event")}
    <h3>${isEdit ? "Edit event" : "Create event"}</h3>
    <form>
      <input class="event_title" type="text" placeholder="title" required />
      <label>Date <input class="event_date" type="date" required /></label>
      <label>Time <input class="event_time" type="time" required /></label>
      <label>Duration (min)
        <input class="event_duration" type="number" min="5" step="5" value="60" />
      </label>
      <input class="event_place" type="text" placeholder="place (optional)" />
      <label>Repeat ${repeatSelect("event_repeat")}</label>
      <button type="submit">${isEdit ? "Save" : "Create"}</button>
      <button type="button" class="modal-close">Cancel</button>
      ${isEdit ? '<button type="button" class="modal-delete">Delete</button>' : ""}
    </form>
  `);

  if (!isEdit) wireSwitch(overlay, close, "event", { date: opts.date, time: opts.time });

  const form = overlay.querySelector("form");
  const titleInput = form.querySelector(".event_title");
  const dateInput = form.querySelector(".event_date");
  const timeInput = form.querySelector(".event_time");
  const durationInput = form.querySelector(".event_duration");
  const placeInput = form.querySelector(".event_place");
  const repeatInput = form.querySelector(".event_repeat");

  if (isEdit) {
    titleInput.value = current.title;
    dateInput.value = current.date;
    timeInput.value = current.time;
    durationInput.value = current.duration;
    placeInput.value = current.place || "";
    repeatInput.value = current.repeat || "none";
  } else {
    dateInput.value = opts.date || getTodayStr();
    timeInput.value = opts.time || "";
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const data = {
      title: titleInput.value,
      date: dateInput.value,
      time: timeInput.value,
      duration: durationInput.value,
      place: placeInput.value,
      repeat: repeatInput.value,
    };

    if (isEdit) updateEvent(opts.id, data);
    else createEvent(data);

    close();
    renderAll();
  });

  form.querySelector(".modal-delete")?.addEventListener("click", () => {
    const text =
      current.repeat !== "none"
        ? "Удалить всю серию повторяющихся событий?"
        : "Удалить событие?";
    if (!confirm(text)) return;
    deleteEvent(opts.id);
    close();
    renderAll();
  });
};