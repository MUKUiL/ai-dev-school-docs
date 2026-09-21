# 「テックバディ」サンプルアプリ一覧（フルスタックAIエンジニア育成コース）

本リポジトリ `ai-dev-school-docs` は、カリキュラムで参照する**完成形・演習用サンプルコード**の正本です。

> **パスの読み替え**：教材本文では `samples/todo-app/` のように書かれています。
> 本リポジトリでは直下の `./todo-app/` が同じ位置づけです。

- **最終更新**：2026-09-21
- **対象**：受講生・講師・教材編集者
- **準拠**：Constitution v2.0.0／カリキュラム案 Ver2

---

## 受講生の方へ：まずこれだけ

```bash
git clone https://github.com/MUKUiL/ai-dev-school-docs.git
cd ai-dev-school-docs
```

| 使う場面 | 必要なもの |
| --- | --- |
| Phase 1・静的版 | ブラウザのみ（インストール不要） |
| Phase 1・Next.js 版 | Node.js 22 系（Next.js 16 の要件は 20.9 以上） |
| Phase 2・3 | Docker Desktop（**ホストに Node.js は不要**） |

**本リポジトリのファイルは直接編集しません。**使うときは自分の作業ディレクトリへコピーします。

```bash
cp -r todo-app/03-broken ~/todo-nextjs-broken   # 例：M1-7 の欠陥仕込み版
```

---

## このディレクトリの役割

| 役割 | 説明 |
| --- | --- |
| **完成形の見本** | ハンズオン後に「同じ役割分担になっているか」を突き合わせる |
| **固定プロンプトの参照元** | 教材本文が指すプロンプト・ファイル構成をそのまま収録 |
| **演習用の配布物** | 欠陥仕込み版など、コピーして使う題材 |
| **参照資料の置き場** | 議事録・要件定義テンプレートなど |

**本リポジトリ自体をハンズオンの主作業場所にしないでください。**
各 Phase で決めた**受講生用ディレクトリ**（下表）に、自分のリポジトリとして作業します。

---

## 受講生の作業ディレクトリとサンプルの関係

| Phase | 題材 | 受講生が触る場所 | 完成形サンプル |
| --- | --- | --- | --- |
| **Phase 1** | ToDo アプリ | `~/todo-nextjs`（静的版は任意のフォルダ） | [`todo-app/`](./todo-app/) |
| **Phase 2** | 議事録要約 | `~/minutes-app` | [`minutes-app/`](./minutes-app/) |
| **Phase 3** | 社内文書検索（RAG） | `~/projects/docsearch-app` | [`docsearch-app/`](./docsearch-app/) |

**Phase 3 では Phase 2 の `~/minutes-app` を編集しません。**
Skill や `CLAUDE.md` の**型をコピーして docsearch 用に作り直す**ことは M3-5 で許されます。

---

## Phase 別：何をいつ使うか

### Phase 1 ── 小さなアプリを作る（`todo-app/`）

**目的**：Vibe Coding で作り、**どこで壊れるか**を体験する。フレームワーク作法の暗記ではありません。

| 節（例） | サンプルの使い方 |
| --- | --- |
| **M1-1**（1-1-1） | 完成形と見比べる → [`todo-app/01-static/`](./todo-app/01-static/) |
| **M1-1** 演習 | 解答例 → [`01-static-solution/`](./todo-app/01-static-solution/) |
| **M1-6**（1-2-6） | 固定プロンプト・Next.js 完成形 → [`docs/prompts.md`](./todo-app/docs/prompts.md)・[`02-nextjs/`](./todo-app/02-nextjs/) |
| **M1-7**（1-2-7） | 欠陥仕込み版を**コピー**して修正 → [`03-broken/`](./todo-app/03-broken/)（`DEFECTS.md` は演習中開かない） |
| **M1-8**（1-2-8） | テスト例・再デバッグ → [`02-nextjs/tests/`](./todo-app/02-nextjs/tests/)・`03-broken/` |

**動かし方の要点**

- 静的版：`index.html` をブラウザで開くだけ（インストール不要）
- Next.js 版：`02-nextjs/` または `03-broken/` で `npm install` → `npm run dev`（**`-g` は使わない**）

詳細は [`todo-app/README.md`](./todo-app/README.md) を参照してください。

---

### Phase 2 ── LLM API 連携（`minutes-app/`）

**目的**：仕様・ガードレール・判定器・Docker 開発環境を揃え、**1本の LLM 呼び出し**を安全に実装する。

| 段階 | サンプルで見るもの |
| --- | --- |
| 要件・仕様 | [`docs/requirements.md`](./minutes-app/docs/requirements.md)・[`docs/spec.md`](./minutes-app/docs/spec.md) |
| ガードレール | [`docs/guardrails.md`](./minutes-app/docs/guardrails.md)・[`CLAUDE.md`](./minutes-app/CLAUDE.md) |
| 実装手順 | [`docs/procedure/`](./minutes-app/docs/procedure/) |
| 完成コード | リポジトリ直下の `app/`・`lib/`・`tests/` |

**動かし方の要点**

- **実行は Docker 内**。入口はラッパーのみ。
  - `./scripts/verify` ── 型チェック＋テスト
  - `./scripts/dev` ── 開発サーバー（http://localhost:3000）
