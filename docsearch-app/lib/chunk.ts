import type { Chunk, RawDoc } from "./types";

export type ChunkOptions = {
  /** 1断片の最大文字数 */
  size: number;
  /** 隣の断片と重ねる文字数 */
  overlap: number;
  /** 見出しで先に区切るか（規程類は true が効きやすい・3-3-8 2-2） */
  byHeading: boolean;
};

const HEADING = /^(#{1,6}\s+.*|第[０-９0-9一二三四五六七八九十]+条（.*）|\d+\.\s+.*)$/;

/** 見出し行で区切る。見出しは後続の本文と同じ断片に入れる。 */
function splitByHeading(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    if (HEADING.test(line.trim()) && buf.some((l) => l.trim() !== "")) {
      blocks.push(buf.join("\n").trim());
      buf = [];
    }
    buf.push(line);
  }
  if (buf.some((l) => l.trim() !== "")) blocks.push(buf.join("\n").trim());
  return blocks.filter((b) => b !== "");
}

/** 長いブロックを size で割る。割るときだけ overlap を重ねる。 */
function splitBySize(block: string, size: number, overlap: number): string[] {
  if (block.length <= size) return [block];
  const step = Math.max(1, size - overlap);
  const out: string[] = [];
  for (let i = 0; i < block.length; i += step) {
    out.push(block.slice(i, i + size));
    if (i + size >= block.length) break;
  }
  return out;
}

export function chunk(doc: RawDoc, options: ChunkOptions): Chunk[] {
  const { size, overlap, byHeading } = options;
  if (overlap >= size) {
    throw new Error("overlap は size より小さくしてください");
  }
  const blocks = byHeading ? splitByHeading(doc.text) : [doc.text];
  const texts = blocks.flatMap((b) => splitBySize(b, size, overlap));
  return texts
    .map((t) => t.trim())
    .filter((t) => t !== "")
    .map((text, index) => ({ document: doc.document, index, text }));
}
