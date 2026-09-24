// 公職選挙法への配慮: 選挙期間中（告示〜投票日）であることを明示するための期間データの読み込み。
// data/election-windows.json に期間を登録しておくと、閲覧時にブラウザが日本時間の日付で判定して
// 注意書きを出す（components/ElectionPeriodBanner.tsx）。静的サイトでも再ビルドに依存しない。
// 判定ロジック本体は lib/election-window-core.ts（fs を使わないのでブラウザでも動く）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { findActiveWindows, todayJst, type ElectionWindow } from "./election-window-core";

export type { ElectionWindow } from "./election-window-core";

/** 登録済みの選挙期間をすべて返す（ビルド時に読み、ページへ埋め込む）。 */
export function getElectionWindows(): ElectionWindow[] {
  const p = join(process.cwd(), "data", "election-windows.json");
  if (!existsSync(p)) return [];
  const raw = readFileSync(p, "utf-8").trim();
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ElectionWindow[];
  } catch {
    return [];
  }
}

/** 指定日（既定はビルド時点のJST）に期間中の選挙。 */
export function getActiveElectionWindows(nowIso?: string): ElectionWindow[] {
  return findActiveWindows(getElectionWindows(), nowIso ?? todayJst());
}
