import { deletedTasks } from "../storage.js";
import { deleteForever, restoreFromTrash } from "../tasks.js";
import { renderAll } from "../app.js";

const trashList = document.querySelector(".sittings-trash-list");

export const renderTrash = () => {
  trashList.innerHTML = "";

  deletedTasks.forEach(task => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span class="trash-title"></span>
      <button class="restore-btn">restore</button>
      <button class="delete-trash-btn">delete</button>
    `;
    item.querySelector(".trash-title").textContent = task.title;

    item.querySelector(".restore-btn").addEventListener("click", () => {
      restoreFromTrash(task.id);
      renderAll();
    });

    item.querySelector(".delete-trash-btn").addEventListener("click", () => {
      deleteForever(task.id);
      renderAll();
    });

    trashList.append(item);
  });
};