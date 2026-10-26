import { registerRenderer, renderAll } from "./app.js";
import { renderBoard } from "./views/board.js";
import { renderTrash } from "./views/trash.js";
import { renderOverview } from "./views/overview.js";
import { openTaskModal } from "./views/modal.js";
import { initSidebar } from "./views/sidebar.js";
import { initTabs } from "./views/tabs.js";
import { initBurger } from "./views/burger.js";

registerRenderer(renderBoard);
registerRenderer(renderTrash);
registerRenderer(renderOverview);

initSidebar();
initTabs();
initBurger();

document
  .querySelector(".create_task-btn")
  .addEventListener("click", () => openTaskModal());

renderAll();

// раз в минуту двигаем красную линию "сейчас"
setInterval(renderOverview, 60000);