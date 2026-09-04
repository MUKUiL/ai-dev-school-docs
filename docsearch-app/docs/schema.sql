-- Supabase（PostgreSQL）側の定義。SQL エディタから1回だけ実行する。
-- 参照：https://supabase.com/docs/guides/ai/vector-columns （参照日 2026-08-11）

create extension if not exists vector with schema extensions;

create table if not exists chunks (
  id bigserial primary key,
  document text not null,
  chunk_index int not null,
  content text not null,
  -- 次元数は埋め込みモデルの出力と一致していなければならない。
  -- モデルを変えるときは、この列ごと作り直す（3-3-8 2-3）
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  unique (document, chunk_index)
);

-- 近傍検索。距離で並べ替えて索引を効かせ、表示用に類似度を返す。
create or replace function match_chunks(
  query_embedding extensions.vector(1536),
  match_count int
)
returns table (document text, chunk_index int, content text, similarity float)
language sql stable
as $$
  select c.document, c.chunk_index, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from chunks c
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
