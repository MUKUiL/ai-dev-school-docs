import type { Clients, EmbeddingClient, MessagesClient, VectorStore } from "../lib/clients";
import type { Chunk, ScoredChunk } from "../lib/types";

/** 呼び出し回数を数える偽物。本物は呼ばない（3-3-9 2-2）。 */
export function makeFakes(options?: {
  chunks?: ScoredChunk[];
  response?: string | (() => string);
  embedThrows?: unknown;
  searchThrows?: unknown;
  generateThrows?: unknown;
}) {
  const counts = { embed: 0, search: 0, generate: 0 };
  const stored: Array<Chunk & { embedding: number[] }> = [];

  const embedding: EmbeddingClient = {
    async embed(texts) {
      counts.embed += 1;
      if (options?.embedThrows) throw options.embedThrows;
      return texts.map(() => [0.1, 0.2, 0.3]);
    },
  };
  const vectorStore: VectorStore = {
    async upsert(chunks) {
      stored.push(...chunks);
    },
    async search() {
      counts.search += 1;
      if (options?.searchThrows) throw options.searchThrows;
      return options?.chunks ?? [];
    },
  };
  const messages: MessagesClient = {
    async complete() {
      counts.generate += 1;
      if (options?.generateThrows) throw options.generateThrows;
      const r = options?.response;
      return typeof r === "function" ? r() : (r ?? '{"answer":null,"sources":[]}');
    },
  };
  const clients: Clients = { embedding, vectorStore, messages };
  return { clients, counts, stored };
}

export const SAMPLE_CHUNK: ScoredChunk = {
  document: "経費精算ルール.txt",
  index: 0,
  text: "経費精算は毎月末日締めとし、翌月5日までに申請する。",
  similarity: 0.91,
};
