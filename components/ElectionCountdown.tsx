"use client";

import { useSyncExternalStore } from "react";
import { daysBetween, todayJst, upcomingWindows, type ElectionWindow } from "@/lib/election-window-core";
import { formatDate } from "@/lib/format";

// 投票日が決まった（data/election-windows.json に登録した）選挙の、投票日までの残り日数。
// 日数は閲覧時の日本時間で計算する（静的サイトでも古くならない）。ビルド時は日付だけを表示。
// 事実（日付と日数）だけを示し、投票先には一切ふれない。
const noopSubscribe = () => () => {};

export function ElectionCountdown({ windows, buildDate }: { windows: ElectionWindow[]; buildDate: string }) {
  const today = useSyncExternalStore(noopSubscribe, todayJst, () => null);
  const list = upcomingWindows(windows, today ?? buildDate);
  if (list.length === 0) return null;

  return (
    <section aria-labelledby="countdown-heading" className="rounded-2xl bg-subtle p-5">
      <h2 id="countdown-heading" className="text-sm font-medium tracking-wider text-accent">
        投票日が決まっている選挙
      </h2>
      <ul className="mt-3 space-y-3">
        {list.map((w) => {
          const days = today ? daysBetween(today, w.until) : null;
          const inPeriod = today ? w.from <= today : false;
          return (
            <li key={`${w.name}-${w.until}`} className="rounded-xl bg-surface p-4">
              <p className="font-medium text-ink">{w.name}</p>
              <p className="mt-1 text-sm text-muted">
                告示 {formatDate(w.from)}・投票日 <strong className="text-ink">{formatDate(w.until)}</strong>
                {days !== null && (
                  <span className="ml-2 inline-block rounded-full bg-accent-weak px-2.5 py-0.5 text-xs font-medium text-accent-deep">
                    {days === 0 ? "きょうが投票日" : `投票日まで あと${days}日`}
                    {inPeriod && days > 0 ? "（選挙期間中）" : ""}
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        その選挙の区域（市町村・県）に住んでいる有権者が投票できます。期日前投票・投票所は、各選挙管理委員会の案内をご確認ください。
      </p>
    </section>
  );
}
