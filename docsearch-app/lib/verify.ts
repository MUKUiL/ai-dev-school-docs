import type { AskResult, RawDoc } from "./types";

export type SourceVerdict = {
  document: string;
  documentExists: boolean;
  excerptFound: boolean;
};

/**
 * F-2 の合格条件③④を機械で判定する。
 * 「回答が正しいか」は判定できないが、「示した根拠が実在するか」は判定できる。
 */
export function verifySources(result: AskResult, corpus: RawDoc[]): SourceVerdict[] {
  const byName = new Map(corpus.map((d) => [d.document, d]));
  return result.sources.map((s) => {
    const doc = byName.get(s.document);
    return {
      document: s.document,
      documentExists: doc !== undefined,
      // 空白の違いを吸収してから部分一致を見る
      excerptFound: doc !== undefined && normalize(doc.text).includes(normalize(s.excerpt)),
    };
  });
}

export function allSourcesReal(verdicts: SourceVerdict[]): boolean {
  return verdicts.every((v) => v.documentExists && v.excerptFound);
}

function normalize(s: string): string {
  return s.replace(/[\s　]+/g, "");
}
