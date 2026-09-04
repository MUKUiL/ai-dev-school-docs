"use client";
// ブラウザ側。API キーも SDK もここには登場しない（2-4-11）
import { useState } from "react";
import type { SummaryResult } from "@/lib/types";

type State = "idle" | "loading" | "done" | "error";

export default function SummarizeForm() {
  const [text, setText] = useState("");
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setState("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "要約に失敗しました。");
        setState("error");
        return;
      }
      setResult(data);
      setState("done");
    } catch {
      // 通信そのものが失敗しても画面は操作可能なまま（F-4）
      setError("通信に失敗しました。接続を確認して、もう一度お試しください。");
      setState("error");
    }
  }

  return (
    <div className="form">
      <textarea
        aria-label="議事録"
        placeholder="議事録を貼り付けてください"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
      />
      <button onClick={handleSubmit} disabled={state === "loading"}>
        {state === "loading" ? "要約しています…" : "要約する"}
      </button>

      {/* ローディング・空・エラーの3状態を必ず作る（2-4-13） */}
      {state === "loading" && <p className="status">処理中です。しばらくお待ちください。</p>}

      {state === "error" && (
        <div className="status error" role="alert">
          <p>{error}</p>
          <button onClick={handleSubmit}>もう一度試す</button>
        </div>
      )}

      {state === "done" && result && (
        <section className="result">
          <h2>要約</h2>
          <p>{result.summary}</p>

          <h2>アクション項目</h2>
          {result.actions.length === 0 ? (
            <p className="empty">アクション項目はありません。</p>
          ) : (
            <ul>
              {result.actions.map((a, i) => (
                <li key={i}>
                  <span className="owner">{a.owner}</span>
                  <span className="task">{a.task}</span>
                  <span className="due">{a.due}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
