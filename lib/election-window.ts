// 公職選挙法への配慮: 選挙期間中（告示〜投票日）は、投票誘導と取られうる表示を抑制する。
// data/election-windows.json に期間を入れると、ビルド時点が期間内ならバナー等を出す。
// 注: 静的サイトのためビルド時点で判定される（期間に合わせて再ビルドする運用）。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface ElectionWindow {
  name: string; // 例: "第27回参議院議員通常選挙"
  from: string; // 告示日 ISO (YYYY-MM-DD)
  until: string; // 投票日 ISO (YYYY-MM-DD)
}

function load(): ElectionWindow[] {
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

/** 指定日（既定はビルド時点）が選挙期間内なら、その期間を返す。 */
export function getActiveElectionWindow(nowIso?: string): ElectionWindow | null {
  const now = nowIso ?? new Date().toISOString().slice(0, 10);
  return load().find((w) => w.from <= now && now <= w.until) ?? null;
}

/** 選挙期間中か。AI要約・比較UIの抑制判定に使う。 */
export function isElectionPeriod(nowIso?: string): boolean {
  return getActiveElectionWindow(nowIso) !== null;
}
