// lib/todos.ts のテスト。
// 画面を動かさずに確かめられる部分だけを、ここでまとめて検証する。
import { describe, expect, it } from "vitest";
import {
  type Todo,
  countLabel,
  createTodo,
  deleteTodo,
  newId,
  toggleTodo,
} from "@/lib/todos";

const sample: Todo[] = [
  { id: "a", text: "牛乳を買う", done: false },
  { id: "b", text: "請求書を出す", done: false },
  { id: "c", text: "ゴミを出す", done: true },
];

describe("createTodo（F-1 追加）", () => {
  it("入力した文字から Todo を作る", () => {
    const todo = createTodo("牛乳を買う");
    expect(todo).not.toBeNull();
    expect(todo!.text).toBe("牛乳を買う");
    expect(todo!.done).toBe(false);
  });

  it("前後の空白を落とす", () => {
    expect(createTodo("  牛乳を買う  ")!.text).toBe("牛乳を買う");
  });

  it("空文字は追加しない", () => {
    expect(createTodo("")).toBeNull();
  });

  it("空白だけも追加しない", () => {
    expect(createTodo("   ")).toBeNull();
    expect(createTodo("\t\n")).toBeNull();
  });
});

describe("newId（id の採番）", () => {
  // Date.now() だけで採番すると、続けて呼んだときに同じ値になる。
  // その状態で削除すると、同じ id の項目がまとめて消える。
  it("連続で呼んでも重複しない", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => newId()));
    expect(ids.size).toBe(1000);
  });
});

describe("toggleTodo（F-2 完了の切り替え）", () => {
  it("指定した1件だけ done が反転する", () => {
    const next = toggleTodo(sample, "a");
    expect(next[0].done).toBe(true);
    expect(next[1].done).toBe(false);
    expect(next[2].done).toBe(true);
  });

  it("元の配列を書き換えない", () => {
    toggleTodo(sample, "a");
    expect(sample[0].done).toBe(false);
  });

  it("存在しない id なら何も変わらない", () => {
    expect(toggleTodo(sample, "zzz")).toEqual(sample);
  });
});

describe("deleteTodo（F-3 削除）", () => {
  it("指定した1件だけ消える", () => {
    const next = deleteTodo(sample, "b");
    expect(next).toHaveLength(2);
    expect(next.map((t) => t.id)).toEqual(["a", "c"]);
  });

  it("元の配列を書き換えない", () => {
    deleteTodo(sample, "b");
    expect(sample).toHaveLength(3);
  });

  it("id が重複していると2件消える（採番が壊れているときの症状）", () => {
    // newId が重複しない限り起きないが、起きたときに何が壊れるかを記録しておく。
    const dup: Todo[] = [
      { id: "same", text: "1つめ", done: false },
      { id: "same", text: "2つめ", done: false },
    ];
    expect(deleteTodo(dup, "same")).toHaveLength(0);
  });
});

describe("countLabel（F-4 件数の表示）", () => {
  it("未完了と全体の件数を出す", () => {
    expect(countLabel(sample)).toBe("未完了 2 件 / 全 3 件");
  });

  it("0件のとき", () => {
    expect(countLabel([])).toBe("未完了 0 件 / 全 0 件");
  });

  it("全部完了しているとき", () => {
    const allDone = sample.map((t) => ({ ...t, done: true }));
    expect(countLabel(allDone)).toBe("未完了 0 件 / 全 3 件");
  });
});
