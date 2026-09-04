# 議事録要約アプリ（Ver2 Phase 2 の教材サンプル）

Ver2 の Phase 2「LLM 機能（Lv1：API 連携）を持つアプリを作る」で使う一式。
**受講生が作るものの完成形**であり、教材本文から参照します。

- 作成日：2026-08-08 ／ **最終確認日：2026-09-04**
- 対応する節：`2-2-4`（仕様）・`2-4-11`（キーの隔離）・`2-4-12`（実装）・`2-4-13`（異常系とログ）
- 受講生の作業場所：`~/minutes-app`。**このサンプルを直接編集しないでください。**
- 一覧・共通ルール：[`../README.md`](../README.md)

> 教材本文では `samples/minutes-app/` と書いています。このリポジトリでは `./minutes-app/` が同じ位置づけです。

---

## 実行は Docker の中で行います

**ホストのグローバル環境には何も入れません。**入口はラッパー `./scripts/*` です。

```bash
docker compose build   # 初回のみ（依存の取得を含む）
./scripts/verify       # 型チェック＋テスト（中身は docker compose run --rm app npm run verify）
./scripts/dev          # 開発サーバー起動 → http://localhost:3000
```

- **実行環境は Docker**：Node.js・依存・判定器はコンテナ内だけ。ホストに Node.js は不要
- **入口はラッパー**：検証は `./scripts/verify`、起動は `./scripts/dev`、依存の再取得は `./scripts/install`（人の承認後）
- **Claude Code はホスト**：エージェントはホスト CLI で起動し、npm 系コマンドはラッパー経由で叩く（コンテナに Claude Code は入れない）

> `node_modules` は名前付きボリュームに入ります。**ホスト側には作られません。**

> 💡 **Dev Container（任意）**：Cursor / VS Code で「Reopen in Container」を選ぶと、[.devcontainer/devcontainer.json](./.devcontainer/devcontainer.json) が同じ `compose.yaml` を使ってコンテナを開きます。中のターミナル＝コンテナ内 CLI です。**Claude Code 自体はホストで起動してください。**

> **CI について**：[`.github/workflows/ci.yml`](./.github/workflows/ci.yml) は GitHub Actions 上で `npm run verify` を実行します（ホストの Node.js を使う）。**受講生のローカル開発は `./scripts/*` ラッパー経由（Docker 内）が主経路**です。

### 検証の状況（2026-09-04 時点）

| 項目 | 状態 |
| --- | --- |
| 型チェック・テスト49件 | **ホスト上で確認済み**（一時的に Node.js を入れて実行後、グローバル環境からは削除） |
| Docker コンテナ内での実行 | **未確認**（2026-08-09 時点で Docker Desktop のプロキシ設定によりイメージ取得不可。設定ファイル一式は用意済み） |
| 実 API を呼んだときの応答 | **未確認**（テストはモック完結） |

プロキシ設定が解決したら、冒頭の `./scripts/verify` でコンテナ内の動作を確認してください。

---

## ディレクトリ構成

リポジトリ直下の主要なパスです。`node_modules/`・`.next/`・`.env.local` は `.gitignore` 対象のため含めていません。

