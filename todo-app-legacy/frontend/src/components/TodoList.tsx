// TodoList.tsx — ToDo 一覧の表示コンポーネント（教材用題材・バグを含む）

type Todo = { id: number; title: string; done: boolean };

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((t) => (
        <li>{t.title}</li>
      ))}
    </ul>
  );
}

export default TodoList;
