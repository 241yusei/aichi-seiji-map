// 国会会議録API から、愛知選出 国会議員の発言を取得して
// data/speeches.national.json に書き出す。
// 直列・数秒間隔・キャッシュは http.ts が担保（レート制御を厳守）。
//
// 前提: 先に `npm run seed:legislators` で legislators.aichi.json を作っておく。

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLegislators } from "../lib/data";
import { fetchKokkaiSpeeches } from "../lib/sources/kokkai";
import type { DateRange, SpeechRecord } from "../lib/types";

const FROM = process.env.KOKKAI_FROM ?? "2024-01-01";
const UNTIL = process.env.KOKKAI_UNTIL ?? new Date().toISOString().slice(0, 10);
const KEEP = Number(process.env.KOKKAI_KEEP ?? "20");
const PAGES = Number(process.env.KOKKAI_PAGES ?? "2"); // 1ページ=最大100件。会期を遡るほど増やす。

const range: DateRange = { from: FROM, until: UNTIL };
const nationals = getLegislators().filter((l) => l.level === "national");

if (nationals.length === 0) {
  console.error("国会議員ロスターが空です。先に `npm run seed:legislators` を実行してください。");
  process.exit(1);
}

console.log(`国会発言を取得します（期間 ${FROM} 〜 ${UNTIL}、対象 ${nationals.length} 名）\n`);

const all: SpeechRecord[] = [];
const flagged: string[] = [];

for (const l of nationals) {
  process.stdout.write(`  ${l.name}（${l.district}） … `);
  try {
    const speeches = await fetchKokkaiSpeeches(l, range, { keep: KEEP, maxPages: PAGES });
    all.push(...speeches);
    console.log(`${speeches.length} 件`);
    if (speeches.length < 3) flagged.push(`${l.name}（${l.district}）: ${speeches.length} 件`);
  } catch (e) {
    console.log(`失敗: ${(e as Error).message}`);
    flagged.push(`${l.name}（${l.district}）: 取得失敗`);
  }
}

const OUT = join(process.cwd(), "data", "speeches.national.json");
writeFileSync(OUT, JSON.stringify(all, null, 2) + "\n", "utf-8");

console.log(`\n合計 ${all.length} 件を ${OUT} に書き出しました`);
if (flagged.length > 0) {
  console.log(`\n⚠ 発言3件未満（ロスターの氏名・表記揺れを要確認）:`);
  for (const f of flagged) console.log(`   - ${f}`);
}
