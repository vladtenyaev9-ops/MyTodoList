const loadTasks = () => {
  const saved = localStorage.getItem("tasks");
  return saved ? JSON.parse(saved) : [];
};

const tasks = loadTasks();

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const loadDeletedTasks = () => {
  const saved = localStorage.getItem("deletedTasks");
  return saved ? JSON.parse(saved) : [];
};

const deletedTasks = loadDeletedTasks();

const saveDeletedTasks = () => {
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
};

const createTodo = (title, description, priority, dueDate) => {
  if (!title.trim() || !description.trim()) {
    return;
  }

  const task = {
    id: crypto.randomUUID(),
    title: title,
    description: description,
    priority: priority,
    status: "todo",
    dueDate: dueDate,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  saveTasks();
  return task;
};

const taskTodoContainer = document.querySelector(".dashboard__todo_tasks");
const taskInProgtessContainer = document.querySelector(
  ".dashboard__progress_tasks",
);
const taskDoneContainer = document.querySelector(".dashboard__done_tasks");

const deleteTask = id => {
  const index = tasks.findIndex(task => task.id === id);

  if (index !== -1) {
    deletedTasks.push(tasks[index]);
    tasks.splice(index, 1);
    saveTasks();
    saveDeletedTasks();
    render();
    renderTrash();
  }
};

console.log(deletedTasks);

const addTask = taskObj => {
  const task = document.createElement("div");

  const statusLabels = {
    todo: "Start",
    inProgress: "Finish",
    done: "Reopen",
  };

  const nextStatus = {
    todo: "inProgress",
    inProgress: "done",
    done: "todo",
  };
  task.classList.add(
    "task-container",
    `priority-${taskObj.priority.toLowerCase()}`,
  );
  const formatDate = iso => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU"); // 19.10.2026
  };
  task.innerHTML = `
  <div class="task-priority">${taskObj.priority}</div>
  <h3 class="task-title">${taskObj.title}</h3>
  <p class="task-description">${taskObj.description}</p>

  <div class="task-date-box">
  <p class="date-title">Created</p>
  <p class="date-title">Deadline</p>
 <data class="task-create-data" value="${taskObj.createdAt}">${formatDate(taskObj.createdAt)}</data>
<data class="task-deadline-data" value="${taskObj.dueDate}">${formatDate(taskObj.dueDate)}</data>
  </div>

  <div class="task-actions">
    <button class="task-btn status-btn">
    <svg class="ico"  stroke="#fff" style="width:14px;height:14px" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l12 8-12 8z"></path></svg> 
    ${statusLabels[taskObj.status]}</button>
    <button class="task-btn edit-btn">Edit</button>
    <button class="task-btn delete-btn">Delete</button>
  </div>
`;

  task.querySelector(".status-btn").addEventListener("click", e => {
    e.stopPropagation();
    changeTodoStatus(taskObj.id, nextStatus[taskObj.status]);
  });

  task.querySelector(".edit-btn").addEventListener("click", e => {
    e.stopPropagation();
    openTaskModal(taskObj.id);
  });

  task.querySelector(".delete-btn").addEventListener("click", e => {
    e.stopPropagation();
    deleteTask(taskObj.id);
  });
  return task;
};

document
  .querySelector(".create_task-btn")
  .addEventListener("click", () => openTaskModal());

const createFirstTaskButton = () => {
  const button = document.createElement("div");
  button.classList.add("dashboard__task-create");
  button.innerHTML = `
     <button id="create__task-button" class="create__task-button">Create first task</button>
    `;
  return button;
};

const changeTodoStatus = (id, status) => {
  const currentTask = tasks.find(task => task.id === id);
  if (currentTask) {
    currentTask.status = status;
    saveTasks();
    render();
  }
};

/// Modal window

