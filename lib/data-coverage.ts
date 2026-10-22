import type { Funding, SpeechCollectionStatus, Vote } from "./types";

/** 空欄・未公表を0や現在日で埋めない。収録した記録の日付だけを集計する。 */
export function recordedRange(records: { date: string }[]): string | null {
  const dates = records.map((r) => r.date).filter(Boolean).sort();
  if (!dates.length) return null;
  return dates[0] === dates.at(-1) ? dates[0] : `${dates[0]}〜${dates.at(-1)}`;
}

export function isSangiinVote(vote: Pick<Vote, "sourceUrl">): boolean {
  try {
    const u = new URL(vote.sourceUrl);
    return u.hostname === "www.sangiin.go.jp" && /^\/japanese\/touhyoulist\//.test(u.pathname);
  } catch { return false; }
}

export function fundingCoverage(funding: Funding[]): string {
  const years = [...new Set(funding.map((f) => f.year))].sort();
  return years.length ? `${years.join("・")}年分・${funding.length}件（収録した団体のみ）` : "本サイトでは未収録";
}

export function collectionLabel(status: SpeechCollectionStatus | null): string {
  if (!status?.lastSuccessfulCheck) return "全対象への照会成功日：未記録";
  return `全対象への照会成功日：${status.lastSuccessfulCheck}（名簿・所属の確認日ではありません）`;
}

export function latestFundingRecords(funding: Funding[]): Funding[] {
  if (!funding.length) return [];
  const year = Math.max(...funding.map((f) => f.year));
  return funding.filter((f) => f.year === year);
}
