export const initSidebar = () => {
  const slideBarList = document.querySelector(".sidebar__menu-list");
  const mainPage = document.querySelector(".sidebar__menu-profile");
  const sittingsPage = document.querySelector(".sidebar__menu-sittings");
  const sittings = document.querySelector(".sittings");
  const trashList = document.querySelector(".sittings-trash-list");
  const trashButton = document.querySelector(".sittings_trash");

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

  trashButton.addEventListener("click", () => {
    trashButton.classList.toggle("active");
    trashList.classList.toggle("active");
  });
};
