import type { FailureKind } from "./types";

/**
 * 構造化ログ（2-4-13）。
 *
 * **出してはいけないもの**
 * - 議事録の本文（個人情報を含む）
 * - API キー
 * - 利用者を特定できる情報
 *
 * 代わりに「長さ」「件数」「所要時間」を残す。
 * 何が起きたかを追うには、これで足りる。
 */
export type LogRecord = {
  event: "summarize_ok" | "summarize_failed";
  requestId: string;
  /** 本文ではなく文字数だけ */
  inputChars: number;
  /** レスポンスの usage から取る（2-4-10） */
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
  attempts: number;
  failureKind?: FailureKind;
  /** 失敗の要約。本文は入れない */
  reason?: string;
  actionCount?: number;
};

export function newRequestId(rand: () => number = Math.random): string {
  return rand().toString(36).slice(2, 10);
}

export function log(record: LogRecord, sink: (line: string) => void = console.log): void {
  sink(JSON.stringify(record));
}
