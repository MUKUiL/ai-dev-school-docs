// 画面としての動きのテスト。
// 受け入れ基準 F-1〜F-5 を、実際に押して確かめる。
import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoApp from "@/components/TodoApp";
import { STORAGE_KEY } from "@/lib/todos";

async function add(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.clear(screen.getByLabelText("やること"));
  if (text !== "") await user.type(screen.getByLabelText("やること"), text);
  await user.click(screen.getByRole("button", { name: "追加" }));
}

const rows = () => screen.queryAllByRole("listitem");

beforeEach(() => {
  window.localStorage.clear();
});

describe("F-1 ToDo を追加する", () => {
  it("入力して追加すると一覧の末尾に増える", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "牛乳を買う");
    await add(user, "請求書を出す");

    expect(rows()).toHaveLength(2);
    expect(rows()[1]).toHaveTextContent("請求書を出す");
  });

  it("追加すると入力欄が空になる", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "牛乳を買う");
    expect(screen.getByLabelText("やること")).toHaveValue("");
  });

  it("空白だけのときは追加されない", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "   ");
    expect(rows()).toHaveLength(0);
  });
});

describe("F-2 完了・未完了を切り替える", () => {
  it("チェックすると打ち消し線のクラスが付く", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "牛乳を買う");

    await user.click(screen.getByRole("checkbox"));
    expect(rows()[0]).toHaveClass("done");

    await user.click(screen.getByRole("checkbox"));
    expect(rows()[0]).not.toHaveClass("done");
  });
});

describe("F-3 ToDo を削除する", () => {
  it("押した行だけが消える", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "牛乳を買う");
    await add(user, "請求書を出す");

    await user.click(screen.getByRole("button", { name: "牛乳を買う を削除" }));

    expect(rows()).toHaveLength(1);
    expect(rows()[0]).toHaveTextContent("請求書を出す");
  });
});

describe("F-4 件数を表示する", () => {
  it("追加・完了・削除のたびに更新される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    expect(screen.getByText("未完了 0 件 / 全 0 件")).toBeInTheDocument();

    await add(user, "牛乳を買う");
    await add(user, "請求書を出す");
    expect(screen.getByText("未完了 2 件 / 全 2 件")).toBeInTheDocument();

    await user.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText("未完了 1 件 / 全 2 件")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "請求書を出す を削除" }));
    expect(screen.getByText("未完了 0 件 / 全 1 件")).toBeInTheDocument();
  });
});

describe("F-5 再読み込みしても消えない", () => {
  it("localStorage に保存される", async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    await add(user, "牛乳を買う");

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ text: "牛乳を買う", done: false });
    expect(saved[0].id).toBeTypeOf("string");
  });

  it("保存済みのデータが最初から表示される", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "x", text: "前回の ToDo", done: true }]),
    );
    render(<TodoApp />);

    expect(await screen.findByText("前回の ToDo")).toBeInTheDocument();
    expect(screen.getByText("未完了 0 件 / 全 1 件")).toBeInTheDocument();
  });

  it("壊れた値が入っていても落ちない", async () => {
    window.localStorage.setItem(STORAGE_KEY, "これは JSON ではない");
    render(<TodoApp />);
    expect(screen.getByText("未完了 0 件 / 全 0 件")).toBeInTheDocument();
  });
});
