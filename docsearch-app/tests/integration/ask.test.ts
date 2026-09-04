import { describe, expect, it } from "vitest";
import { ask } from "../../lib/ask";
import { makeFakes, SAMPLE_CHUNK } from "../fakes";
import { verifySources, allSourcesReal } from "../../lib/verify";
import type { RawDoc } from "../../lib/types";

const silent = { info: () => {}, warn: () => {} };
const deps = (clients: ReturnType<typeof makeFakes>["clients"]) => ({
  clients, logger: silent, requestId: "test-1",
});

const corpus: RawDoc[] = [
  { document: SAMPLE_CHUNK.document, text: SAMPLE_CHUNK.text, updatedAt: "2026-08-11" },
];

describe("ask（正常系）", () => {
  it("質問すると回答と根拠が返る", async () => {
    const f = makeFakes({
      chunks: [SAMPLE_CHUNK],
      response: JSON.stringify({
        answer: "毎月末日締め、翌月5日までです。",
        sources: [{ document: SAMPLE_CHUNK.document, excerpt: "翌月5日までに申請する" }],
      }),
    });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.status).toBe(200);
    expect(res.ok && res.body.sources.length).toBeGreaterThan(0);
  });

  it("示した根拠が実在する（F-2）", async () => {
    const f = makeFakes({
      chunks: [SAMPLE_CHUNK],
      response: JSON.stringify({
        answer: "…",
        sources: [{ document: SAMPLE_CHUNK.document, excerpt: "翌月5日までに申請する" }],
      }),
    });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.ok).toBe(true);
    if (res.ok) expect(allSourcesReal(verifySources(res.body, corpus))).toBe(true);
  });

  it("根拠が0件なら answer は null になり、生成を呼ばない（F-3）", async () => {
    const f = makeFakes({ chunks: [] });
    const res = await ask("社員は何人いますか", deps(f.clients));
    expect(res.ok && res.body.answer).toBeNull();
    expect(f.counts.generate).toBe(0);
  });
});

describe("ask（異常系）", () => {
  it("短すぎる質問は 400 で、外部を1回も呼ばない", async () => {
    const f = makeFakes();
    const res = await ask("短い", deps(f.clients));
    expect(res.status).toBe(400);
    expect(f.counts.embed).toBe(0);
    expect(f.counts.search).toBe(0);
    expect(f.counts.generate).toBe(0);
  });

  it("長すぎる質問は 400 で、外部を1回も呼ばない", async () => {
    const f = makeFakes();
    const res = await ask("あ".repeat(500), deps(f.clients));
    expect(res.status).toBe(400);
    expect(f.counts.embed).toBe(0);
  });

  it("ベクトルストアが落ちても、本文に接続情報が出ない", async () => {
    const f = makeFakes({ searchThrows: new Error("connect ECONNREFUSED postgres://user:pw@db:5432") });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.body.error.message).not.toContain("postgres://");
      expect(res.body.error.service).toBe("vectorStore");
    }
  });

  it("JSON が壊れたら1回だけ再試行し、それでも駄目なら失敗にする", async () => {
    let n = 0;
    const f = makeFakes({ chunks: [SAMPLE_CHUNK], response: () => { n += 1; return "承知しました。"; } });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.ok).toBe(false);
    expect(n).toBe(2); // 1回目＋再試行1回。それ以上は繰り返さない
  });

  it("再試行で正しい JSON が返れば成功する", async () => {
    let n = 0;
    const f = makeFakes({
      chunks: [SAMPLE_CHUNK],
      response: () => {
        n += 1;
        return n === 1 ? "壊れた出力" : JSON.stringify({ answer: "回答", sources: [{ document: SAMPLE_CHUNK.document, excerpt: "翌月5日までに申請する" }] });
      },
    });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.status).toBe(200);
  });

  it("埋め込みが落ちたら 502 で、どのサービスかが分かる", async () => {
    const f = makeFakes({ embedThrows: Object.assign(new Error("rate limited"), { status: 429 }) });
    const res = await ask("経費の申請期限はいつですか", deps(f.clients));
    expect(res.status).toBe(502);
    if (!res.ok) {
      expect(res.body.error.service).toBe("embedding");
      expect(res.body.error.kind).toBe("transient");
    }
  });
});
