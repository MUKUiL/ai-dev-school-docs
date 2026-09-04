/**
 * 構造化ログ。
 * 型に「質問文」「回答本文」を入れる欄を作っていない。書こうとすると型で落ちる（F-6）。
 */
export type AskLog = {
  event: "ask.done" | "ask.failed";
  requestId: string;
  durationMs: number;
  /** 外部を何回呼んだか。N+1 の検知に使う（3-3-10） */
  calls: { embed: number; vectorSearch: number; generate: number };
  /** 区間ごとの時間 */
  timing?: { embedMs: number; searchMs: number; generateMs: number };
  questionLength: number;
  sourceCount: number;
  answered: boolean;
  errorCode?: string;
  errorService?: string;
};

export interface Logger {
  info(log: AskLog): void;
  warn(log: AskLog): void;
}

export const consoleLogger: Logger = {
  info: (log) => console.log(JSON.stringify(log)),
  warn: (log) => console.warn(JSON.stringify(log)),
};
