import { describe, expect, it } from "vitest";
import { MAX_QUESTION_LENGTH, MIN_QUESTION_LENGTH, validateQuestion } from "../../lib/validate";

describe("validateQuestion", () => {
  it("下限ちょうどは通る", () => {
    expect(validateQuestion("あ".repeat(MIN_QUESTION_LENGTH)).ok).toBe(true);
  });
  it("下限より1文字短いと落ちる", () => {
    expect(validateQuestion("あ".repeat(MIN_QUESTION_LENGTH - 1)).ok).toBe(false);
  });
  it("上限ちょうどは通る", () => {
    expect(validateQuestion("あ".repeat(MAX_QUESTION_LENGTH)).ok).toBe(true);
  });
  it("上限より1文字長いと落ちる", () => {
    expect(validateQuestion("あ".repeat(MAX_QUESTION_LENGTH + 1)).ok).toBe(false);
  });
  it("空文字は落ちる", () => {
    expect(validateQuestion("").ok).toBe(false);
  });
  it("空白だけは落ちる", () => {
    expect(validateQuestion("      ").ok).toBe(false);
  });
  it("文字列以外は落ちる", () => {
    expect(validateQuestion(null).ok).toBe(false);
    expect(validateQuestion(42).ok).toBe(false);
  });
  it("前後の空白は落として返す", () => {
    const r = validateQuestion("  経費の申請期限はいつですか  ");
    expect(r.ok && r.question).toBe("経費の申請期限はいつですか");
  });
});
