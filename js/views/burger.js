const MOBILE = window.matchMedia("(max-width: 900px)");

export const initBurger = () => {
  const sidebar = document.querySelector(".sidebar");
  const nav = document.querySelector(".dashboard__nav");
  const tabs = document.querySelector(".dashboard__menu");
  const logo = sidebar.querySelector(".logo");

  sidebar.id = "sidebar";

  // верхняя панель с бургером
  const topbar = document.createElement("header");
  topbar.className = "topbar";
  topbar.innerHTML = `
    <button class="burger" type="button" aria-label="Открыть меню"
            aria-expanded="false" aria-controls="sidebar">
      <span></span><span></span><span></span>
    </button>
    <span class="topbar__title">Task manager</span>
  `;
  const burger = topbar.querySelector(".burger");

  // затемнение
  const backdrop = document.createElement("div");
  backdrop.className = "backdrop";

  // крестик внутри меню
  const closeBtn = document.createElement("button");
  closeBtn.className = "sidebar__close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Закрыть меню");
  closeBtn.textContent = "×";
  sidebar.prepend(closeBtn);

  document.body.prepend(backdrop);
  document.body.prepend(topbar);

  const setOpen = open => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  };

  burger.addEventListener("click", () =>
    setOpen(!document.body.classList.contains("menu-open")),
  );
  closeBtn.addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") setOpen(false);
  });

  // выбрал вкладку в меню, оно закрылось
  sidebar.addEventListener("click", e => {
    if (e.target.closest(".dashboard__item")) setOpen(false);
  });

  // на мобильном вкладки лежат в меню, на десктопе возвращаются в шапку
  const placeTabs = () => {
    if (MOBILE.matches) logo.after(tabs);
    else nav.prepend(tabs);
    setOpen(false);
  };

  MOBILE.addEventListener("change", placeTabs);
  placeTabs();
};