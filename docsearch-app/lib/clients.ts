// 外部サービスとの境界。テストではここを差し替えるので、本物を呼ばずに検証できる（3-3-9）。
import type { Chunk, ScoredChunk } from "./types";

export interface EmbeddingClient {
  /** まとめて送る。1件ずつ送らない（3-3-10 の N+1 と同じ構造） */
  embed(texts: string[]): Promise<number[][]>;
}

export interface VectorStore {
  upsert(chunks: Array<Chunk & { embedding: number[] }>): Promise<void>;
  search(vector: number[], limit: number): Promise<ScoredChunk[]>;
}

export interface MessagesClient {
  complete(prompt: string): Promise<string>;
}

export type Clients = {
  embedding: EmbeddingClient;
  vectorStore: VectorStore;
  messages: MessagesClient;
};
