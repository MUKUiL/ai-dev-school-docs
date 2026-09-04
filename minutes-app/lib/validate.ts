import type { FailureKind } from "./types";

/** 仕様書「2. 入力」の上限。根拠は docs/notes/input-limit.md */
export const MAX_INPUT_CHARS = 8000;

export type ValidationResult =
  | { ok: true; text: string }
  | { ok: false; kind: Extract<FailureKind, "empty_input" | "too_long">; message: string };

/**
 * 送る前に止められるものは、送る前に止める（2-2-4 の 2-3）。
 * 外部を呼んでから気づくと、時間も費用もかかる。
 */
export function validateInput(raw: unknown): ValidationResult {
  const text = typeof raw === "string" ? raw.trim() : "";

  if (text === "") {
    return { ok: false, kind: "empty_input", message: "議事録を入力してください。" };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      ok: false,
      kind: "too_long",
      message: `議事録が長すぎます（${text.length} 文字）。${MAX_INPUT_CHARS} 文字以内にしてください。`,
    };
  }
  return { ok: true, text };
}
