import { signIn, signUp, logOut, watchUser } from "../cloud.js";

const ERRORS = {
  "auth/invalid-credential": "Неверный email или пароль",
  "auth/invalid-email": "Некорректный email",
  "auth/email-already-in-use": "Этот email уже зарегистрирован, нажмите «Войти»",
  "auth/weak-password": "Пароль слишком короткий (минимум 6 символов)",
  "auth/too-many-requests": "Слишком много попыток, подождите немного",
  "auth/network-request-failed": "Нет интернета",
};

export const initAuth = () => {
  const overlay = document.createElement("div");
  overlay.className = "auth-overlay";
  overlay.hidden = true; // покажем, только если пользователь не вошёл
  overlay.innerHTML = `
    <form class="auth-card">
      <h2>Task manager</h2>
      <p class="auth-sub">Войдите, чтобы задачи синхронизировались между устройствами</p>
      <input class="auth-email" type="email" placeholder="email" autocomplete="email" required />
      <input class="auth-password" type="password" placeholder="пароль (от 6 символов)"
             autocomplete="current-password" minlength="6" required />
      <p class="auth-error"></p>
      <button type="submit" class="auth-btn">Войти</button>
      <button type="button" class="auth-btn light auth-signup">Создать аккаунт</button>
    </form>
  `;
  document.body.append(overlay);

  const form = overlay.querySelector("form");
  const email = overlay.querySelector(".auth-email");
  const password = overlay.querySelector(".auth-password");
  const error = overlay.querySelector(".auth-error");
  const buttons = overlay.querySelectorAll(".auth-btn");

  // кнопка "Выйти" рядом с Create
  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "logout-btn";
  logoutBtn.textContent = "Выйти";
  logoutBtn.hidden = true;
  document.querySelector(".dashboard__searsh").prepend(logoutBtn);

  const run = async action => {
    error.textContent = "";
    buttons.forEach(b => (b.disabled = true));
    try {
      await action(email.value.trim(), password.value);
    } catch (e) {
      error.textContent = ERRORS[e.code] || "Не получилось, попробуйте ещё раз";
    } finally {
      buttons.forEach(b => (b.disabled = false));
    }
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    run(signIn);
  });

  overlay.querySelector(".auth-signup").addEventListener("click", () => {
    if (form.reportValidity()) run(signUp);
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