// 受け渡しの形。並列で実装する前に、ここを先に決めてコミットする（3-2-7）。
// 並列作業中はこのファイルを変更しない。

/** 検索対象の文書。取り込みの出力。 */
export type RawDoc = {
  /** ファイル名。根拠として画面に出す（spec.md F-2 合格条件③） */
  document: string;
  text: string;
  /** 更新日（ISO 8601 の日付） */
  updatedAt: string;
};

/** 分割された断片。 */
export type Chunk = {
  document: string;
  index: number;
  text: string;
};

/** 検索で返る断片。類似度つき。 */
export type ScoredChunk = Chunk & { similarity: number };

/** 回答の根拠。excerpt は文書の本文に実在する文字列（F-2 合格条件④）。 */
export type Source = {
  document: string;
  excerpt: string;
};

/** 質問への応答。answer が null なら「答えられない」（F-3）。 */
export type AskResult = {
  answer: string | null;
  sources: Source[];
};

/** 失敗の分類（2-4-13 の分類に「JSON として読めない」を足したもの）。 */
export type FailureKind =
  | "transient" // 再試行してよい
  | "permanent" // 再試行しても同じ
  | "malformed"; // 形式が壊れている。1回だけ再試行する

export type AskError = {
  /** 画面とログで使う識別子 */
  code: string;
  /** 利用者に見せる文言。内部情報を含めない */
  message: string;
  kind: FailureKind;
  /** どのサービスで失敗したか（3-1-3：呼び先が3つに増えた分、分けて持つ） */
  service?: "embedding" | "vectorStore" | "generation" | "app";
};
