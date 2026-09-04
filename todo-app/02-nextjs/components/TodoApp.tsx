"use client";
// 'use client' が要る理由：localStorage と useState を使うため。
// これが無いとサーバー側で動こうとして、localStorage が見つからず落ちる。

import { useEffect, useState } from "react";
import {
  type Todo,
  countLabel,
  createTodo,
  deleteTodo,
  loadTodos,
  saveTodos,
  toggleTodo,
} from "@/lib/todos";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  // 最初の描画はサーバーと同じ「空」から始める。
  // 読み込みが終わるまで一覧を出さないことで、表示のちらつきを避ける。
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveTodos(todos);
  }, [todos, loaded]);

  function handleAdd(text: string) {
    const todo = createTodo(text);
    if (!todo) return false; // 空文字・空白だけは追加しない
    setTodos((prev) => [...prev, todo]);
    return true;
  }

  return (
    <>
      <TodoInput onAdd={handleAdd} />
      <p className="counter">{countLabel(todos)}</p>
      <TodoList
        todos={todos}
        onToggle={(id) => setTodos((prev) => toggleTodo(prev, id))}
        onDelete={(id) => setTodos((prev) => deleteTodo(prev, id))}
      />
      {loaded && todos.length === 0 && (
        <p className="empty">
          まだ ToDo がありません。上の入力欄から追加してください。
        </p>
      )}
    </>
  );
}
