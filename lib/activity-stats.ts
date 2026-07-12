// 発言の統計（議員詳細ページ・国会議員のみ）。
// すべてビルド時に speeches.national.json を再集計する純関数（クライアント計算なし）。
// 数値は「本サイト収録分の事実」であり、活動量の多寡や優劣を評価するものではない。
// 集計方法と収録範囲の限界は /methodology で全面開示する。

import type { SpeechRecord } from "./types";

export interface YearCount {
  year: string; // "2026"
  count: number;
}

export interface CommitteeCount {
  committee: string; // 会議名（「第N号」を除いた委員会・会議単位）
  count: number;
}

export interface SpeechStats {
  total: number;
  byYear: YearCount[]; // 年の昇順
  byCommittee: CommitteeCount[]; // 件数の降順（上位のみ）
  otherCommitteeCount: number; // 上位に入らなかった会議の合計件数
  committeeTotal: number; // 会議の種類数（上位＋その他）
}

/** 会議名から末尾の「第N号」を除き、委員会・会議単位のラベルにする。 */
export function committeeOf(body: string): string {
  return body.replace(/\s*第\S+号\s*$/, "").trim();
}

/** 議員1人分の発言レコードから統計を作る。topCommittees は内訳の表示上限。 */
export function speechStatsFor(speeches: SpeechRecord[], topCommittees = 6): SpeechStats {
  const yearMap = new Map<string, number>();
  const comMap = new Map<string, number>();
  for (const s of speeches) {
    const year = s.date.slice(0, 4);
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
    const com = committeeOf(s.body);
    comMap.set(com, (comMap.get(com) ?? 0) + 1);
  }

  const byYear = [...yearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  const allCommittees = [...comMap.entries()]
    .map(([committee, count]) => ({ committee, count }))
    // 件数の降順・同数は会議名で安定ソート（決定的な出力にする）
    .sort((a, b) => b.count - a.count || a.committee.localeCompare(b.committee));

  const byCommittee = allCommittees.slice(0, topCommittees);
  const otherCommitteeCount = allCommittees
    .slice(topCommittees)
    .reduce((sum, c) => sum + c.count, 0);

  return {
    total: speeches.length,
    byYear,
    byCommittee,
    otherCommitteeCount,
    committeeTotal: allCommittees.length,
  };
}

/** 本サイト収録の国会発言全体の期間（最古〜最新）。収録範囲の注記に使う。 */
export interface CoverageRange {
  fromYear: string;
  fromMonth: string; // 先頭ゼロなし
  toYear: string;
  toMonth: string;
}

export function coverageRange(allSpeeches: SpeechRecord[]): CoverageRange | null {
  if (allSpeeches.length === 0) return null;
  let min = allSpeeches[0].date;
  let max = allSpeeches[0].date;
  for (const s of allSpeeches) {
    if (s.date < min) min = s.date;
    if (s.date > max) max = s.date;
  }
  return {
    fromYear: min.slice(0, 4),
    fromMonth: String(Number(min.slice(5, 7))),
    toYear: max.slice(0, 4),
    toMonth: String(Number(max.slice(5, 7))),
  };
}
