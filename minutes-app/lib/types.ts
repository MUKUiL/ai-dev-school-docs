// 仕様書（docs/spec.md）の「3. 出力」に対応する型。
// ここを変えるときは、必ず spec.md のほうも直す。
export type ActionItem = {
  /** 担当者。分からない場合は "未定" */
  owner: string;
  /** やること */
  task: string;
  /** 期限。分からない場合は "未定" */
  due: string;
};

export type SummaryResult = {
  /** 要約。仕様では3行以内 */
  summary: string;
  /** アクション項目。0件が正しいこともある */
  actions: ActionItem[];
};

/** 失敗の種類。2-4-13 のハンドリングはこの分類で分岐する */
export type FailureKind =
  | "empty_input"      // 空・空白のみ
  | "too_long"         // 上限超過
  | "timeout"          // 応答が返らない
  | "rate_limited"     // レート制限
  | "truncated"        // 出力が途中で切れた
  | "unparsable"       // 形式が崩れてパースできない
  | "api_error";       // それ以外の API 側の失敗
