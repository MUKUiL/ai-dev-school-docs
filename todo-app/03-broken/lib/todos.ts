// ToDo のデータと、保存・読み込み。
// 画面（コンポーネント）からは切り離してある。
// 理由：この部分だけならブラウザなしでテストできるため（1-2-8 で使う）。

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export const STORAGE_KEY = "todo-app";

/** id を採番する。Date.now() だけだと同じミリ秒で衝突するので乱数を足す。 */
export function newId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/** 空文字・空白だけを弾く。追加してよければ Todo を返し、だめなら null。 */
export function createTodo(text: string): Todo | null {
  if (text === "") return null;
  return { id: newId(), text: text, done: false };
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

export function deleteTodo(todos: Todo[], id: string): Todo[] {
  return todos.filter((t) => t.id !== id);
}

/** 「未完了 N 件 / 全 M 件」を組み立てる。 */
export function countLabel(todos: Todo[]): string {
  const remaining = todos.filter((t) => t.done).length;
  return `未完了 ${remaining} 件 / 全 ${todos.length} 件`;
}

// ---- localStorage ----
// localStorage はブラウザの機能なので、サーバー側では存在しない。
// 呼び出し側（'use client' のコンポーネント）から、画面が出たあとに呼ぶ。

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Todo[]) : [];
  } catch {
    // 壊れた値が入っていたら空から始める
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
