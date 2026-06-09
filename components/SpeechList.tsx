"use client";

import { useState } from "react";
import type { SpeechRecord } from "@/lib/types";
import { SpeechCard } from "./SpeechCard";

// 議員の発言一覧。初期は新しい順5件＋「さらに表示」で段階開示（長文ページのスキャン性確保）。
const INITIAL = 5;

export function SpeechList({ speeches }: { speeches: SpeechRecord[] }) {
  const [shown, setShown] = useState(INITIAL);
  const visible = speeches.slice(0, shown);
  const rest = speeches.length - shown;

  return (
    <div>
      <div className="space-y-3">
        {visible.map((s) => (
          <SpeechCard key={s.id} speech={s} />
        ))}
      </div>
      {rest > 0 && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 10)}
          className="tap mt-4 w-full rounded-[10px] border border-ink py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
        >
          さらに表示（残り{rest}件）
        </button>
      )}
    </div>
  );
}
