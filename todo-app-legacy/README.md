# todo-app-legacy（任意：コードレビュー・デバッグ練習）

**Ver2 カリキュラムの必修ハンズオンには含まれません。** Python と React の最小構成で、API とフロントの切り分け・コードレビュー・デバッグを**各自が任意のタイミング**で練習するためのコードベースです。

- 作成日：2026-08-09 ／ **最終確認日：2026-09-04**
- 一覧・共通ルール：[`../README.md`](../README.md)
- Phase 1 の必修演習：[`../todo-app/`](../todo-app/)（Next.js 版・欠陥仕込み `03-broken/`）

> [`CLAUDE.md`](./CLAUDE.md) は Ver1 系（`1-2-5`）の名残です。Ver2 本編の UI デバッグ演習は `todo-app/03-broken/` を使います。

---

## ディレクトリ

```
todo-app-legacy/
├── README.md
├── CLAUDE.md
├── docs/
│   └── requirements.md       ← 仕様の正
├── backend/
│   ├── todo_api.py           ← Python 関数（意図的なバグあり）
│   └── tests/
│       └── test_todo_api.py  ← プレースホルダ（受講生がテストを書く）
└── frontend/
    └── src/components/
        └── TodoList.tsx      ← React コンポーネント断片（意図的なバグあり）
```

フロントは**単体のコンポーネントファイル**です。ビルド設定や HTTP サーバーは含みません。バックエンドも **FastAPI 等のサーバーはなく**、関数を直接 import して検証します。

---

## 使い方

1. このディレクトリを作業用に**コピー**する
2. [`docs/requirements.md`](./docs/requirements.md) と各関数の docstring を**仕様の正**として、`backend/todo_api.py` と `frontend/src/components/TodoList.tsx` をレビューする
3. `backend/tests/test_todo_api.py` にテストを追加し、pytest で検証する

---

## 動かし方

### バックエンド（Python）

```bash
cd backend
python3 -m pytest tests/     # テストを書いたあと
python3 -c "from todo_api import add_todo, list_active; add_todo('test'); print(list_active([]))"
```

**Python 3.10 以上**と **pytest** が必要です（`pip install pytest`）。

### フロントエンド（React）

`TodoList.tsx` はコードレビュー・修正の題材です。単体でブラウザ表示する仕組みは同梱していません。必要なら、自分の React プロジェクトに取り込むか、Storybook 等で表示してください。

---

## 含まれる不具合（教材用・意図的）

| 対象 | 内容 | 再現のヒント |
| --- | --- | --- |
| `add_todo` | ミュータブルなデフォルト引数 `tags=[]` | 同じ `tags` リストが共有される |
| `list_active` | フィルタ条件が逆（完了済みを返す） | docstring と実装を突合 |
| `complete_todo` | 該当 ID なしのとき無言（失敗が伝わらない） | 存在しない ID で呼ぶ |
| `TodoList` | `map` に `key` がない／3状態未実装 | React DevTools・コンソール警告 |

詳細な要件は [`docs/requirements.md`](./docs/requirements.md) を参照してください。
