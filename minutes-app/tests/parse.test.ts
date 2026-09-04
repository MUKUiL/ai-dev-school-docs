// 構造化出力のパース。判定できるのは「形式」だけ（2-2-4）
import { describe, expect, it } from "vitest";
import { parseSummary } from "@/lib/parse";

const valid = JSON.stringify({
  summary: "予算を承認した。次回は来週。",
  actions: [{ owner: "田中", task: "見積もりを出す", due: "9/5" }],
});

describe("parseSummary（F-2・F-3）", () => {
  it("素の JSON をパースできる", () => {
    const r = parseSummary(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.summary).toContain("予算");
      expect(r.value.actions).toHaveLength(1);
    }
  });

  it("コードフェンスで包まれていてもパースできる", () => {
    const r = parseSummary("```json\n" + valid + "\n```");
    expect(r.ok).toBe(true);
  });

  it("前後に説明文が付いていてもパースできる", () => {
    const r = parseSummary(`承知しました。\n${valid}\n以上です。`);
    expect(r.ok).toBe(true);
  });

  it("アクションが0件でも成功として扱う", () => {
    // 0件は異常ではない。アクションの無い会議は現実にある（2-2-4）
    const r = parseSummary(JSON.stringify({ summary: "報告のみ。", actions: [] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.actions).toEqual([]);
  });

  it("owner と due が欠けていたら「未定」で埋める", () => {
    const r = parseSummary(JSON.stringify({ summary: "s", actions: [{ task: "資料作成" }] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.actions[0]).toEqual({ owner: "未定", task: "資料作成", due: "未定" });
    }
  });

  it("task が空の項目は落とす", () => {
    const r = parseSummary(JSON.stringify({ summary: "s", actions: [{ owner: "田中" }] }));
    expect(r.ok && r.value.actions).toEqual([]);
  });

  it("JSON が無ければ失敗する", () => {
    const r = parseSummary("要約はできませんでした。");
    expect(r.ok).toBe(false);
  });

  it("壊れた JSON は失敗する", () => {
    const r = parseSummary('{"summary": "s", "actions": [');
    expect(r.ok).toBe(false);
  });

  it("summary が欠けていたら失敗する", () => {
    expect(parseSummary(JSON.stringify({ actions: [] })).ok).toBe(false);
  });

  it("summary が空文字なら失敗する", () => {
    expect(parseSummary(JSON.stringify({ summary: "  ", actions: [] })).ok).toBe(false);
  });

  it("actions が配列でなければ失敗する", () => {
    expect(parseSummary(JSON.stringify({ summary: "s", actions: "なし" })).ok).toBe(false);
  });

  it("失敗したときは理由が付く", () => {
    const r = parseSummary("これは JSON ではありません");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason.length).toBeGreaterThan(0);
  });
});
