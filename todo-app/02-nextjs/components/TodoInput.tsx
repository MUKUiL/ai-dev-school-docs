"use client";

import { useState } from "react";

type Props = {
  /** 追加できたら true、空文字などで追加しなかったら false を返す */
  onAdd: (text: string) => boolean;
};

export default function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onAdd(text)) {
      setText(""); // 追加できたときだけ入力欄を空にする
    }
  }

  return (
    <form className="input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="やることを入力"
        aria-label="やること"
        autoComplete="off"
      />
      <button type="submit">追加</button>
    </form>
  );
}
