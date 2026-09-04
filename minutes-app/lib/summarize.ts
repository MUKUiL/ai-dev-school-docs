import type Anthropic from "@anthropic-ai/sdk";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import { parseSummary } from "./parse";
import { DEFAULT_RETRY, withRetry, type Attempt, type RetryOptions } from "./retry";
import type { SummaryResult } from "./types";

export const MODEL = "claude-haiku-4-5-20251001";
export const MAX_TOKENS = 1024;

/** 呼び出しに必要な最小のインターフェース。テストではこれをモックする */
export type MessagesClient = {
  messages: {
    create: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<Anthropic.Message>;
  };
};

export type SummarizeOutcome = Attempt<SummaryResult> & {
  attempts: number;
  inputTokens?: number;
  outputTokens?: number;
};

export async function summarize(
  client: MessagesClient,
  minutes: string,
  opts: RetryOptions = DEFAULT_RETRY,
): Promise<SummarizeOutcome> {
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  const result = await withRetry<SummaryResult>(async () => {
    let res: Anthropic.Message;
    try {
      res = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(minutes) }],
      });
    } catch (e) {
      return { ok: false, ...classify(e) };
    }

    inputTokens = res.usage?.input_tokens;
    outputTokens = res.usage?.output_tokens;

    // 上限に達して止まった応答は、途中で切れている（2-4-10）
    if (res.stop_reason === "max_tokens") {
      return { ok: false, kind: "truncated", message: "出力が上限に達して途中で切れました。" };
    }

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    if (text.trim() === "") {
      return { ok: false, kind: "api_error", message: "応答が空でした。" };
    }

    const parsed = parseSummary(text);
    if (!parsed.ok) {
      return { ok: false, kind: "unparsable", message: `形式が崩れています（${parsed.reason}）。` };
    }
    return { ok: true, value: parsed.value };
  }, opts);

  return { ...result, inputTokens, outputTokens };
}

function classify(e: unknown): { kind: import("./types").FailureKind; message: string } {
  const status = (e as { status?: number } | null)?.status;
  const name = (e as { name?: string } | null)?.name ?? "";

  if (status === 429) return { kind: "rate_limited", message: "混み合っています。少し待ってから再試行してください。" };
  if (name === "AbortError" || name === "TimeoutError") {
    return { kind: "timeout", message: "時間内に応答がありませんでした。" };
  }
  return { kind: "api_error", message: "要約に失敗しました。" };
}
