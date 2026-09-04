# ToDo アプリ（教材用題材）

## プロジェクト概要

Phase 1 第2章 1-2-5「エラーの読み方・デバッグ」ハンズオン用のシンプルな ToDo アプリ。
機能は **追加・未完了一覧・完了化** の3つのみ。DB・認証は含まない。

## スタック

- バックエンド：Python（関数ベース、`backend/todo_api.py`）
- フロントエンド：React + TypeScript（`frontend/src/components/TodoList.tsx`）
- テスト：pytest（`backend/tests/`）

## 仕様の正

- `docs/requirements.md` と各関数の docstring を正とする
- 実装と食い違う場合は要件書・docstring 側を正とする

## 禁止事項

- API キーやシークレットをフロントエンドへ直書きしない
- 例外を `try/except: pass` で握りつぶさない
- テストが緑になっただけで品質完了とみなさない（再現手順で確認する）

## レビュー・デバッグ時の観点

- 関数の入口（デフォルト引数の安全性）
- 条件分岐と docstring・仕様の一致
- 失敗時の挙動（無言で成功扱いにしない）
- 状態を持つ箇所（モジュール変数 `todos` の共有）
- React の `key`、空・ローディング・エラーの3状態
