export const MIN_QUESTION_LENGTH = 5;
export const MAX_QUESTION_LENGTH = 200;

export type ValidationResult =
  | { ok: true; question: string }
  | { ok: false; reason: string };

/**
 * 質問の検証。ここで弾けば、以降の外部呼び出しは1回も起きない。
 * 上限・下限の根拠は docs/notes/query-limit.md にある。
 */
export function validateQuestion(input: unknown): ValidationResult {
  if (typeof input !== "string") {
    return { ok: false, reason: "質問を文字列で送ってください。" };
  }
  const question = input.trim();
  if (question.length < MIN_QUESTION_LENGTH) {
    return { ok: false, reason: `質問は${MIN_QUESTION_LENGTH}文字以上で入力してください。` };
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return { ok: false, reason: `質問は${MAX_QUESTION_LENGTH}文字以内で入力してください。` };
  }
  return { ok: true, question };
}