```
minutes-app/
├── CLAUDE.md                 ← エージェント向けガードレール
├── PLANS.md                  ← 実装計画（T1〜T10）
├── README.md
├── .claude/
│   ├── settings.json         ← パーミッション（deny / ask / allow）
│   └── skills/               ← 自作 Skill（2-3-7・2-3-9。テンプレートは assets/・参照資料は references/ に同梱）
│       ├── loop-design/                    ← ループ設計（docs/loop.md）を起こす（assets: 3枠テンプレート）
│       ├── write-spec/                     ← 仕様書（docs/spec.md）を起こす（assets: 5項目ひな形）
│       ├── write-plans/                    ← PLANS.md を起こす（/write-plans。assets: 6項目テンプレート）
│       ├── write-claude/                   ← CLAUDE.md の新規作成・更新（assets: 構成7節／references: 記述のルール）
│       ├── tests-from-viewpoints/SKILL.md  ← 観点表からテストを起こす
│       └── review-fixed-viewpoints/SKILL.md ← 固定観点のコードレビュー
├── .devcontainer/
│   └── devcontainer.json     ← Dev Container（compose.yaml を参照。Claude Code は入れない）
├── .github/
│   └── workflows/ci.yml      ← CI（verify・秘密情報検知・テスト件数の下限）
├── .env.example              ← 環境変数テンプレート（ANTHROPIC_API_KEY）
├── .gitignore
├── .dockerignore
├── Dockerfile
├── compose.yaml              ← Docker 実行（env_file: .env.local）
├── scripts/
│   ├── verify                ← 判定器の入口（コンテナ内で npm run verify）
│   ├── dev                   ← 開発サーバーの入口（docker compose up）
│   └── install               ← 依存の再取得（人の承認後）
├── package.json              ← verify スクリプト
├── tsconfig.json
├── vitest.config.mts
├── app/
│   ├── api/summarize/route.ts ← POST /api/summarize（サーバー側の入口）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── SummarizeForm.tsx     ← 要約フォーム（キー・SDK なし）
├── docs/
│   ├── requirements.md       ← 要件定義書
│   ├── spec.md               ← 仕様書（F-1〜F-5）
│   ├── guardrails.md         ← ガードレール設計図（CLAUDE.md への変換元）
│   ├── loop.md               ← ループ設計（判定器・人が見る場所・打ち切り条件）
│   ├── notes/
│   │   └── input-limit.md    ← 8,000 文字上限の根拠
│   └── procedure/
│       ├── README.md         ← 実装手順書（逐次型）
│       └── implementation.md ← 一気通貫の実装ガイド
├── lib/
│   ├── types.ts              ← 出力型・FailureKind（7分類）
│   ├── validate.ts           ← 入力検証（送る前に止める）
│   ├── prompt.ts             ← プロンプト＝仕様書
│   ├── parse.ts              ← 構造化出力の形式検証
│   ├── retry.ts              ← リトライの切り分けと打ち切り
│   ├── summarize.ts          ← 上記を束ねる（MessagesClient）
│   └── logger.ts             ← 構造化ログ
└── tests/
    ├── validate.test.ts
    ├── parse.test.ts
    ├── retry.test.ts
    ├── summarize.test.ts
    ├── logger.test.ts
    └── route.test.ts
```

---

## このディレクトリ内のファイル一覧

