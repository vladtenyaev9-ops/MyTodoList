import { registerRenderer, renderAll } from "./app.js";
import { renderBoard } from "./views/board.js";
import { renderTrash } from "./views/trash.js";
import { renderOverview } from "./views/overview.js";
import { renderCalendar } from "./views/calendar.js";
import { openTaskModal } from "./views/modal.js";
import { initSidebar } from "./views/sidebar.js";
import { initTabs } from "./views/tabs.js";
import { initBurger } from "./views/burger.js";
import { initAuth } from "./views/auth.js";

registerRenderer(renderBoard);
registerRenderer(renderTrash);
registerRenderer(renderOverview);
registerRenderer(renderCalendar);

initSidebar();
initTabs();
initBurger();

document
  .querySelector(".create_task-btn")
  .addEventListener("click", () => openTaskModal());

renderAll();
initAuth();

// раз в минуту двигаем красную линию "сейчас"
setInterval(() => {
  renderOverview();
  renderCalendar();
}, 60000);

// превращаем сайт в устанавливаемое приложение
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}