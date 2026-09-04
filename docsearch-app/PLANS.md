# 検索・質問アプリ 実装計画

> **この計画の使い方**：[docs/procedure/implementation.md](./docs/procedure/implementation.md) §6 の起動プロンプト「PLANS.md に従って T1 から T13 まで実装を進めてください」で参照される実行計画。テンプレートは `2-3-7` の6項目（目的・スコープ・タスク・完了条件・決定事項・リスク）。
>
> **このリポジトリは完成形サンプルのため、タスクはすべてチェック済みの状態で置いてある。**自分のアプリで使うときは、チェックを外した状態から始め、タスクが終わるたびにエージェント自身に更新させる。

## 1. 目的

`docs/spec.md` の受け入れ基準 F-1〜F-6 を満たす RAG アプリ（検索・質問）を実装し、`npm run verify` が緑の状態で完了報告する。

## 2. スコープ

**やること**：`lib/` ／ `app/` ／ `scripts/` ／ `tests/` の実装一式
**やらないこと**：`docs/spec.md` 6章のとおり（横断集計・時系列・一般知識には答えない）。**`npm run ingest` の実行・外部サービスへの実接続・非機能の測定・デプロイもこの計画では行わない**（人の作業。[docs/procedure/implementation.md](./docs/procedure/implementation.md) §8〜§9）。

## 3. タスク

- [x] T1 `lib/types.ts` ── spec 3章の型（`AskResult`・`Source`）・失敗の分類（`FailureKind`・`AskError` の `service` 欄）
- [x] T2 `lib/validate.ts` ＋テスト ── 5〜200文字。境界4件（4字・5字・200字・201字）
- [x] T3 `lib/clients.ts` ＋ `tests/fakes.ts` ── 外部3サービスの最小インターフェースと、呼び出し回数を数えられる偽物
- [x] T4 `lib/chunk.ts` ＋テスト ── 文書の分割（T1 のみに依存。T5〜T7 と並列可）
- [x] T5 `lib/prompt.ts` ＋テスト ── プロンプト組み立て・`parseResult`・`enforceGrounding`（T1 のみに依存。並列可）
- [x] T6 `lib/verify.ts` ＋テスト ── 根拠の実在チェック。要約された抜粋は不合格（T1 のみに依存。並列可）
- [x] T7 `lib/errors.ts` ＋テスト ── `classify`（transient／permanent／malformed）と利用者向け `code`（T1 のみに依存。並列可）
- [x] T8 `lib/ask.ts` ＋統合テスト ── T2〜T7 を束ねる。形式の崩れは1回だけ再試行
- [x] T9 `lib/logger.ts` ── `AskLog` に質問文・回答本文・抜粋の欄を作らない
- [x] T10 `lib/providers.ts` ＋ `lib/env.ts` ── SDK の実装と `assertEnv`（**テスト対象外**）
- [x] T11 `app/api/ask/route.ts` ＋ `app/page.tsx` ── 入口と3状態（loading／done／error）の画面
- [x] T12 `scripts/ingest.ts` ── 件数表示・重複防止（**実装のみ。実行しない**）
- [x] T13 突き合わせ ── F-1〜F-6 と実装・テストの対応表（[docs/procedure/README.md](./docs/procedure/README.md) ステップ13 の表）

## 4. 完了条件

| タスク | 完了と言える条件 |
| --- | --- |
| 共通 | `npm run verify` が緑。`tests/` が `lib/providers.ts` と SDK を import していない |
| T2 | 境界4件のテストが通る |
| T3 | 偽物3つがインターフェースを満たし、呼び出し回数を数えられる |
| T8 | 統合テストに「4文字の質問 → 外部の呼び出し回数が0」「検索0件 → 生成の呼び出し回数が0」がある |
| T9 | ログの型に本文の欄が無い（書こうとすると型で落ちる） |
| T12 | ingest は実装のみ。**実行していない** |
| T13 | F-1〜F-6 の各行に、実装とテスト（または「手動確認」「型で守る」の旨）が埋まっている |

## 5. 決定事項

| # | 決めたこと | 選ばなかった案 | 理由 |
| --- | --- | --- | --- |
| D1 | インターフェース先行（T3 を早く作る） | SDK から書き始める | 判定器（verify）をキー無し・0円で回すため |
| D2 | 断片0件なら生成を呼ばない（`enforceGrounding`） | プロンプトで「答えるな」と頼むだけ | 呼ばなければ作話できない（F-3。この案件の合否を分ける基準） |
| D3 | 形式の崩れの再試行は1回だけ | 最大2回（minutes-app と同じ） | 同じプロンプトなら同じように壊れやすい。繰り返しは費用を捨てるだけ |

## 6. リスク

| # | リスク | 気づき方 | 起きたときの対応 |
| --- | --- | --- | --- |
| R1 | 構成の選び直しを始める（別のベクトル DB の提案など） | `docs/adr/` に無いサービス名が差分に出る | `CLAUDE.md`「設計の固定」。出たら止める |
| R2 | テストが外部を呼ぶ構造になる | `tests/` の import に SDK・`providers.ts` が現れる | 完了条件（共通）で検査。検収でも見る |
| R3 | 同じエラーで堂々巡りする | 同一テストの失敗が3回続く | 止めて報告（`CLAUDE.md` 停止条件） |
| R4 | `npm run ingest` を実行しようとする | パーミッション（`ask`）の確認が来る | 承認しない。この計画では実装のみと伝える |

---

## 実装後の状態（このサンプルでの記録）

| 項目 | 状態 |
| --- | --- |
| `npm run verify` | 単体・統合テスト48件通過（詳細は [README.md](./README.md) の「検証の状況」） |
| ingest の実行・外部サービスへの実接続・非機能の測定 | **未実施**（スコープ外。手順は [docs/procedure/implementation.md](./docs/procedure/implementation.md) §8〜§9） |
