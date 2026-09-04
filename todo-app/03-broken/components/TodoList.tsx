"use client";

import type { Todo } from "@/lib/todos";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({ todos, onToggle, onDelete }: Props) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        // key には配列の添え字ではなく id を使う。
        // 添え字にすると、削除したときに別の行の状態が混ざる。
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
