// 議員比較インデックス（軽量JSON）をビルド時に生成する。
// /compare で2人の議員を選び、発言数・採決・政治資金・当選回数・役職を並べて比較できるようにする。
// 静的サイトのため、各議員の集計値をビルド時に public/compare-index.json へ出力し、クライアントで読み込む。
//   npm run build:compare （prebuild から自動実行）

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  getFunding,
  getLegislators,
  getLegislatorProfile,
  getSpeechesByLegislator,
  getVotes,
} from "../lib/data";
import { municipalityByGov } from "../lib/municipalities";

interface CmpEntry {
  id: string;
  t: string; // 氏名
  layer: string; // 層（国会/県議会/市町村議会名）
  sub: string; // 選挙区・政党
  party: string;
  sp: number; // 発言数
  vy: number; // 採決 賛成
  vn: number; // 採決 反対
  vo: number; // 採決 その他（欠席等）
  fund: number | null; // 政治資金 収入（最新年・円）
  fundYear: number | null;
  ec: number; // 当選回数（0=未確認）
  pos: string[]; // 主な役職
  q: string; // 検索文字列
}

const norm = (s: string) => s.toLowerCase().normalize("NFKC");

const entries: CmpEntry[] = [];

for (const l of getLegislators()) {
  const layer =
    l.level === "national"
      ? "国会（愛知選出）"
      : l.level === "prefectural"
        ? "愛知県議会"
        : (municipalityByGov(l.govCode)?.council ?? "市町村議会");

  const votes = getVotes(l.id);
  const vy = votes.filter((v) => v.result === "yea").length;
  const vn = votes.filter((v) => v.result === "nay").length;
  const vo = votes.length - vy - vn;

  const funds = getFunding(l.id);
  let fund: number | null = null;
  let fundYear: number | null = null;
  const latest = [...funds].sort((a, b) => b.year - a.year)[0];
  if (latest && latest.totalIncome != null) {
    fund = latest.totalIncome;
    fundYear = latest.year ?? null;
  }

  const profile = getLegislatorProfile(l.id);

  entries.push({
    id: l.id,
    t: l.name,
    layer,
    sub: `${l.district}${l.party ? `・${l.party}` : ""}`,
    party: l.party ?? "",
    sp: getSpeechesByLegislator(l.id).length,
    vy,
    vn,
    vo,
    fund,
    fundYear,
    ec: profile?.electionCount ?? 0,
    pos: profile?.positions ?? [],
    q: norm([l.name, l.kana, l.district, l.party ?? "", layer].join(" ")),
  });
}

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "compare-index.json");
writeFileSync(outPath, JSON.stringify(entries));
console.log(`✓ 比較インデックス生成: ${outPath}（${entries.length} 件）`);
