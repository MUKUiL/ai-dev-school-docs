// Route Handler の振る舞い。API はモックする
import { describe, expect, it, vi, beforeEach } from "vitest";

// SDK を丸ごと差し替える。実 API は呼ばない
const create = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create };
  },
}));

const logs: string[] = [];
vi.mock("@/lib/logger", async (orig) => {
  const real = await orig<typeof import("@/lib/logger")>();
  return { ...real, log: (r: unknown) => { logs.push(JSON.stringify(r)); } };
});

const { POST } = await import("@/app/api/summarize/route");

function req(body: unknown): Request {
  return new Request("http://localhost/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const okBody = JSON.stringify({
  summary: "予算を承認した。",
  actions: [{ owner: "田中", task: "見積もり", due: "9/5" }],
});
const okMessage = {
  content: [{ type: "text", text: okBody }],
  stop_reason: "end_turn",
  usage: { input_tokens: 900, output_tokens: 210 },
};

beforeEach(() => { create.mockReset(); logs.length = 0; });

describe("POST /api/summarize", () => {
  it("正常系：要約とアクションを返す", async () => {
    create.mockResolvedValue(okMessage);
    const res = await POST(req({ text: "10:00 開始。予算を承認。" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.summary).toContain("予算");
    expect(data.actions).toHaveLength(1);
    expect(data.requestId).toBeTypeOf("string");
  });

  it("空入力は API を呼ばずに 400 を返す", async () => {
    // 送る前に止める＝費用が出ない（2-2-4 の 2-3）
    const res = await POST(req({ text: "   " }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("上限超過も API を呼ばずに 400 を返す", async () => {
    const res = await POST(req({ text: "あ".repeat(8001) }));
    expect(res.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it("本文が JSON でなくても落ちない", async () => {
    const bad = new Request("http://localhost/api/summarize", {
      method: "POST", body: "not json",
    });
    const res = await POST(bad);
    expect(res.status).toBe(400);
  });

  it("API が失敗しても例外を投げず、理由を返す", async () => {
    create.mockRejectedValue(new Error("boom"));
    const res = await POST(req({ text: "議事録" }));
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toBeTypeOf("string");
    // 内部の詳細は返さない
    expect(JSON.stringify(data)).not.toContain("boom");
  });

  it("ログに議事録の本文が出ない", async () => {
    create.mockResolvedValue(okMessage);
    await POST(req({ text: "田中部長が出席。予算3000万円で合意。" }));
    const all = logs.join("\n");
    expect(all).not.toContain("田中部長");
    expect(all).not.toContain("3000万円");
  });

  it("ログにトークン数と所要時間が残る", async () => {
    create.mockResolvedValue(okMessage);
    await POST(req({ text: "議事録" }));
    const rec = JSON.parse(logs[0]);
    expect(rec.inputTokens).toBe(900);
    expect(rec.outputTokens).toBe(210);
    expect(rec.durationMs).toBeTypeOf("number");
    expect(rec.actionCount).toBe(1);
  });
});
