---
name: verify-sources
description: 質問セットを回して、根拠が実在するかを確認する
disable-model-invocation: true
argument-hint: [質問の番号（省略で全件）]
---

質問セット（docs/notes/eval-set.md）の $ARGUMENTS 番の質問を実行してください。
番号が指定されていないときは20問すべてを実行してください。

各質問について、次を確認してください。
1. sources[].document が対象文書の一覧に存在するか
2. sources[].excerpt が、その文書の本文に含まれているか
3. 「答えられない質問」（16〜20）で answer が null になっているか

結果を表にしてください。判定は「実在する／実在しない／未確認」の3つだけを使い、
回答の内容が正しいかどうかは判定しないでください。
