import { tasks } from "../storage.js";
import { createTodo, updateTask } from "../tasks.js";
import { createEvent } from "../events.js";
import { getTodayStr } from "../selectors.js";
import { renderAll } from "../app.js";

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

const wireSwitch = (overlay, close, active) => {
  overlay.querySelectorAll(".switch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.type === active) return;
      close();
      if (btn.dataset.type === "event") openEventModal();
      else openTaskModal();
    });
  });
};

export const openTaskModal = id => {
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
      <button type="submit">${isEdit ? "Save" : "Create"}</button>
      <button type="button" class="modal-close">Cancel</button>
    </form>
  `);

  if (!isEdit) wireSwitch(overlay, close, "task");

  const form = overlay.querySelector("form");
  const titleInput = form.querySelector(".title_of_task");
  const descriptionInput = form.querySelector(".description_of_task");
  const priorityInput = form.querySelector(".priority_of_task");
  const deadlineInput = form.querySelector(".deadline_of_task");
  const deadlineTimeInput = form.querySelector(".deadline_time_of_task");
  const plannedInput = form.querySelector(".planned_of_task");

  if (isEdit) {
    titleInput.value = currentTask.title;
    descriptionInput.value = currentTask.description;
    priorityInput.value = currentTask.priority;
    deadlineInput.value = currentTask.dueDate || "";
    deadlineTimeInput.value = currentTask.dueTime || "";
    plannedInput.value = currentTask.plannedDate || "";
  } else {
    plannedInput.value = getTodayStr(); // по умолчанию "на сегодня"
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
    };

    if (isEdit) updateTask(id, data);
    else createTodo(data);

    close();
    renderAll();
  });
};

export const openEventModal = (defaultDate = getTodayStr()) => {
  const { overlay, close } = openOverlay(`
    ${switchHtml("event")}
    <h3>Create event</h3>
    <form>
      <input class="event_title" type="text" placeholder="title" required />
      <label>Date <input class="event_date" type="date" required /></label>
      <label>Time <input class="event_time" type="time" required /></label>
      <label>Duration (min)
        <input class="event_duration" type="number" min="5" step="5" value="60" />
      </label>
      <input class="event_place" type="text" placeholder="place (optional)" />
      <button type="submit">Create</button>
      <button type="button" class="modal-close">Cancel</button>
    </form>
  `);

  wireSwitch(overlay, close, "event");

  const form = overlay.querySelector("form");
  form.querySelector(".event_date").value = defaultDate;

  form.addEventListener("submit", event => {
    event.preventDefault();

    createEvent({
      title: form.querySelector(".event_title").value,
      date: form.querySelector(".event_date").value,
      time: form.querySelector(".event_time").value,
      duration: form.querySelector(".event_duration").value,
      place: form.querySelector(".event_place").value,
    });

    close();
    renderAll();
  });
};