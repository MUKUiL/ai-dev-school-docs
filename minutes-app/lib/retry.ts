import type { FailureKind } from "./types";

/** リトライしてよい失敗と、してはいけない失敗を分ける（2-4-13） */
export function isRetriable(kind: FailureKind): boolean {
  switch (kind) {
    // 一時的な事情。待てば直ることがある
    case "timeout":
    case "rate_limited":
    case "api_error":
      return true;
    // 何度やっても同じ。リトライは費用を捨てるだけ
    case "empty_input":
    case "too_long":
      return false;
    // 出力の形が崩れた／切れた。同じ入力でも変わりうるので1回は試す価値がある
    case "unparsable":
    case "truncated":
      return true;
  }
}

export type RetryOptions = {
  /** 最大リトライ回数。呼び出し総数は maxRetries + 1 回になる */
  maxRetries: number;
  /** 待ち時間の基準（ミリ秒）。回を追うごとに倍にする */
  baseDelayMs: number;
  /** テストから差し替えられるようにする */
  sleep?: (ms: number) => Promise<void>;
};

export const DEFAULT_RETRY: RetryOptions = { maxRetries: 2, baseDelayMs: 500 };

export type Attempt<T> =
  | { ok: true; value: T }
  | { ok: false; kind: FailureKind; message: string };

/**
 * 収束しないなら打ち切る（2-1-2）。
 * 回数の上限は品質のためだけでなく、費用のためでもある（2-4-10）。
 */
export async function withRetry<T>(
  run: (attempt: number) => Promise<Attempt<T>>,
  opts: RetryOptions = DEFAULT_RETRY,
): Promise<Attempt<T> & { attempts: number }> {
  const sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  let last: Attempt<T> = { ok: false, kind: "api_error", message: "未実行" };

  for (let i = 0; i <= opts.maxRetries; i++) {
    last = await run(i);
    if (last.ok) return { ...last, attempts: i + 1 };
    if (!isRetriable(last.kind)) return { ...last, attempts: i + 1 };
    if (i < opts.maxRetries) await sleep(opts.baseDelayMs * 2 ** i);
  }
  return { ...last, attempts: opts.maxRetries + 1 };
}
