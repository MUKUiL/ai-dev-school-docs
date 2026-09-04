// 入力の検証。送る前に止められるものは、送る前に止める（2-2-4 の 2-3）
import { describe, expect, it } from "vitest";
import { MAX_INPUT_CHARS, validateInput } from "@/lib/validate";

describe("validateInput（F-1 送信できる）", () => {
  it("通常の議事録は通る", () => {
    const r = validateInput("10:00 開始。次回は来週。");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.text).toBe("10:00 開始。次回は来週。");
  });

  it("前後の空白を落とす", () => {
    const r = validateInput("  議事録  ");
    expect(r.ok && r.text).toBe("議事録");
  });

  it("空文字は止める", () => {
    const r = validateInput("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("empty_input");
  });

  it("空白のみも止める", () => {
    for (const s of ["   ", "\n\t ", "　"]) {
      const r = validateInput(s);
      expect(r.ok, `入力: ${JSON.stringify(s)}`).toBe(false);
    }
  });

  it("文字列でない入力も止める", () => {
    for (const v of [null, undefined, 123, {}, []]) {
      expect(validateInput(v).ok).toBe(false);
    }
  });

  it("上限ちょうどは通り、1文字超えると止まる", () => {
    expect(validateInput("あ".repeat(MAX_INPUT_CHARS)).ok).toBe(true);
    const over = validateInput("あ".repeat(MAX_INPUT_CHARS + 1));
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.kind).toBe("too_long");
  });

  it("止めるときは理由が出る", () => {
    const r = validateInput("");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });
});
