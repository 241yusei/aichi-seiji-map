"use client";

import { useEffect, useState } from "react";

// まなぶの読了進捗（localStorage 集計・ログイン不要）。
export function LearnProgress({ slugs }: { slugs: string[] }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    let c = 0;
    for (const s of slugs) {
      try {
        if (localStorage.getItem(`read:${s}`) === "1") c++;
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDone(c);
  }, [slugs]);

  const total = slugs.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between text-sm">
        <span className="eyebrow text-faint">読んだ章</span>
        <span className="tnum font-bold">
          {done} / {total}
        </span>
      </div>
      <div className="mt-2 h-2 w-full bg-subtle" aria-hidden>
        <div className="h-2 bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
