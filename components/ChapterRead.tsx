"use client";

import { useEffect, useState } from "react";

// 章の「読んだ」チェック（localStorage・ログイン不要）。理解の“進んでいる感”を支える。
export function ChapterRead({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(`read:${slug}`) === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRead(v);
  }, [slug]);

  function toggle() {
    const n = !read;
    setRead(n);
    try {
      if (n) localStorage.setItem(`read:${slug}`, "1");
      else localStorage.removeItem(`read:${slug}`);
    } catch {
      // 保存不可でも表示は継続
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={read}
      className={`border px-4 py-2 text-sm font-bold transition-colors ${
        read ? "border-yea bg-yea/10 text-yea" : "border-ink hover:bg-subtle"
      }`}
    >
      {read ? "✓ 読んだ" : "読んだらチェック"}
    </button>
  );
}
