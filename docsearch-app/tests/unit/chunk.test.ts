import { describe, expect, it } from "vitest";
import { chunk } from "../../lib/chunk";
import type { RawDoc } from "../../lib/types";

const doc = (text: string): RawDoc => ({ document: "test.md", text, updatedAt: "2026-08-11" });

describe("chunk", () => {
  it("size 以下の文書は分割されない", () => {
    const r = chunk(doc("あ".repeat(100)), { size: 400, overlap: 0, byHeading: false });
    expect(r).toHaveLength(1);
  });

  it("size ちょうどの文書は分割されない", () => {
    const r = chunk(doc("あ".repeat(400)), { size: 400, overlap: 0, byHeading: false });
    expect(r).toHaveLength(1);
  });

  it("size を1文字超えると分割される", () => {
    const r = chunk(doc("あ".repeat(401)), { size: 400, overlap: 0, byHeading: false });
    expect(r.length).toBeGreaterThan(1);
  });

  it("overlap の分だけ前の断片の末尾が重なる", () => {
    const text = Array.from({ length: 300 }, (_, i) => String(i % 10)).join("");
    const r = chunk(doc(text), { size: 100, overlap: 20, byHeading: false });
    const tail = r[0].text.slice(-20);
    expect(r[1].text.startsWith(tail)).toBe(true);
  });

  it("見出しで区切ると、条文ごとに分かれる", () => {
    const text = ["第1条（目的）", "この規程は…", "", "第2条（範囲）", "全従業員に適用する。"].join("\n");
    const r = chunk(doc(text), { size: 1000, overlap: 0, byHeading: true });
    expect(r).toHaveLength(2);
    expect(r[0].text).toContain("第1条");
    expect(r[1].text).toContain("第2条");
  });

  it("index は0から連番になる", () => {
    const r = chunk(doc("あ".repeat(1000)), { size: 200, overlap: 0, byHeading: false });
    expect(r.map((c) => c.index)).toEqual(r.map((_, i) => i));
  });

  it("空白だけの断片は落とす", () => {
    const r = chunk(doc("本文\n\n\n\n"), { size: 100, overlap: 0, byHeading: false });
    expect(r.every((c) => c.text.trim() !== "")).toBe(true);
  });

  it("overlap が size 以上なら落ちる", () => {
    expect(() => chunk(doc("x"), { size: 100, overlap: 100, byHeading: false })).toThrow();
  });
});
