/**
 * 起動時に確認する。無いまま動かすと、質問したときに初めて失敗する（3-3-11）。
 * エラーには「何が無いか」だけを書き、値は書かない。
 */
const REQUIRED = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function assertEnv(env: NodeJS.ProcessEnv = process.env): void {
  const missing = REQUIRED.filter((k) => !env[k]);
  if (missing.length > 0) {
    throw new Error(`必要な環境変数が設定されていません: ${missing.join(", ")}`);
  }
}
