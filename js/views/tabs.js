export const showPage = name => {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === name);
  });
  document.querySelectorAll(".dashboard__item[data-page]").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.page === name);
  });
  localStorage.setItem("page", name);
};

export const initTabs = () => {
  document.querySelectorAll(".dashboard__item[data-page]").forEach(tab => {
    tab.addEventListener("click", () => showPage(tab.dataset.page));
  });

  // кнопки-ссылки "Все задачи", "Открыть доску"
  document.querySelectorAll("[data-goto]").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.goto));
  });

  // открываем последнюю страницу, если она ещё существует
  const saved = localStorage.getItem("page");
  const exists = saved && document.querySelector(`.page[data-page="${saved}"]`);
  showPage(exists ? saved : "overview");
};