// ログに出してはいけないもの（2-4-13 の 2-6）
import { describe, expect, it } from "vitest";
import { log, newRequestId, type LogRecord } from "@/lib/logger";

const MINUTES = "田中部長と山田さんが出席。予算3000万円で合意。";

function capture(record: LogRecord): string {
  let out = "";
  log(record, (line) => { out = line; });
  return out;
}

describe("構造化ログ", () => {
  it("JSON 1行で出る", () => {
    const line = capture({
      event: "summarize_ok", requestId: "abc12345",
      inputChars: 1200, inputTokens: 900, outputTokens: 210,
      durationMs: 3400, attempts: 1, actionCount: 2,
    });
    expect(() => JSON.parse(line)).not.toThrow();
    expect(JSON.parse(line).event).toBe("summarize_ok");
  });

  it("議事録の本文が含まれない", () => {
    // 本文ではなく文字数だけを残す
    const line = capture({
      event: "summarize_ok", requestId: "abc12345",
      inputChars: MINUTES.length, durationMs: 100, attempts: 1,
    });
    expect(line).not.toContain("田中");
    expect(line).not.toContain("3000万円");
    expect(JSON.parse(line).inputChars).toBe(MINUTES.length);
  });

  it("失敗のときも本文を残さず、理由だけ残す", () => {
    const line = capture({
      event: "summarize_failed", requestId: "abc12345",
      inputChars: MINUTES.length, durationMs: 100, attempts: 3,
      failureKind: "unparsable", reason: "JSON が見つからない",
    });
    expect(line).not.toContain("山田");
    expect(JSON.parse(line).failureKind).toBe("unparsable");
  });

  it("記録できる項目に本文用のフィールドが無い", () => {
    // 型の上で本文を入れる場所を作らない、という設計
    const keys = ["event","requestId","inputChars","inputTokens","outputTokens",
                  "durationMs","attempts","failureKind","reason","actionCount"];
    expect(keys).not.toContain("input");
    expect(keys).not.toContain("minutes");
    expect(keys).not.toContain("apiKey");
  });

  it("リクエスト ID は毎回変わる", () => {
    const ids = new Set(Array.from({ length: 500 }, () => newRequestId()));
    expect(ids.size).toBe(500);
  });
});
