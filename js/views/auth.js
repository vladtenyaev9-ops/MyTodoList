import { signIn, logOut, watchUser } from "../cloud.js";

const ERRORS = {
  "auth/invalid-credential": "Неверный email или пароль",
  "auth/invalid-email": "Некорректный email",
  "auth/too-many-requests": "Слишком много попыток, подождите немного",
  "auth/network-request-failed": "Нет интернета",
};

export const initAuth = () => {
  const overlay = document.createElement("div");
  overlay.className = "auth-overlay";
  overlay.hidden = true; // покажем, только если не выполнен вход
  overlay.innerHTML = `
    <form class="auth-card">
      <h2>Task manager</h2>
      <p class="auth-sub">Личное приложение. Вход только для владельца.</p>
      <input class="auth-email" type="email" placeholder="email" autocomplete="email" required />
      <input class="auth-password" type="password" placeholder="пароль"
             autocomplete="current-password" required />
      <p class="auth-error"></p>
      <button type="submit" class="auth-btn">Войти</button>
    </form>
  `;
  document.body.append(overlay);

  const form = overlay.querySelector("form");
  const email = overlay.querySelector(".auth-email");
  const password = overlay.querySelector(".auth-password");
  const error = overlay.querySelector(".auth-error");
  const button = overlay.querySelector(".auth-btn");

  // кнопка "Выйти" рядом с Create
  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Выйти";
  logoutBtn.hidden = true;
  document.querySelector(".dashboard__searsh").prepend(logoutBtn);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    error.textContent = "";
    button.disabled = true;
    try {
      await signIn(email.value.trim(), password.value);
    } catch (err) {
      error.textContent = ERRORS[err.code] || "Не получилось, попробуйте ещё раз";
    } finally {
      button.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", () => {
    if (confirm("Выйти? Данные на этом устройстве будут очищены, в облаке они сохранены.")) {
      logOut();
    }
  });

  watchUser(user => {
    overlay.hidden = Boolean(user);
    logoutBtn.hidden = !user;
    if (user) {
      logoutBtn.title = user.email;
      form.reset();
    }
  });
};