import type { Clients } from "./clients";
import { toAskError, classify } from "./errors";
import { consoleLogger, type Logger } from "./logger";
import { buildPrompt, enforceGrounding, MalformedResponseError, parseResult, MAX_SOURCES } from "./prompt";
import type { AskError, AskResult } from "./types";
import { validateQuestion } from "./validate";

export type AskDeps = {
  clients: Clients;
  logger?: Logger;
  now?: () => number;
  requestId: string;
};

export type AskResponse =
  | { ok: true; status: 200; body: AskResult }
  | { ok: false; status: number; body: { error: AskError } };

/**
 * 質問1回の流れ。1 検証 → 2 埋め込み → 3 検索 → 4 組み立て → 5 生成 → 6 整形。
 * 1 で弾けば、外部は1回も呼ばれない。
 */
export async function ask(input: unknown, deps: AskDeps): Promise<AskResponse> {
  const { clients, requestId } = deps;
  const logger = deps.logger ?? consoleLogger;
  const now = deps.now ?? Date.now;
  const calls = { embed: 0, vectorSearch: 0, generate: 0 };
  const t0 = now();

  const validated = validateQuestion(input);
  if (!validated.ok) {
    const error = { ...toAskError("INVALID_INPUT", "permanent", "app"), message: validated.reason };
    logger.warn({
      event: "ask.failed", requestId, durationMs: now() - t0, calls,
      questionLength: typeof input === "string" ? input.length : 0,
      sourceCount: 0, answered: false, errorCode: error.code, errorService: error.service,
    });
    return { ok: false, status: 400, body: { error } };
  }
  const question = validated.question;

  const fail = (code: string, service: AskError["service"], cause: unknown, status: number): AskResponse => {
    const httpStatus = (cause as { status?: number } | undefined)?.status;
    const error = toAskError(code, classify(httpStatus, cause), service);
    logger.warn({
      event: "ask.failed", requestId, durationMs: now() - t0, calls,
      questionLength: question.length, sourceCount: 0, answered: false,
      errorCode: error.code, errorService: error.service,
    });
    return { ok: false, status, body: { error } };
  };

  let vector: number[];
  const t1 = now();
  try {
    calls.embed += 1;
    [vector] = await clients.embedding.embed([question]);
  } catch (e) {
    return fail("EMBEDDING_FAILED", "embedding", e, 502);
  }

  const t2 = now();
  let chunks;
  try {
    calls.vectorSearch += 1;
    chunks = await clients.vectorStore.search(vector, MAX_SOURCES);
  } catch (e) {
    return fail("SEARCH_FAILED", "vectorStore", e, 502);
  }

  // 断片が0件なら、生成を呼ばずに「答えられない」を返す（F-3・費用の節約）
  if (chunks.length === 0) {
    const body: AskResult = { answer: null, sources: [] };
    logger.info({
      event: "ask.done", requestId, durationMs: now() - t0, calls,
      questionLength: question.length, sourceCount: 0, answered: false,
    });
    return { ok: true, status: 200, body };
  }

  const t3 = now();
  let raw: string;
  try {
    calls.generate += 1;
    raw = await clients.messages.complete(buildPrompt(question, chunks));
  } catch (e) {
    return fail("GENERATION_FAILED", "generation", e, 502);
  }

  let result: AskResult;
  try {
    result = enforceGrounding(parseResult(raw));
  } catch (e) {
    if (e instanceof MalformedResponseError) {
      // 形式の崩れは1回だけ再試行する。同じプロンプトなら同じように壊れるため、それ以上は繰り返さない
      try {
        calls.generate += 1;
        const retry = await clients.messages.complete(buildPrompt(question, chunks));
        result = enforceGrounding(parseResult(retry));
      } catch (e2) {
        return fail("MALFORMED_RESPONSE", "generation", e2, 502);
      }
    } else {
      return fail("INTERNAL", "app", e, 500);
    }
  }

  const t4 = now();
  logger.info({
    event: "ask.done", requestId, durationMs: t4 - t0, calls,
    timing: { embedMs: t2 - t1, searchMs: t3 - t2, generateMs: t4 - t3 },
    questionLength: question.length,
    sourceCount: result.sources.length,
    answered: result.answer !== null,
  });
  return { ok: true, status: 200, body: result };
}
