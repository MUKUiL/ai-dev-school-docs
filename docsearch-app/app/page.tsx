"use client";

import { useState } from "react";
import type { AskResult } from "@/lib/types";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; result: AskResult }
  | { kind: "error"; message: string };

export default function Page() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: body?.error?.message ?? "処理に失敗しました。" });
        return;
      }
      setState({ kind: "done", result: body as AskResult });
    } catch {
      setState({ kind: "error", message: "通信に失敗しました。接続を確認してください。" });
    }
  }

  return (
    <main className="app">
      <h1>社内文書 検索・質問</h1>

      <form className="form" onSubmit={onSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="例：経費の申請期限はいつですか"
          aria-label="質問"
        />
        <button className="btn" type="submit" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "検索中…" : "質問する"}
        </button>
      </form>

      {/* 3状態を必ず作る（2-4-13） */}
      {state.kind === "loading" && <p className="hint">社内文書を検索しています…</p>}

      {state.kind === "error" && (
        <div className="error" role="alert">
          <p>{state.message}</p>
          <p className="hint">時間をおいてもう一度お試しください。</p>
        </div>
      )}

      {state.kind === "done" && (
        <section className="result">
          {state.result.answer === null ? (
            <>
              <h2>回答</h2>
              <p>この質問には、社内文書からはお答えできませんでした。</p>
              <p className="hint">
                件数を数える質問、いつ変わったかを問う質問、「〜でない場合」を問う質問は、
                この仕組みでは扱えません。
              </p>
            </>
          ) : (
            <>
              <h2>回答</h2>
              <p>{state.result.answer}</p>
              <h2>根拠（{state.result.sources.length}件）</h2>
              <ul>
                {state.result.sources.map((s, i) => (
                  <li key={i}>
                    <span className="doc">{s.document}</span>
                    <span className="excerpt">「{s.excerpt}」</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </main>
  );
}
