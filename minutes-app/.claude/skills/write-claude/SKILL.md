---
name: write-claude
description: テンプレートと記述のルールに従って、プロジェクトの CLAUDE.md を新規作成または更新するとき
---

## いつ使うか（トリガー）

- プロジェクトを始めるとき（新規作成）
- ガードレール・ループ設計・仕様が変わったとき（更新）

## 前提

- docs/guardrails.md・docs/loop.md・docs/spec.md があること
- assets/claude-template.md（構成7節）と references/writing-rules.md（記述のルール）を参照できること

## 手順

1. assets/claude-template.md の構成（見出しの順）に従う
2. 各節の中身は docs/guardrails.md・docs/loop.md・docs/spec.md から変換する
3. references/writing-rules.md の記述のルールを守る
4. CLAUDE.md が既にある場合は、構成に無い節を勝手に消さず、変換元との食い違いだけを更新して、変更点を一覧で報告する

## 出力形式

- CLAUDE.md（新規作成 または 更新の差分）
- 更新の場合：変更点の一覧（どの節を、どの変換元に合わせて直したか）

## やらないこと

- 合否の基準を CLAUDE.md に書き写さない（基準は docs/spec.md の1か所）
- 変換元（guardrails.md・loop.md・spec.md）を書き換えない
- 構成7節の見出しを変えない
