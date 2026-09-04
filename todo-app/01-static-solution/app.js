// ToDo リスト（静的版 ＋ 絞り込み）
// 1-1-1 の 3-2「機能追加ミニ演習」の解答例
// データの形： { id: string, text: string, done: boolean } の配列

const STORAGE_KEY = "todo-app";

// 画面の要素
const form = document.getElementById("add-form");
const input = document.getElementById("new-todo");
const listEl = document.getElementById("todo-list");
const counterEl = document.getElementById("counter");
const emptyEl = document.getElementById("empty");
const filtersEl = document.getElementById("filters");

// 画面に出しているデータ
let todos = load();

// いま選ばれている絞り込み： "all" | "active" | "done"
// これは「表示のしかた」であってデータではないので、localStorage には保存しない。
let filter = "all";

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

// ---- 絞り込み ----

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "done") return todos.filter((t) => t.done);
  return todos;
}

function setFilter(next) {
  filter = next;
  for (const btn of filtersEl.children) {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  }
  render();
}

// ---- 画面の描画 ----

function render() {
  listEl.innerHTML = "";

  const shown = visibleTodos();
  for (const todo of shown) {
    listEl.appendChild(createItem(todo));
  }

  // カウンタは絞り込みの影響を受けない。
  // 「いま何件残っているか」は、表示の切り替えで変わってはいけないため。
  const remaining = todos.filter((t) => !t.done).length;
  counterEl.textContent = `未完了 ${remaining} 件 / 全 ${todos.length} 件`;

  // 空の案内は「絞り込んだ結果が0件か」で出し分ける
  emptyEl.textContent =
    todos.length === 0
      ? "まだ ToDo がありません。上の入力欄から追加してください。"
      : "この条件に当てはまる ToDo はありません。";
  emptyEl.classList.toggle("hidden", shown.length > 0);
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

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-filter]");
  if (btn) setFilter(btn.dataset.filter);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (addTodo(input.value)) {
    input.value = "";
  }
  input.focus();
});

render();
