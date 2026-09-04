# 議事録要約アプリ 実装計画

> **この計画の使い方**：[docs/procedure/implementation.md](./docs/procedure/implementation.md) §6 の起動プロンプト「PLANS.md に従って T1 から T10 まで実装を進めてください」で参照される実行計画。テンプレートは `2-3-7` の6項目（目的・スコープ・タスク・完了条件・決定事項・リスク）。
>
> **このリポジトリは完成形サンプルのため、タスクはすべてチェック済みの状態で置いてある。**自分のアプリで使うときは、チェックを外した状態から始め、タスクが終わるたびにエージェント自身に更新させる。

## 1. 目的

`docs/spec.md` の受け入れ基準 F-1〜F-5 を満たす議事録要約アプリを実装し、`./scripts/verify` が緑の状態で完了報告する。

## 2. スコープ

**やること**：`lib/` ／ `app/` ／ `components/` ／ `tests/` の実装一式
**やらないこと**：`docs/spec.md`「7. やらないこと」のとおり（保存・履歴、音声、要約内容の正しさの判定）。**実 API を呼んだ動作確認とデプロイもこの計画では行わない**（人の作業。[docs/procedure/implementation.md](./docs/procedure/implementation.md) §8〜§9）。

## 3. タスク

- [x] T1 `lib/types.ts` ── spec 3章の型（`SummaryResult`・`ActionItem`）と `FailureKind`（7分類）
- [x] T2 `lib/validate.ts` ＋テスト ── 空・空白のみ・8,000 文字境界。送る前に止める
- [x] T3 `lib/prompt.ts` ── 役割・出力形式・制約（0件は空配列、不明は「未定」）
- [x] T4 `lib/parse.ts` ＋テスト ── 形式だけを検証。欠けたフィールドは「未定」で埋める
- [x] T5 `lib/retry.ts` ＋テスト ── 入力起因はリトライしない。最大2回（呼び出し総数3回）
- [x] T6 `lib/summarize.ts` ＋テスト ── `MessagesClient` 最小インターフェースに依存
- [x] T7 `lib/logger.ts` ＋テスト ── `LogRecord` に本文のフィールドを作らない
- [x] T8 `app/api/summarize/route.ts` ＋テスト ── 400 のとき API 未呼び出し。内部詳細を返さない
- [x] T9 `components/SummarizeForm.tsx` ＋ `app/page.tsx` ── loading／error／done の3状態
- [x] T10 突き合わせ ── F-1〜F-5 と実装・テストの対応表（[docs/procedure/README.md](./docs/procedure/README.md) ステップ10 の表）

## 4. 完了条件

| タスク | 完了と言える条件 |
| --- | --- |
| T1〜T9 共通 | `./scripts/verify` が緑。テストは外部 API を呼んでいない |
| T2 | 空・空白のみ・8,000 ちょうど・8,001 の4件のテストが通る |
| T5 | 呼び出し回数を数えるテストで、入力起因1回・その他最大3回 |
| T8 | 空入力で 400、かつモックの `messages.create` が未呼び出し |
| T10 | F-1〜F-5 の各行に実装ファイルとテストファイルが埋まっている |

## 5. 決定事項

| # | 決めたこと | 選ばなかった案 | 理由 |
| --- | --- | --- | --- |
| D1 | 検証は送信前（`validate`） | API 応答後にエラー処理 | 費用が出ない位置で止める |
| D2 | SDK 全体でなく `MessagesClient` に依存 | SDK の型を直接使う | モックを数行にする |

## 6. リスク

| # | リスク | 気づき方 | 起きたときの対応 |
| --- | --- | --- | --- |
| R1 | 同じエラーの修正が堂々巡りする | 同一テストの失敗が3回続く | **止めて報告**（`CLAUDE.md` 停止条件） |
| R2 | 仕様に無い判断が必要になる | `docs/spec.md` に該当箇所が無い | **止めて質問**。推測で進めない |
| R3 | テストを実装に合わせて緩める | 期待値の変更が差分に混ざる | `CLAUDE.md` で禁止＋終了後の差分レビュー |

---

## 実装後の状態（このサンプルでの記録）

| 項目 | 状態 |
| --- | --- |
| `./scripts/verify` | 型チェック・本番ビルド・**テスト49件**通過（コンテナ内で `npm run verify` を実行。内訳は [README.md](./README.md) の「検証の範囲」） |
| 実 API を呼んだ動作・実際の費用と所要時間・Docker コンテナ内での実行 | **未検証**（スコープ外。手順は [docs/procedure/implementation.md](./docs/procedure/implementation.md) §8〜§9） |
