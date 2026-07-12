// 会派多数と異なる投票の機械検出（参院記名投票・votes.json）。
//
// 設計（TheyWorkForYou 方式の一部を採用しつつ限界を明示）:
// - 会派の「正式な賛否指示」は非公開のため、同一採決における同会派メンバーの多数を
//   会派の立場の近似として用いる（近似であることは /methodology で開示）。
// - 少数の会派で「多数」を語ると誤解を招くため、その採決に yea/nay を投じた会派メンバーが
//   MIN_FACTION_SIZE 人未満の会派は対象外とする（閾値も開示）。
// - 用語は「会派多数と異なる投票」。造反などの評価語は用いない。
// - 立場スコア（0-100）は本サイトのデータが浅いため採用しない（/methodology 参照）。
//
// すべてビルド時計算・純関数。結果は決定的（同じ入力で同じ出力）。

import type { Legislator, Vote } from "./types";
import { getAllVotes, getLegislators } from "./data";

/** この人数未満の会派は「多数」を算出しない（少数はノイズになるため）。 */
export const MIN_FACTION_SIZE = 3;

export type DecidedResult = "yea" | "nay";

export interface DivergenceRecord {
  legislatorId: string;
  billTitle: string;
  date: string;
  sourceUrl: string;
  result: DecidedResult; // 本人の票
  factionMajority: DecidedResult; // 同会派（同採決）の多数
  faction: string; // 会派名（votes 時点の所属）
  factionSize: number; // その採決で yea/nay を投じた同会派の人数
}

export interface DivergenceResult {
  records: DivergenceRecord[];
  billsAnalyzed: number; // 対象となった記名投票の議案数（ユニーク）
  billsEligible: number; // 3人以上の会派が存在し多数を算出できた議案数
  divergenceCount: number; // 検出された「会派多数と異なる投票」の件数
}

/** 採決の識別キー（同一議案・同一日を1採決とみなす）。 */
export function billKeyOf(v: Pick<Vote, "date" | "billTitle">): string {
  return `${v.date}|${v.billTitle}`;
}

/**
 * 会派多数と異なる投票を検出する。
 * @param votes 全採決（getAllVotes）
 * @param legislators 会派（party）を引くための議員一覧
 */
export function detectDivergences(votes: Vote[], legislators: Legislator[]): DivergenceResult {
  const partyOf = new Map(legislators.map((l) => [l.id, l.party ?? "(無所属)"]));

  const bills = new Map<string, Vote[]>();
  for (const v of votes) {
    const key = billKeyOf(v);
    const arr = bills.get(key) ?? [];
    arr.push(v);
    bills.set(key, arr);
  }

  const records: DivergenceRecord[] = [];
  let billsEligible = 0;

  for (const group of bills.values()) {
    const byFaction = new Map<string, Vote[]>();
    for (const v of group) {
      const fac = partyOf.get(v.legislatorId) ?? "(無所属)";
      const arr = byFaction.get(fac) ?? [];
      arr.push(v);
      byFaction.set(fac, arr);
    }

    let eligibleInBill = false;
    for (const [faction, facVotes] of byFaction) {
      const decided = facVotes.filter(
        (v): v is Vote & { result: DecidedResult } => v.result === "yea" || v.result === "nay",
      );
      if (decided.length < MIN_FACTION_SIZE) continue; // 閾値未満は多数を出さない
      eligibleInBill = true;

      const yea = decided.filter((v) => v.result === "yea").length;
      const nay = decided.length - yea;
      if (yea === nay) continue; // 同数のときは「多数」を定めない

      const majority: DecidedResult = yea > nay ? "yea" : "nay";
      for (const v of decided) {
        if (v.result !== majority) {
          records.push({
            legislatorId: v.legislatorId,
            billTitle: v.billTitle,
            date: v.date,
            sourceUrl: v.sourceUrl,
            result: v.result,
            factionMajority: majority,
            faction,
            factionSize: decided.length,
          });
        }
      }
    }
    if (eligibleInBill) billsEligible++;
  }

  // 出力の決定性：日付降順→議案名→議員IDで安定ソート
  records.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      a.billTitle.localeCompare(b.billTitle) ||
      a.legislatorId.localeCompare(b.legislatorId),
  );

  return {
    records,
    billsAnalyzed: bills.size,
    billsEligible,
    divergenceCount: records.length,
  };
}

// --- ビルド時キャッシュ（多数の議員ページから呼ばれるため一度だけ計算する） ---
let cache: DivergenceResult | null = null;

export function getDivergences(): DivergenceResult {
  if (!cache) cache = detectDivergences(getAllVotes(), getLegislators());
  return cache;
}

/** ある議員の「会派多数と異なる投票」の採決キー集合（採決表のマーク表示に使う）。 */
export function divergentBillKeysFor(legislatorId: string): Set<string> {
  const set = new Set<string>();
  for (const r of getDivergences().records) {
    if (r.legislatorId === legislatorId) set.add(billKeyOf(r));
  }
  return set;
}
