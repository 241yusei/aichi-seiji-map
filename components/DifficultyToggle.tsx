"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

// やさしい⇄くわしい トグル（解説層のみ。生データには使わない）。
// 既定は「やさしい」。選択は localStorage に保持。両版はサーバーで描画済みを受け取る。
export function DifficultyToggle({ easy, detail }: { easy: ReactNode; detail: ReactNode }) {
  const [level, setLevel] = useState<"easy" | "detail">("easy");

  useEffect(() => {
    const s = localStorage.getItem("learn-level");
    // localStorage からの初期同期（ハイドレーション後に一度だけ）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (s === "easy" || s === "detail") setLevel(s);
  }, []);

  function set(l: "easy" | "detail") {
    setLevel(l);
    try {
      localStorage.setItem("learn-level", l);
    } catch {
      // localStorage不可でも表示は継続
    }
  }

  return (
    <div>
      <div className="mb-5 inline-flex border border-ink text-sm" role="group" aria-label="難易度">
        <button
          type="button"
          onClick={() => set("easy")}
          aria-pressed={level === "easy"}
          className={`px-4 py-1.5 transition-colors ${
            level === "easy" ? "bg-ink text-paper" : "hover:bg-subtle"
          }`}
        >
          やさしい
        </button>
        <button
          type="button"
          onClick={() => set("detail")}
          aria-pressed={level === "detail"}
          className={`border-l border-ink px-4 py-1.5 transition-colors ${
            level === "detail" ? "bg-ink text-paper" : "hover:bg-subtle"
          }`}
        >
          くわしい
        </button>
      </div>
      <div>{level === "easy" ? easy : detail}</div>
    </div>
  );
}