| パス | 中身 | 使う節 |
| --- | --- | --- |
| `docs/requirements.md` | 要件定義書（何を・なぜ作るか） | `2-2-4` |
| `docs/spec.md` | 仕様書（受け入れ基準 F-1〜F-5）。**合否の判断基準だけ**を置く | `2-2-4` |
| `docs/notes/input-limit.md` | 上限の根拠。本文から逃した補足資料 | `2-2-5` |
| `docs/procedure/README.md` | **実装手順書（逐次型）。**このアプリを Claude Code への指示だけで1セッションで作るための手順と指示プロンプト集 | `2-4-12` |
| `docs/procedure/implementation.md` | **一気通貫の実装ガイド。**1回の指示で完成まで走らせるためのリポジトリ設計（CLAUDE.md・settings.json・PLANS.md・判定器） | `2-3-7`・`2-5-15` |
| `app/api/summarize/route.ts` | **サーバー側。**ここだけが API キーに触る | `2-4-11` |
| `components/SummarizeForm.tsx` | ブラウザ側。**キーも SDK も登場しない** | `2-4-11` |
| `lib/validate.ts` | 送る前に止める（空・上限超過） | `2-2-4`・`2-4-13` |
| `lib/prompt.ts` | プロンプト＝仕様書。役割・出力形式・制約 | `2-4-12` |
| `lib/parse.ts` | 構造化出力の取り出しと**形式の検証** | `2-4-12` |
| `lib/retry.ts` | リトライしてよい失敗の切り分けと打ち切り | `2-4-13` |
| `lib/logger.ts` | 構造化ログ。**本文もキーも出さない** | `2-4-13` |
| `lib/summarize.ts` | 上記をつなぐ。失敗を分類して返す | `2-4-12`・`2-4-13` |
| [docs/guardrails.md](./docs/guardrails.md) | ガードレールの設計図（禁止・確認・停止条件）。`CLAUDE.md` への変換元 | `2-1-1` |
| [docs/loop.md](./docs/loop.md) | ループ設計（判定器 `./scripts/verify`・人が見る場所・打ち切り条件） | `2-1-2` |
| [CLAUDE.md](./CLAUDE.md) | コーディングエージェント向けガードレール（毎セッション自動読み込み） | `2-5-15` |
| [PLANS.md](./PLANS.md) | 実装計画（タスク T1〜T10・完了条件・リスク） | `2-3-7` |
| [.claude/settings.json](./.claude/settings.json) | パーミッション（`.env` の deny など） | `2-5-15` |
| [.claude/skills/loop-design/SKILL.md](./.claude/skills/loop-design/SKILL.md) | ループ設計（`docs/loop.md`）を3枠テンプレートで起こす Skill | `2-3-9` |
| [.claude/skills/write-spec/SKILL.md](./.claude/skills/write-spec/SKILL.md) | 要件定義書から仕様書（`docs/spec.md`）をひな形どおりに起こす Skill（**数値は決めない**） | `2-3-9` |
| [.claude/skills/write-plans/SKILL.md](./.claude/skills/write-plans/SKILL.md) | 仕様書から `PLANS.md` を起こす Skill（`/write-plans`。**決定は人に残す**） | `2-3-7` |
| [.claude/skills/write-claude/SKILL.md](./.claude/skills/write-claude/SKILL.md) | テンプレートと記述のルールに従って `CLAUDE.md` を新規作成・更新する Skill | `2-3-9` |
| [.claude/skills/tests-from-viewpoints/SKILL.md](./.claude/skills/tests-from-viewpoints/SKILL.md) | 観点表（正常系・異常系・境界値）からテストを起こす Skill。**書けなかった観点も必ず出す** | `2-3-9` |
| [.claude/skills/review-fixed-viewpoints/SKILL.md](./.claude/skills/review-fixed-viewpoints/SKILL.md) | 固定した観点でコードレビューする Skill。差分レビュー（`2-5-15` 3-4）で使う | `2-3-9`・`2-5-15` |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | CI。ローカルと同じ判定器（`npm run verify`）＋秘密情報の検知＋**テスト件数の下限チェック** | `1-1-5`・`2-5-15` |
| [.env.example](./.env.example) | 環境変数のテンプレート（`ANTHROPIC_API_KEY`・値は書かない） | `2-4-11` |

---

## エージェントコーディングを始めるときの整理

**実装セッションを始める前に、次の内容で手順と前提を確認してください。**このリポジトリは完成形サンプルです。受講生がゼロから作る場合は、要件・仕様を先に確定してから、進め方に応じてエージェント向けの設定を揃えます。

### 全体像 ── 逐次型と一気通貫型

エージェントに実装させる方法は **2通り** あります。どちらも同じ完成形を目指しますが、**人がセッション中に口頭でやっていたことを、どこまでファイルに移すか**が違います。

| | 逐次型 | 一気通貫型 |
| --- | --- | --- |
| **手順書** | [docs/procedure/README.md](./docs/procedure/README.md) | [docs/procedure/implementation.md](./docs/procedure/implementation.md) |
| **向いている場面** | **初めて作る・型を学ぶ** | 型が手に馴染んだあと・2回目以降 |
| **指示の回数** | 部品ごと（ステップ0〜10） | **1回**（起動プロンプト＋PLANS.md） |
| **順番・基準・ルールの置き場所** | 毎ステップのプロンプト | **リポジトリ内のファイル**（CLAUDE.md・PLANS.md 等） |
| **進んでよいかの判定** | 人が毎ステップ確認 | **PLANS.md の完了条件**＋`./scripts/verify` |
| **人の仕事** | 各ステップの指示と確認 | **事前のファイル整備**と、**事後の検収** |