- ホストに Node.js を入れて `npm run dev` する手順は**教材の主経路ではありません**。
- Claude Code は**ホスト**で起動し、ファイル編集はマウントされたソースに対して行います。

詳細は [`minutes-app/README.md`](./minutes-app/README.md) を参照してください。

---

### Phase 3 ── RAG アプリ（`docsearch-app/`）

**目的**：要件を自分で起こし、設計・並列実装・検証・取り込みまで一通り経験する。

| 段階（教材） | サンプルで見るもの | 受講生リポジトリに増えるもの（目安） |
| --- | --- | --- |
| **M3-2〜M3-4** | `docs/` 一式（要件・仕様・ADR・`schema.sql` 等） | `docs/` のみ（アプリコードなし） |
| **M3-5 3-0** | Docker 土台・`CLAUDE.md`・`PLANS.md` | Next.js 骨組み・`scripts/ingest.ts` **枠** |
| **M3-6 3-3** | 並列骨組みの型 | `lib/types.ts`・スタブ `lib/ask.ts`・仮 UI |
| **M3-8** | 本番 `lib/*`・`app/api/ask/route.ts`・`corpus/` | **M3-8 完了マイルストーン**（テスト・DB・取り込み除く） |
| **M3-9** | テスト・`lib/verify.ts` | テスト一式 |
| **M3-11** | 取り込み・Supabase・デプロイ | `lib/chunk.ts`・ingest 本実装・ベクトル登録 |

**動かし方の要点**

- Phase 2 と同型：**`./scripts/verify`・`./scripts/dev`・`docker compose build`**
- 取り込み（`./scripts/ingest`）は**外部 API を呼び、費用が出る**ため、教材では **M3-11** で人が実行します。
- 完成形の `docs/` は**答え合わせ用**。M3-2 では受講生自身が要件・仕様を書き上げます。

詳細は [`docsearch-app/README.md`](./docsearch-app/README.md) を参照してください。

---

## 任意：コードレビュー・デバッグ練習（`todo-app-legacy/`）

[`todo-app-legacy/`](./todo-app-legacy/) は **Ver2 カリキュラムの必修ハンズオンには含まれません。**

| 項目 | 内容 |
| --- | --- |
| **スタック** | Python（`backend/todo_api.py`）＋ React 断片（`frontend/`） |
| **用途** | API と UI の切り分け、コードレビュー、pytest での再現、**意図的なバグ**の修正練習 |
| **進め方** | **各自が任意のタイミング**でディレクトリをコピーし、自分のペースで取り組む |
| **Ver2 本編との関係** | Phase 1 の UI デバッグ演習は [`todo-app/03-broken/`](./todo-app/03-broken/)（Next.js）を使用 |

含まれる不具合の一覧と手順は [`todo-app-legacy/README.md`](./todo-app-legacy/README.md) を参照してください。

---

## 参照資料（`references/`）

Phase 1〜3 のハンズオンで**コピーまたは参照**する、架空クライアントの打ち合わせ記録とテンプレートです。

| ファイル | 使う節（例） |
| --- | --- |
| `20260708_テックバディ_初回打ち合わせ_議事録.md` / `_トランスクリプト.md` | M3-2 ヒアリング |
| `20260715_テックバディ_2回目打ち合わせ_議事録.md` / `_トランスクリプト.md` | M3-2 ヒアリング（2回目） |
| `要件定義書_フォーマット.md` | M3-2 要件定義書 |
| `要件定義書_作成のポイント.md` | 要件定義の書き方 |
| `システム構成図_作成手順.md` | M3-2 システム構成図 |

登場する会社・人物・数値は**すべて架空**です（Constitution 第12条）。

---

## 共通ルール

1. **サンプルを直接編集しない** ── ハンズオンは受講生用ディレクトリで行う。本リポジトリは正本として手を加えずに残す。
2. **`npm install -g` を使わない** ── 依存は各アプリディレクトリの `node_modules/` に閉じる。
3. **解答ファイルに注意** ── `todo-app/03-broken/DEFECTS.md` などは演習前に開かない。
4. **API キー** ── `.env.local` はリポジトリにコミットしない。フロントにキーを直書きしない。
5. **テストが緑＝品質完了ではない** ── 欠陥③（CSS はみ出し）のように、テストで捕まえられない問題がある（Constitution 第13条8）。
6. **パス表記** ── 教材本文の `samples/todo-app/` は本リポジトリの `./todo-app/` を指します。**サンプルへのパス**と**受講生の作業パス**（`~/minutes-app` 等）は別物です。迷ったら節本文の「準備」を正としてください。

---

## ディレクトリ早見表

| パス | Phase | 必修 | 概要 |
| --- | --- | --- | --- |
| [`todo-app/`](./todo-app/) | 1 | ✅ | ToDo（静的・Next.js・欠陥版） |
| [`minutes-app/`](./minutes-app/) | 2 | ✅ | 議事録要約（Docker・1 LLM） |
| [`docsearch-app/`](./docsearch-app/) | 3 | ✅ | 社内文書検索 RAG（完成形見本） |
| [`todo-app-legacy/`](./todo-app-legacy/) | ─ | 任意 | Python＋React、レビュー・デバッグ練習 |
| [`references/`](./references/) | 1〜3 | ✅ | 議事録・要件定義テンプレート |
