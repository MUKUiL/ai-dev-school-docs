import type { ActionItem, SummaryResult } from "./types";

export type ParseResult =
  | { ok: true; value: SummaryResult }
  | { ok: false; reason: string };

/**
 * LLM の応答から構造化出力を取り出す。
 *
 * 出力そのものの「正しさ」は判定できない（2-2-4）。
 * ここで判定できるのは **形式** だけ。だから形式だけを見る。
 */
export function parseSummary(raw: string): ParseResult {
  const json = extractJson(raw);
  if (json === null) return { ok: false, reason: "JSON が見つからない" };

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, reason: "JSON としてパースできない" };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, reason: "オブジェクトではない" };
  }
  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== "string" || obj.summary.trim() === "") {
    return { ok: false, reason: "summary が文字列でないか空" };
  }
  if (!Array.isArray(obj.actions)) {
    return { ok: false, reason: "actions が配列でない" };
  }

  const actions: ActionItem[] = [];
  for (const [i, a] of obj.actions.entries()) {
    if (typeof a !== "object" || a === null) {
      return { ok: false, reason: `actions[${i}] がオブジェクトでない` };
    }
    const item = a as Record<string, unknown>;
    // 欠けているフィールドは "未定" で埋める。
    // 落とさずに埋めるのは、仕様が「不明な場合は未定」と決めているため。
    actions.push({
      owner: str(item.owner) ?? "未定",
      task: str(item.task) ?? "",
      due: str(item.due) ?? "未定",
    });
  }

  // task が空の項目は、アクションとして意味を持たないので落とす
  const cleaned = actions.filter((a) => a.task !== "");

  return { ok: true, value: { summary: obj.summary.trim(), actions: cleaned } };
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

/**
 * 応答が ```json ... ``` で包まれていたり、前後に説明文が付くことがある。
 * 「そのままパースできる前提」で書くと、そこで落ちる。
 */
function extractJson(raw: string): string | null {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) return raw.slice(start, end + 1);

  return null;
}