const openTaskModal = id => {
  const currentTask = id ? tasks.find(task => task.id === id) : null;
  const isEdit = Boolean(currentTask);

  const overlay = document.createElement("div");
  overlay.classList.add("modal-overlay");
  overlay.innerHTML = `
    <div class="modal">
      <h3>${isEdit ? "Edit task" : "Create task"}</h3>
      <form>
        <input class="title_of_task" type="text" placeholder="title" />
        <input class="description_of_task" type="text" placeholder="description" />
        <select class="priority_of_task">
          <option value="LOW">LOW</option>
          <option value="MIDDLE" selected>MIDDLE</option>
          <option value="HIGH">HIGH</option>
        </select>
        <input class="deadline_of_task" type="date" />
        <button type="submit">${isEdit ? "Save" : "Create"}</button>
        <button type="button" class="modal-close">Cancel</button>
      </form>
    </div>
  `;

  const form = overlay.querySelector("form");
  const titleInput = form.querySelector(".title_of_task");
  const descriptionInput = form.querySelector(".description_of_task");
  const priorityInput = form.querySelector(".priority_of_task");
  const deadlineInput = form.querySelector(".deadline_of_task");
  const searchInput = document.querySelector(".sidebar__search-input");

  //// Поиск , надо пожнятьь. как сделать помтсе потмкчьл  я не хга ю сеймсеп

  if (isEdit) {
    titleInput.value = currentTask.title;
    descriptionInput.value = currentTask.description;
    priorityInput.value = currentTask.priority;
    deadlineInput.value = currentTask.dueDate;
  }

  const closeModal = () => overlay.remove();

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!titleInput.value.trim() || !descriptionInput.value.trim()) {
      titleInput.placeholder = "Обязательное значение";
      descriptionInput.placeholder = "Обязательное значение";
      return;
    }

    if (isEdit) {
      currentTask.title = titleInput.value;
      currentTask.description = descriptionInput.value;
      currentTask.priority = priorityInput.value;
      currentTask.dueDate = deadlineInput.value;
      saveTasks();
    } else {
      createTodo(
        titleInput.value,
        descriptionInput.value,
        priorityInput.value,
        deadlineInput.value,
      );
    }

    closeModal();
    render();
  });

  form.querySelector(".modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeModal();
  });

  document.body.append(overlay);
};

/// NNNNKYCJGVKLJHBLJ???
// если statud === todo or === inProgres === done
// find index or mb sm else
// status task[index].status and if status === todo then === todo-lidt
//else  inProgress-list else done-list
const render = () => {
  taskTodoContainer.innerHTML = "";
  taskInProgtessContainer.innerHTML = "";
  taskDoneContainer.innerHTML = "";

  if (tasks.length > 0) {
    const priorityOrder = { HIGH: 0, MIDDLE: 1, LOW: 2 };

    const getTime = task =>
      task.dueDate ? new Date(task.dueDate).getTime() : Infinity;

    const sorted = [...tasks].sort((a, b) => {
      const byDate = getTime(a) - getTime(b);
      if (byDate !== 0) return byDate;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    sorted.forEach(task => {
      if (task.status === "todo") {
        taskTodoContainer.append(addTask(task));
      } else if (task.status === "inProgress") {
        taskInProgtessContainer.append(addTask(task));
      } else if (task.status === "done") {
        taskDoneContainer.append(addTask(task));
      }
    });
  } else {
    const wrapper = createFirstTaskButton();
    wrapper
      .querySelector("button")
      .addEventListener("click", () => openTaskModal());
    taskTodoContainer.append(wrapper);
  }
};

render();

/// slidebar

const slideBarList = document.querySelector(".sidebar__menu-list");
const mainPage = document.querySelector(".sidebar__menu-profile");
const sittingsPage = document.querySelector(".sidebar__menu-sittings");
const sittings = document.querySelector(".sittings");
const trashList = document.querySelector(".sittings-trash-list");
const trashButoon = document.querySelector(".sittings_trash");

mainPage.addEventListener("click", () => {
  mainPage.classList.add("active");
  slideBarList.classList.add("active");
  sittings.classList.remove("active");
  sittingsPage.classList.remove("active");
});

sittingsPage.addEventListener("click", () => {
  sittings.classList.add("active");
  slideBarList.classList.remove("active");
  mainPage.classList.remove("active");
  sittingsPage.classList.add("active");
});

trashButoon.addEventListener("click", () => {
  trashButoon.classList.toggle("active");
  trashList.classList.toggle("active");
});

////

const renderTrash = () => {
  trashList.innerHTML = "";
  deletedTasks.forEach(task => {
    const item = document.createElement("li");
    item.innerHTML = `
      ${task.title}
      <button class="restore-btn">restore</button>
      <button class="delete-trash-btn">delete</button>
    `;

    item.querySelector(".delete-trash-btn").addEventListener("click", () => {
      deleteForTrash(task.id);
    });

    item.querySelector(".restore-btn").addEventListener("click", () => {
      restoreFromTrash(task.id);
    });

    trashList.append(item);
  });
};

const deleteForTrash = id => {
  const index = deletedTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    deletedTasks.splice(index, 1);
    saveDeletedTasks();
    renderTrash();
  }
};

const restoreFromTrash = id => {
  const index = deletedTasks.findIndex(task => task.id === id);
  if (index !== -1) {
    tasks.push(deletedTasks[index]);
    deletedTasks.splice(index, 1);
    saveTasks();
    saveDeletedTasks();
    render();
    renderTrash();
  }
};

renderTrash();