**初回は逐次型を推奨します。**一気通貫は、逐次で1周して部品の境界が頭に入ってからのほうが、止まったときに切り分けられます（[implementation.md §10](./docs/procedure/implementation.md)）。

### 始める前の前提（3点セット）

Phase 2 では、駆動開発の **3点セット** がそろってから実装に入ります（Constitution 第5条）。

| # | そろえるもの | このリポジトリでの置き場所 | 無いまま始めると |
| --- | --- | --- | --- |
| 1 | **ガードレール**（外枠） | 逐次：ステップ0のプロンプト／一気通貫：[CLAUDE.md](./CLAUDE.md)・[.claude/settings.json](./.claude/settings.json) | キー漏洩・テスト改変・範囲外の変更 |
| 2 | **仕様**（判断基準） | [docs/spec.md](./docs/spec.md)（F-1〜F-5） | 合否が決まらず、エージェントの質問が止まらない |
| 3 | **検証ループ**（収束） | `./scripts/verify`（コンテナ内で型チェック＋テスト49件） | 赤のまま積み上がる |

設計図として [docs/guardrails.md](./docs/guardrails.md)（ガードレール定義）と [docs/loop.md](./docs/loop.md)（ループ設計）があり、一気通貫ではこれらを [CLAUDE.md](./CLAUDE.md) と [settings.json](./.claude/settings.json) に変換して使います（`2-1-1`・`2-1-2` → `2-5-15`）。

> ⚠️ **仕様が無いまま「議事録要約アプリを作って」と指示しないでください。**
> 動くものは出てきますが、**合否の基準がファイルに無い**ため、セッションが止まるか、都度口頭で答えることになります（`2-3-6`）。

### 2つの進め方（詳細）

| | [逐次型](./docs/procedure/README.md) | [一気通貫型](./docs/procedure/implementation.md) |
| --- | --- | --- |
| **エージェント設定** | ステップ0のガードレールを**毎回プロンプトで渡す** | [CLAUDE.md](./CLAUDE.md)・[PLANS.md](./PLANS.md)・[settings.json](./.claude/settings.json) を**先に置く** |
| **各ステップの終わり** | `./scripts/verify` | 同上（タスクごとに緑に戻してから次へ） |
| **起動の合図** | 「ステップ1から始めて」等、部品ごと | 「PLANS.md に従って T1 から」（§下記） |
| **詳細** | [docs/procedure/README.md](./docs/procedure/README.md) | [docs/procedure/implementation.md](./docs/procedure/implementation.md) |

### 実装開始前チェックリスト

実装（または再実装）に入る直前に、次を確認します。

| 順 | 確認すること | 確認方法 |
| --- | --- | --- |
| 1 | 受け入れ基準が確定している | [docs/spec.md](./docs/spec.md) の F-1〜F-5 を読める |
| 2 | ガードレールが用意されている | 逐次：手順書ステップ0／一気通貫：[CLAUDE.md](./CLAUDE.md)・[.claude/settings.json](./.claude/settings.json) |
| 3 | 実行計画がある（一気通貫の場合） | [PLANS.md](./PLANS.md) のタスク・完了条件・リスクがある |
| 4 | 判定器が動く | `./scripts/verify` が緑（**API キー不要**） |
| 5 | テストが外部 API を呼ばない | テストはモック（`MessagesClient`）で完結している |

**API キー（`ANTHROPIC_API_KEY`）は実装ループには不要です。**キーが要るのは、人が行う**手動確認（`./scripts/dev`）・デプロイ**だけです（[docs/procedure/implementation.md §8](./docs/procedure/implementation.md)）。

### 一気通貫で始めるとき（起動プロンプト）

[PLANS.md](./PLANS.md) とガードレールがそろっていれば、セッションの最初の指示は次の1回で足ります。

