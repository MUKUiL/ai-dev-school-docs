// 要約処理の全体。API はモックする（実 API は呼ばない）
import { describe, expect, it, vi } from "vitest";
import { summarize, type MessagesClient } from "@/lib/summarize";

const noSleep = { maxRetries: 2, baseDelayMs: 1, sleep: async () => {} };

/** 正常な応答を1つ作る */
function textMessage(text: string, opts: { stop?: string; input?: number; output?: number } = {}) {
  return {
    content: [{ type: "text", text }],
    stop_reason: opts.stop ?? "end_turn",
    usage: { input_tokens: opts.input ?? 120, output_tokens: opts.output ?? 45 },
  } as never;
}

const validJson = JSON.stringify({
  summary: "予算を承認した。次回は来週。",
  actions: [{ owner: "田中", task: "見積もりを出す", due: "9/5" }],
});

function clientReturning(...responses: unknown[]): MessagesClient {
  const create = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) create.mockRejectedValueOnce(r);
    else create.mockResolvedValueOnce(r);
  }
  return { messages: { create } } as unknown as MessagesClient;
}

describe("summarize（正常系）", () => {
  it("構造化出力を受け取れる", async () => {
    const r = await summarize(clientReturning(textMessage(validJson)), "議事録", noSleep);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.summary).toContain("予算");
      expect(r.value.actions[0].owner).toBe("田中");
    }
  });

  it("使用量（トークン数）を返す", async () => {
    // 課金の根拠。ログに残す（2-4-10・2-4-13）
    const r = await summarize(
      clientReturning(textMessage(validJson, { input: 900, output: 210 })), "議事録", noSleep);
    expect(r.inputTokens).toBe(900);
    expect(r.outputTokens).toBe(210);
  });

  it("アクションが0件でも成功として扱う", async () => {
    const empty = JSON.stringify({ summary: "報告のみ。", actions: [] });
    const r = await summarize(clientReturning(textMessage(empty)), "議事録", noSleep);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.actions).toEqual([]);
  });
});

describe("summarize（異常系）", () => {
  it("出力が上限で切れたら truncated として扱う", async () => {
    const c = clientReturning(
      textMessage('{"summary": "途中で', { stop: "max_tokens" }),
      textMessage('{"summary": "途中で', { stop: "max_tokens" }),
      textMessage('{"summary": "途中で', { stop: "max_tokens" }),
    );
    const r = await summarize(c, "議事録", noSleep);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("truncated");
  });

  it("応答が空なら失敗として扱う", async () => {
    const c = clientReturning(textMessage(""), textMessage(""), textMessage(""));
    const r = await summarize(c, "議事録", noSleep);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("api_error");
  });

  it("形式が崩れていたら unparsable として扱う", async () => {
    const bad = textMessage("要約はできませんでした。");
    const r = await summarize(clientReturning(bad, bad, bad), "議事録", noSleep);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("unparsable");
  });

  it("レート制限は rate_limited として扱う", async () => {
    const err = Object.assign(new Error("rate limited"), { status: 429 });
    const r = await summarize(clientReturning(err, err, err), "議事録", noSleep);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("rate_limited");
  });

  it("タイムアウトは timeout として扱う", async () => {
    const err = Object.assign(new Error("aborted"), { name: "AbortError" });
    const r = await summarize(clientReturning(err, err, err), "議事録", noSleep);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.kind).toBe("timeout");
  });

  it("1回目が崩れても2回目で成功すれば成功になる", async () => {
    const c = clientReturning(textMessage("崩れた応答"), textMessage(validJson));
    const r = await summarize(c, "議事録", noSleep);
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(2);
  });

  it("失敗しても例外を投げない（画面が落ちない）", async () => {
    const err = new Error("なにか");
    const c = clientReturning(err, err, err);
    await expect(summarize(c, "議事録", noSleep)).resolves.toMatchObject({ ok: false });
  });
});
