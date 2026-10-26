import { tasks } from "../storage.js";
import { changeTodoStatus, deleteTask } from "../tasks.js";
import { statusLabels, nextStatus, sortTasks, formatDate } from "../utils.js";
import { renderAll } from "../app.js";
import { openTaskModal } from "./modal.js";

const todoBox = document.querySelector(".dashboard__todo_tasks");
const progressBox = document.querySelector(".dashboard__progress_tasks");
const doneBox = document.querySelector(".dashboard__done_tasks");

const countTodo = document.querySelector(".quantity-todo");
const countProgress = document.querySelector(".quantity-in_progress");
const countDone = document.querySelector(".quantity-done");

const createFirstTaskButton = () => {
  const wrapper = document.createElement("div");
  wrapper.classList.add("dashboard__task-create");
  wrapper.innerHTML = `
    <button id="create__task-button" class="create__task-button">Create first task</button>
  `;
  wrapper.querySelector("button").addEventListener("click", () => openTaskModal());
  return wrapper;
};

const addTask = taskObj => {
  const card = document.createElement("div");
  const priority = (taskObj.priority || "middle").toLowerCase();
  card.classList.add("task-container", `priority-${priority}`);

  card.innerHTML = `
    <div class="task-priority"></div>
    <h3 class="task-title"></h3>
    <p class="task-description"></p>

    <div class="task-date-box">
      <p class="date-title">Created</p>
      <p class="date-title">Deadline</p>
      <data class="task-create-data"></data>
      <data class="task-deadline-data"></data>
    </div>

    <div class="task-actions">
      <button class="task-btn status-btn">
        <svg class="ico" stroke="#fff" style="width:14px;height:14px" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l12 8-12 8z"></path></svg>
        <span class="status-text"></span>
      </button>
      <button class="task-btn edit-btn">Edit</button>
      <button class="task-btn delete-btn">Delete</button>
    </div>
  `;

  // пользовательский текст только через textContent (защита от XSS)
  card.querySelector(".task-priority").textContent = taskObj.priority;
  card.querySelector(".task-title").textContent = taskObj.title;
  card.querySelector(".task-description").textContent = taskObj.description;
  card.querySelector(".status-text").textContent = statusLabels[taskObj.status];

  const createdEl = card.querySelector(".task-create-data");
  createdEl.value = taskObj.createdAt;
  createdEl.textContent = formatDate(taskObj.createdAt);

  const deadlineEl = card.querySelector(".task-deadline-data");
  deadlineEl.value = taskObj.dueDate;
  deadlineEl.textContent = formatDate(taskObj.dueDate);

  card.querySelector(".status-btn").addEventListener("click", () => {
    changeTodoStatus(taskObj.id, nextStatus[taskObj.status]);
    renderAll();
  });

  card.querySelector(".edit-btn").addEventListener("click", () => {
    openTaskModal(taskObj.id);
  });

  card.querySelector(".delete-btn").addEventListener("click", () => {
    deleteTask(taskObj.id);
    renderAll();
  });

  return card;
};

export const renderBoard = () => {
  todoBox.innerHTML = "";
  progressBox.innerHTML = "";
  doneBox.innerHTML = "";

  if (tasks.length === 0) {
    todoBox.append(createFirstTaskButton());
  } else {
    sortTasks(tasks).forEach(task => {
      if (task.status === "todo") todoBox.append(addTask(task));
      else if (task.status === "inProgress") progressBox.append(addTask(task));
      else if (task.status === "done") doneBox.append(addTask(task));
    });
  }

  const count = status => tasks.filter(t => t.status === status).length;
  countTodo.textContent = count("todo");
  countProgress.textContent = count("inProgress");
  countDone.textContent = count("done");
};