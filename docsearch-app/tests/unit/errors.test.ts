import { describe, expect, it } from "vitest";
import { classify, toAskError } from "../../lib/errors";

describe("classify", () => {
  it("429 は一時的", () => expect(classify(429)).toBe("transient"));
  it("500 は一時的", () => expect(classify(503)).toBe("transient"));
  it("400 は恒久的", () => expect(classify(400)).toBe("permanent"));
  it("401 は恒久的", () => expect(classify(401)).toBe("permanent"));
  it("タイムアウトは一時的", () => {
    expect(classify(undefined, new Error("request timeout"))).toBe("transient");
  });
  it("未知のものは permanent に倒す", () => {
    expect(classify(undefined, new Error("なにか"))).toBe("permanent");
  });
});

describe("toAskError", () => {
  it("利用者向けの文言に、内部情報を含めない", () => {
    const e = toAskError("SEARCH_FAILED", "transient", "vectorStore");
    expect(e.message).not.toMatch(/postgres:\/\/|supabase|api[_-]?key/i);
  });
  it("未知のコードでも文言が返る", () => {
    expect(toAskError("UNKNOWN", "permanent", "app").message).not.toBe("");
  });
});
