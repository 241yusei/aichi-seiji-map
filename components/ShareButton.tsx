"use client";

import { useState } from "react";

// 事実カード等の共有ボタン（X / LINE / URLコピー）。OGP画像は各ページが持つ。
// 現在ページのURLを共有する（クライアントで window.location を読む）。
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function openX() {
    const u = url();
    const text = `${title}｜政治のトリセツ あいち・なごや`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(u)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openLine() {
    const u = url();
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(u)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // クリップボード不可環境は無視
    }
  }

  const btn = "border border-ink px-3 py-1.5 text-xs font-bold transition-colors hover:bg-subtle";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1 text-faint">共有</span>
      <button type="button" onClick={openX} className={btn} aria-label="Xで共有">
        X（旧Twitter）
      </button>
      <button type="button" onClick={openLine} className={btn} aria-label="LINEで共有">
        LINE
      </button>
      <button type="button" onClick={copy} className={btn} aria-label="URLをコピー">
        {copied ? "コピーしました" : "URLをコピー"}
      </button>
    </div>
  );
}
