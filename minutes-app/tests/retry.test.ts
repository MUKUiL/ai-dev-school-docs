// リトライと打ち切り（2-1-2 の打ち切り条件・2-4-13）
import { describe, expect, it, vi } from "vitest";
import { isRetriable, withRetry, type Attempt } from "@/lib/retry";

const noSleep = { maxRetries: 2, baseDelayMs: 1, sleep: async () => {} };

describe("isRetriable（リトライしてよい失敗の切り分け）", () => {
  it("一時的な失敗はリトライする", () => {
    for (const k of ["timeout", "rate_limited", "api_error"] as const) {
      expect(isRetriable(k), k).toBe(true);
    }
  });

  it("入力が原因の失敗はリトライしない", () => {
    // 何度やっても同じ。リトライは費用を捨てるだけ
    for (const k of ["empty_input", "too_long"] as const) {
      expect(isRetriable(k), k).toBe(false);
    }
  });

  it("形式の崩れと打ち切りはリトライする", () => {
    for (const k of ["unparsable", "truncated"] as const) {
      expect(isRetriable(k), k).toBe(true);
    }
  });
});

describe("withRetry（打ち切り条件）", () => {
  it("1回目で成功したらそこで終わる", async () => {
    const run = vi.fn(async (): Promise<Attempt<string>> => ({ ok: true, value: "ok" }));
    const r = await withRetry(run, noSleep);
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("失敗し続けたら maxRetries + 1 回で打ち切る", async () => {
    const run = vi.fn(async (): Promise<Attempt<string>> => ({
      ok: false, kind: "timeout", message: "遅い",
    }));
    const r = await withRetry(run, noSleep);
    expect(r.ok).toBe(false);
    expect(r.attempts).toBe(3);
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("リトライできない失敗は1回で止まる", async () => {
    // 費用のため。同じ入力で3回呼んでも結果は変わらない
    const run = vi.fn(async (): Promise<Attempt<string>> => ({
      ok: false, kind: "too_long", message: "長すぎる",
    }));
    const r = await withRetry(run, noSleep);
    expect(r.attempts).toBe(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("2回目で成功したら3回目は呼ばない", async () => {
    let n = 0;
    const run = vi.fn(async (): Promise<Attempt<string>> => {
      n += 1;
      return n === 1
        ? { ok: false, kind: "unparsable", message: "崩れた" }
        : { ok: true, value: "ok" };
    });
    const r = await withRetry(run, noSleep);
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(2);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("待ち時間は回を追うごとに伸びる", async () => {
    const waited: number[] = [];
    const run = async (): Promise<Attempt<string>> => ({
      ok: false, kind: "timeout", message: "遅い",
    });
    await withRetry(run, {
      maxRetries: 2, baseDelayMs: 100,
      sleep: async (ms) => { waited.push(ms); },
    });
    expect(waited).toEqual([100, 200]);
  });
});