```
PLANS.md に従って、T1 から T10 まで順番に実装を進めてください。

- 各タスクの完了条件を満たし、./scripts/verify を緑にしてから
  次のタスクへ進むこと。
- タスクが終わるたびに PLANS.md のチェックボックスを更新し、
  1タスク1コミットでコミットすること。
- CLAUDE.md の停止条件に当たったら、そこで止めて状況を報告すること。
- すべて終わったら、T10 の突き合わせ表と、未達・保留があれば
  その一覧を報告してください。
```

自分のアプリで使うときは、[PLANS.md](./PLANS.md) のチェックをすべて外した状態から始めます。

### 人がやること・エージェントに任せないこと

| 場面 | 誰がやるか | 理由 |
| --- | --- | --- |
| `.env.local` の作成（`ANTHROPIC_API_KEY`） | **人** | `settings.json` が `.env` の読み取りを deny。指示するとキーが会話ログに残る |
| `./scripts/install` 等の依存追加 | **人が承認** | `ask` に登録されている |
| 仕様に無い判断への回答 | **人**（spec.md に追記してから再開） | 決定を会話ログだけに残さない（`2-3-6`） |
| 実装・テスト・verify のループ | **エージェント** | 判定器はキー無し・0円で回る |
| 終了報告後の検収 | **人** | verify の緑と「完成しました」は合否の判定ではない（Constitution 第13条8・第14条1） |

環境変数の設定手順は [docs/procedure/implementation.md §8](./docs/procedure/implementation.md) を参照してください。

---

## 検証の範囲

**この節の教材は「出力の正しさ」を評価しません**（Constitution 第13条1）。
評価するのは**ハンドリングの有無**です。テストもその方針で書いてあります。

| | 内容 |
| --- | --- |
| **検証できた** | 型チェック（`tsc --noEmit`）・**本番ビルド**・**テスト49件**（API はモック）・パースの振る舞い・リトライの打ち切り・ログに本文とキーが出ないこと |
| **検証していない** | **実 API を呼んだときの応答**・実際のトークン数と費用・実際の所要時間・**Docker コンテナ内での実行** |

**テストの内訳（49件）**

| ファイル | 件数 | 何を確かめているか |
| --- | --- | --- |
| `tests/validate.test.ts` | 7 | 空・空白のみ・上限超過を**送る前に**止める |
| `tests/parse.test.ts` | 12 | フェンス・前後の説明文・崩れた JSON・0件の扱い |
| `tests/retry.test.ts` | 8 | リトライしてよい失敗の切り分けと、打ち切り |
| `tests/summarize.test.ts` | 10 | 5種の異常系。**いずれも例外を投げない** |
| `tests/logger.test.ts` | 5 | **ログに本文もキーも出ない** |
| `tests/route.test.ts` | 7 | 空入力で**API を呼ばない**・内部の詳細を返さない |

> ⚠️ **実 API での動作は未検証です。**
> 教材に載せているトークン数と費用は**見積もり**であり、実測ではありません。
> 単価は変わるため、金額は[公式の料金ページ](https://claude.com/pricing)（参照日：2026-09-04）で確認してください。

### 検証済みの環境

| 項目 | バージョン |
| --- | --- |
| Node.js（コンテナ内） | 22（`node:22-bookworm-slim`） |
| Next.js | 16.3.0 |
| `@anthropic-ai/sdk` | 0.116.0 |
| Vitest | 4.1.10 |
| モデル | `claude-haiku-4-5-20251001` |

---

## 設計で意識したこと

| 判断 | 理由 |
| --- | --- |
| API 呼び出しを Route Handler に置いた | フロントに置くとキーが配られる（`1-1-2`「配られたものは読める」） |
| 出力を JSON で受け取る | アクション項目を**一覧として扱う**ため。プログラムから扱える形が要る |
| **0件を正常として扱う** | アクションの無い会議は現実にある。「必ず3件以上」は達成不能な基準（`2-2-4`） |
| リトライを最大2回（呼び出し3回）に | 収束しないなら打ち切る（`2-1-2`）。回数の上限は**費用の上限**でもある |
| 入力起因の失敗はリトライしない | 何度やっても同じ。リトライは費用を捨てるだけ |
| ログに文字数だけ残す | 議事録には個人情報が含まれる。**本文は残さない** |
