import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAll,
  getUpdatedAt,
  replaceAll,
  setSyncHook,
} from "./storage.js";
import { renderAll } from "./app.js";

// ВСТАВЬ СВОЁ из консоли Firebase

const firebaseConfig = {
  apiKey: "AIzaSyCjaK6nOn1qBg7B0QXL3FNonsoaVcWzk0c",
  authDomain: "my-todo-71475.firebaseapp.com",
  projectId: "my-todo-71475",
  appId: "1:479508239782:web:a1666b609b6083adb5eb67",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uid = null;
let stopListening = null;
let timer = null;

// отправить локальные данные в облако (с паузой, чтобы не слать на каждый клик)
const push = () => {
  if (!uid) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const data = JSON.parse(JSON.stringify(getAll()));
    setDoc(doc(db, "users", uid), { ...data, updatedAt: getUpdatedAt() }).catch(
      console.error,
    );
  }, 600);
};

// любое сохранение в storage.js теперь вызывает push
setSyncHook(push);

// слушаем облако: если на другом устройстве что-то изменили, получаем тут
const startSync = () => {
  stopListening = onSnapshot(doc(db, "users", uid), snap => {
    if (snap.metadata.hasPendingWrites) return; // это наша собственная запись

    const remote = snap.data();
    if (!remote) {
      push(); // новый аккаунт: загружаем то, что уже есть на устройстве
      return;
    }

    const local = getUpdatedAt();
    if (remote.updatedAt > local) {
      replaceAll(remote, remote.updatedAt); // в облаке новее
      renderAll();
    } else if (remote.updatedAt < local) {
      push(); // на устройстве новее
    }
  });
};

const stopSync = () => {
  if (stopListening) stopListening();
  stopListening = null;
  clearTimeout(timer);
};

export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = async () => {
  await signOut(auth);
  replaceAll({}, 0); // чистим данные на этом устройстве (в облаке они остаются)
  renderAll();
};

export const watchUser = callback =>
  onAuthStateChanged(auth, user => {
    stopSync();
    uid = user ? user.uid : null;
    if (user) startSync();
    callback(user);
  });