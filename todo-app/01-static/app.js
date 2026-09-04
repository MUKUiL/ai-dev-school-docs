// ToDo リスト（静的版）
// データの形： { id: string, text: string, done: boolean } の配列

const STORAGE_KEY = "todo-app";

// 画面の要素
const form = document.getElementById("add-form");
const input = document.getElementById("new-todo");
const listEl = document.getElementById("todo-list");
const counterEl = document.getElementById("counter");
const emptyEl = document.getElementById("empty");

// 画面に出しているデータ
let todos = load();

// ---- 保存と読み込み ----

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // 壊れた値が入っていたら、空から始める
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ---- データの操作 ----

// id を採番する。
// Date.now() だけだと、続けて追加したときに同じ値になり
// 削除で別の項目まで消える。乱数を足して衝突を避ける。
function newId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

function addTodo(text) {
  const trimmed = text.trim();
  if (trimmed === "") return false; // 空文字と空白だけは追加しない

  todos.push({
    id: newId(),
    text: trimmed,
    done: false,
  });
  save();
  render();
  return true;
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  todo.done = !todo.done;
  save();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
}

// ---- 画面の描画 ----

function render() {
  listEl.innerHTML = "";

  for (const todo of todos) {
    listEl.appendChild(createItem(todo));
  }

  const remaining = todos.filter((t) => !t.done).length;
  counterEl.textContent = `未完了 ${remaining} 件 / 全 ${todos.length} 件`;

  emptyEl.classList.toggle("hidden", todos.length > 0);
}

function createItem(todo) {
  const li = document.createElement("li");
  li.className = todo.done ? "todo-item done" : "todo-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const span = document.createElement("span");
  span.className = "text";
  span.textContent = todo.text; // textContent なので HTML として解釈されない

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "削除";
  del.addEventListener("click", () => deleteTodo(todo.id));

  li.append(checkbox, span, del);
  return li;
}

// ---- 起動 ----

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (addTodo(input.value)) {
    input.value = "";
  }
  input.focus();
});

render();
