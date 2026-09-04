// サーバー側。ブラウザには配られない（2-4-11・3-3-11）
import { ask } from "@/lib/ask";
import { assertEnv } from "@/lib/env";
import { makeClients } from "@/lib/providers";

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    assertEnv();
  } catch (e) {
    // 何が無いかは書く。値は書かない
    return Response.json(
      { error: { code: "CONFIG", message: (e as Error).message, kind: "permanent" }, requestId },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const res = await ask((body as { question?: unknown }).question, {
    clients: makeClients(),
    requestId,
  });

  return Response.json(res.ok ? res.body : { ...res.body, requestId }, { status: res.status });
}
