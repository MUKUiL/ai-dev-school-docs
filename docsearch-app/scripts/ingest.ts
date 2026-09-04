/**
 * 取り込み（運用者が手元で1回だけ実行する）。
 * Route Handler では実行しない。実行時間の制約に当たると、
 * 一部だけ取り込まれた状態が残るため（3-3-11 2-1）。
 *
 *   npm run ingest -- corpus            全件
 *   npm run ingest -- corpus --limit 5  比較用に5件だけ
 */
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { chunk } from "../lib/chunk";
import { assertEnv } from "../lib/env";
import { makeClients } from "../lib/providers";
import type { RawDoc } from "../lib/types";

const BATCH = 100; // まとめて送る。1件ずつ送らない（3-3-10）

async function loadDocs(dir: string): Promise<RawDoc[]> {
  const names = (await readdir(dir)).filter((n) => [".md", ".txt"].includes(extname(n)));
  const docs: RawDoc[] = [];
  for (const name of names) {
    const text = await readFile(join(dir, name), "utf-8");
    docs.push({ document: name, text, updatedAt: new Date().toISOString().slice(0, 10) });
  }
  return docs;
}

async function main() {
  assertEnv();
  const dir = process.argv[2] ?? "corpus";
  const limitArg = process.argv.indexOf("--limit");
  const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : undefined;

  const all = await loadDocs(dir);
  const docs = limit ? all.slice(0, limit) : all;

  // PDF は抽出が不安定なので、この雛形では対象外にしている。
  // 対応するときは、抽出結果を目で確認してから取り込むこと（3-3-8 2-1）。
  const skipped = (await readdir(dir)).filter((n) => extname(n) === ".pdf").length;

  const clients = makeClients();
  let ok = 0;
  let failed = 0;

  for (const doc of docs) {
    try {
      const chunks = chunk(doc, { size: 800, overlap: 100, byHeading: true });
      for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const vectors = await clients.embedding.embed(batch.map((c) => c.text));
        await clients.vectorStore.upsert(
          batch.map((c, j) => ({ ...c, embedding: vectors[j] })),
        );
      }
      ok += 1;
      console.log(`  取り込み完了: ${doc.document}（断片 ${chunks.length} 個）`);
    } catch (e) {
      failed += 1;
      console.error(`  失敗: ${doc.document} — ${(e as Error).message}`);
    }
  }

  // 何件処理し、何件失敗したかを最後に必ず出す（F-4）
  console.log(`\n処理 ${ok} 件 / 失敗 ${failed} 件 / 未対応の形式 ${skipped} 件（PDF）`);
  if (failed > 0) process.exitCode = 1;
}

main();
