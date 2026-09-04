"use client";

import type { Todo } from "@/lib/todos";

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <li className={todo.done ? "todo-item done" : "todo-item"}>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        aria-label={`${todo.text} を完了にする`}
      />
      <span className="text">{todo.text}</span>
      <button
        type="button"
        className="delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`${todo.text} を削除`}
      >
        削除
      </button>
    </li>
  );
}
