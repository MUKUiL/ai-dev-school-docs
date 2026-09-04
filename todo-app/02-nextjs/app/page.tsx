// トップページ。
// このファイル自体はサーバー側で動く。localStorage を触るのは TodoApp の中。
import TodoApp from "@/components/TodoApp";

export default function Page() {
  return (
    <main className="app">
      <h1>ToDo リスト</h1>
      <TodoApp />
    </main>
  );
}
