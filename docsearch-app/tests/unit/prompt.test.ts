import { describe, expect, it } from "vitest";
import { buildPrompt, enforceGrounding, MalformedResponseError, parseResult } from "../../lib/prompt";
import { SAMPLE_CHUNK } from "../fakes";

describe("buildPrompt", () => {
  it("3つの制約が入っている", () => {
    const p = buildPrompt("経費の申請期限はいつですか", [SAMPLE_CHUNK]);
    expect(p).toContain("抜粋に書かれていないことは答えないでください");
    expect(p).toContain("answer を null にしてください");
    expect(p).toContain("そのまま写してください");
  });
  it("断片の文書名が入っている", () => {
    expect(buildPrompt("質問です", [SAMPLE_CHUNK])).toContain("経費精算ルール.txt");
  });
});

describe("parseResult", () => {
  // 形式を見る。内容は見ない（3-3-9 2-4）
  it("正常な JSON を読める", () => {
    const r = parseResult('{"answer":"回答です","sources":[{"document":"a.md","excerpt":"抜粋"}]}');
    expect(typeof r.answer).toBe("string");
    expect(Array.isArray(r.sources)).toBe(true);
  });
  it("answer が null でも読める", () => {
    expect(parseResult('{"answer":null,"sources":[]}').answer).toBeNull();
  });
  it("コードフェンスで囲まれていても読める", () => {
    expect(parseResult('```json\n{"answer":null,"sources":[]}\n```').answer).toBeNull();
  });
  it("sources は3件を超えない", () => {
    const many = Array.from({ length: 5 }, (_, i) => ({ document: `d${i}.md`, excerpt: "x" }));
    const r = parseResult(JSON.stringify({ answer: "a", sources: many }));
    expect(r.sources).toHaveLength(3);
  });
  it("JSON でなければ MalformedResponseError", () => {
    expect(() => parseResult("承知しました。回答は…")).toThrow(MalformedResponseError);
  });
  it("answer が数値なら MalformedResponseError", () => {
    expect(() => parseResult('{"answer":42,"sources":[]}')).toThrow(MalformedResponseError);
  });
  it("sources が配列でなければ MalformedResponseError", () => {
    expect(() => parseResult('{"answer":null,"sources":"なし"}')).toThrow(MalformedResponseError);
  });
});

describe("enforceGrounding", () => {
  it("根拠が0件なら answer を落とす", () => {
    expect(enforceGrounding({ answer: "それらしい回答", sources: [] }).answer).toBeNull();
  });
  it("根拠があれば残す", () => {
    const r = enforceGrounding({ answer: "回答", sources: [{ document: "a.md", excerpt: "x" }] });
    expect(r.answer).toBe("回答");
  });
});
