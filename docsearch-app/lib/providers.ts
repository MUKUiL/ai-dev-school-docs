// 本物のクライアント。テストからは呼ばれない（tests/ は tests/fakes.ts を使う）。
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import type { Clients, EmbeddingClient, MessagesClient, VectorStore } from "./clients";
import type { Chunk, ScoredChunk } from "./types";

export const EMBEDDING_MODEL = "text-embedding-3-small";
/** chunks 表の vector(N) と一致していなければならない（3-3-8 2-3） */
export const EMBEDDING_DIMENSIONS = 1536;
export const GENERATION_MODEL = "claude-sonnet-5";

export function makeClients(): Clients {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );

  const embedding: EmbeddingClient = {
    async embed(texts) {
      // まとめて送る。1件ずつ送らない（3-3-10）
      const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
      return res.data.map((d) => d.embedding as number[]);
    },
  };

  const vectorStore: VectorStore = {
    async upsert(chunks) {
      const rows = chunks.map((c) => ({
        document: c.document,
        chunk_index: c.index,
        content: c.text,
        embedding: c.embedding,
      }));
      // document と chunk_index で上書きする。2回取り込んでも重複しない（F-4）
      const { error } = await supabase
        .from("chunks")
        .upsert(rows, { onConflict: "document,chunk_index" });
      if (error) throw error;
    },
    async search(vector, limit) {
      // 距離で並べ替えて索引を効かせる。SQL は docs/schema.sql の match_chunks を参照
      const { data, error } = await supabase.rpc("match_chunks", {
        query_embedding: vector,
        match_count: limit,
      });
      if (error) throw error;
      return (data ?? []).map(
        (r: { document: string; chunk_index: number; content: string; similarity: number }): ScoredChunk => ({
          document: r.document,
          index: r.chunk_index,
          text: r.content,
          similarity: r.similarity,
        }),
      );
    },
  };

  const messages: MessagesClient = {
    async complete(prompt) {
      const res = await anthropic.messages.create({
        model: GENERATION_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });
      const first = res.content[0];
      return first && first.type === "text" ? first.text : "";
    },
  };

  return { embedding, vectorStore, messages };
}

export type { Chunk };
