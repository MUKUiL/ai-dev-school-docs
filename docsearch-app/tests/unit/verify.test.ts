import { describe, expect, it } from "vitest";
import { allSourcesReal, verifySources } from "../../lib/verify";
import type { RawDoc } from "../../lib/types";

const corpus: RawDoc[] = [
  {
    document: "経費精算ルール.txt",
    text: "経費精算は毎月末日締めとし、翌月5日までに申請する。",
    updatedAt: "2026-08-11",
  },
];

describe("verifySources（F-2 の合格条件③④）", () => {
  it("実在する文書名と抜粋なら合格", () => {
    const v = verifySources(
      { answer: "…", sources: [{ document: "経費精算ルール.txt", excerpt: "翌月5日までに申請する" }] },
      corpus,
    );
    expect(allSourcesReal(v)).toBe(true);
  });

  it("存在しない文書名は不合格", () => {
    const v = verifySources(
      { answer: "…", sources: [{ document: "存在しない.txt", excerpt: "翌月5日" }] },
      corpus,
    );
    expect(v[0].documentExists).toBe(false);
    expect(allSourcesReal(v)).toBe(false);
  });

  it("要約された抜粋は不合格（そのまま写していない）", () => {
    const v = verifySources(
      { answer: "…", sources: [{ document: "経費精算ルール.txt", excerpt: "月末締めの翌月5日申請" }] },
      corpus,
    );
    expect(v[0].excerptFound).toBe(false);
  });

  it("空白の違いは吸収する", () => {
    const v = verifySources(
      { answer: "…", sources: [{ document: "経費精算ルール.txt", excerpt: "翌月 5日までに 申請する" }] },
      corpus,
    );
    expect(v[0].excerptFound).toBe(true);
  });
});
