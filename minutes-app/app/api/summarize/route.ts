// サーバー側。ブラウザには配られない（2-4-11）
import Anthropic from "@anthropic-ai/sdk";
import { log, newRequestId } from "@/lib/logger";
import { summarize } from "@/lib/summarize";
import { validateInput } from "@/lib/validate";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const requestId = newRequestId();
  const startedAt = Date.now();

  const body = await req.json().catch(() => ({}));
  const v = validateInput((body as { text?: unknown }).text);

  // 送る前に止められるものは、送る前に止める（API を呼ばない＝費用が出ない）
  if (!v.ok) {
    log({
      event: "summarize_failed", requestId, inputChars: 0,
      durationMs: Date.now() - startedAt, attempts: 0,
      failureKind: v.kind, reason: "入力の検証で停止",
    });
    return Response.json({ error: v.message, requestId }, { status: 400 });
  }

  const r = await summarize(client, v.text);
  const durationMs = Date.now() - startedAt;

  if (!r.ok) {
    log({
      event: "summarize_failed", requestId, inputChars: v.text.length,
      inputTokens: r.inputTokens, outputTokens: r.outputTokens,
      durationMs, attempts: r.attempts, failureKind: r.kind, reason: r.message,
    });
    // 内部の詳細は返さない。利用者には「何が起きたか」と「次にどうするか」だけ
    return Response.json({ error: r.message, requestId }, { status: 502 });
  }

  log({
    event: "summarize_ok", requestId, inputChars: v.text.length,
    inputTokens: r.inputTokens, outputTokens: r.outputTokens,
    durationMs, attempts: r.attempts, actionCount: r.value.actions.length,
  });
  return Response.json({ ...r.value, requestId });
}
