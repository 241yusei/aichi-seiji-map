"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { findActiveWindows, todayJst, type ElectionWindow } from "@/lib/election-window-core";

// 選挙期間中（告示日〜投票日）に常時表示する注意書き（公職選挙法への配慮）。
// 静的サイトはビルドした日の状態で固まるため、閲覧時にブラウザで日本時間の日付を見て判定し直す。
// initial はビルド時点の判定結果（JS が動かない環境でも、ビルド日が期間内なら表示される）。
const noopSubscribe = () => () => {};

export function ElectionPeriodBanner({
  windows,
  initial,
}: {
  windows: ElectionWindow[];
  initial: ElectionWindow[];
}) {
  // サーバー（ビルド時）は null を返し initial を使う。ブラウザでは閲覧時の日本時間の日付で判定し直す。
  const today = useSyncExternalStore(noopSubscribe, todayJst, () => null);
  const active = today ? findActiveWindows(windows, today) : initial;

  if (active.length === 0) return null;
  const names = active.map((w) => w.name).join("・");

  return (
    <div className="bg-accent text-on-accent" role="note" aria-label="選挙期間中のお知らせ">
      <div className="mx-auto max-w-6xl px-5 py-2 text-xs leading-relaxed">
        <span className="mr-2 font-bold">選挙期間中</span>
        現在は<span className="font-bold">{names}</span>の選挙期間（告示日〜投票日）です。
        本サイトは特定の候補者・政党への投票を呼びかけません。掲載している発言・記録は、出典付きの事実です。
        <Link href="/vote-guide/" className="ml-2 font-bold underline underline-offset-2">
          投票ガイド →
        </Link>
      </div>
    </div>
  );
}
