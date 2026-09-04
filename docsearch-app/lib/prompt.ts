import type { AskResult, ScoredChunk, Source } from "./types";

export const MAX_SOURCES = 3;

/**
 * 3つの条件を必ず入れる（3-3-8 2-4）。
 * ①抜粋だけを根拠に ②答えられないときは answer を null に ③excerpt はそのまま写す
 */
export function buildPrompt(question: string, chunks: ScoredChunk[]): string {
  const excerpts = chunks
    .map((c) => `--- ${c.document} ---\n${c.text}`)
    .join("\n\n");
  return [
    "以下の【社内文書の抜粋】だけを根拠にして、【質問】に答えてください。",
    "",
    "【制約】",
    "- 抜粋に書かれていないことは答えないでください",
    "- 答えが抜粋から読み取れないときは、answer を null にしてください",
    "- 推測で補わないでください",
    "",
    "【出力】次の JSON だけを返してください。前後に文章を付けないでください。",
    '{"answer": string | null, "sources": [{"document": string, "excerpt": string}]}',
    "- sources には、実際に根拠として使った抜粋だけを入れてください",
    "- excerpt は、抜粋の中の文字列をそのまま写してください。要約しないでください",
    "",
    "【社内文書の抜粋】",
    excerpts,
    "",
    "【質問】",
    question,
  ].join("\n");
}

export class MalformedResponseError extends Error {}

/** 生成の出力を AskResult に整える。形が違えば MalformedResponseError を投げる。 */
export function parseResult(raw: string): AskResult {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new MalformedResponseError("JSON として読めません");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new MalformedResponseError("オブジェクトではありません");
  }
  const obj = parsed as Record<string, unknown>;
  const answer = obj.answer;
  if (answer !== null && typeof answer !== "string") {
    throw new MalformedResponseError("answer が文字列でも null でもありません");
  }
  if (!Array.isArray(obj.sources)) {
    throw new MalformedResponseError("sources が配列ではありません");
  }
  const sources: Source[] = [];
  for (const s of obj.sources) {
    if (typeof s !== "object" || s === null) continue;
    const { document, excerpt } = s as Record<string, unknown>;
    if (typeof document !== "string" || typeof excerpt !== "string") continue;
    sources.push({ document, excerpt });
  }
  // 上限を切る。切らないと F-2 の合格条件②（1件以上3件以下）を満たさない
  return { answer, sources: sources.slice(0, MAX_SOURCES) };
}

/** 根拠が1件も無いのに答えているものは、答えを落とす（F-3）。 */
export function enforceGrounding(result: AskResult): AskResult {
  if (result.sources.length === 0) return { answer: null, sources: [] };
  return result;
}
