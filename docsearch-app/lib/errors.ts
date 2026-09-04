import type { AskError, FailureKind } from "./types";

/** HTTP のステータスと例外から、失敗の種類を決める。 */
export function classify(status: number | undefined, cause?: unknown): FailureKind {
  if (status === 429) return "transient";
  if (status !== undefined && status >= 500) return "transient";
  if (status !== undefined && status >= 400) return "permanent";
  // ステータスが取れない＝ネットワーク層で落ちた。再試行の余地がある
  if (cause instanceof Error && /timeout|ECONN|fetch failed/i.test(cause.message)) {
    return "transient";
  }
  // 分からないものは permanent に倒す。無限に再試行させないため
  return "permanent";
}

/** 利用者に見せる文言を作る。内部情報（接続文字列・キー・スタック）を混ぜない。 */
export function toAskError(
  code: string,
  kind: FailureKind,
  service: AskError["service"],
): AskError {
  const message: Record<string, string> = {
    INVALID_INPUT: "質問の長さを確認してください。",
    EMBEDDING_FAILED: "質問の処理に失敗しました。しばらく待ってからもう一度お試しください。",
    SEARCH_FAILED: "文書の検索に失敗しました。しばらく待ってからもう一度お試しください。",
    GENERATION_FAILED: "回答の作成に失敗しました。しばらく待ってからもう一度お試しください。",
    MALFORMED_RESPONSE: "回答の形式が不正でした。もう一度お試しください。",
    INTERNAL: "処理に失敗しました。時間をおいてお試しください。",
  };
  return { code, kind, service, message: message[code] ?? message.INTERNAL };
}
