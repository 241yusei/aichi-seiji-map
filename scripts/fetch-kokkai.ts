// 国会会議録API から、愛知選出 国会議員の発言を取得して
// data/speeches.national.json に書き出す。
// 直列・数秒間隔・キャッシュは http.ts が担保（レート制御を厳守）。
//
// 前提: 先に `npm run seed:legislators` で legislators.aichi.json を作っておく。

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLegislators } from "../lib/data";
import { fetchKokkaiSpeeches } from "../lib/sources/kokkai";
import { speechCollectionStatusSchema } from "../lib/zod-schemas";
import type { DateRange, SpeechRecord, SpeechCollectionStatus } from "../lib/types";

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
const failedIds: string[] = [];

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
    failedIds.push(l.id);
  }
}

const OUT = join(process.cwd(), "data", "speeches.national.json");

// 既存データとマージする（上書きしない）。
// 取得は「期間 × 議員ごと上限」で切るため、単純上書きだと範囲外・上限超過の
// 収録済み発言が消える。発言IDは会議録APIで一意なので、IDで統合して取りこぼしを防ぐ。
const merged = new Map<string, SpeechRecord>();
if (existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf-8")) as SpeechRecord[];
    for (const s of prev) merged.set(s.id, s);
  } catch {
    throw new Error("既存発言を読み込めないため書き込みを中止しました。既存データを修復してください。");
  }
}
const beforeCount = merged.size;
for (const s of all) merged.set(s.id, s); // 同一IDは最新取得で更新
const out = [...merged.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf-8");

console.log(
  `\n今回取得 ${all.length} 件 ／ 既存 ${beforeCount} 件 → 統合後 ${out.length} 件を ${OUT} に書き出しました`,
);
if (flagged.length > 0) {
  console.log(`\n⚠ 発言3件未満（ロスターの氏名・表記揺れを要確認）:`);
  for (const f of flagged) console.log(`   - ${f}`);
}

// 追加0件・一部失敗も記録し、照会成功日を名簿の基準日に転用しない。
const statusPath = join(process.cwd(), "data", "speech-collection-status.json");
const previous: SpeechCollectionStatus | null = existsSync(statusPath)
  ? speechCollectionStatusSchema.parse(JSON.parse(readFileSync(statusPath, "utf-8"))) : null;
const checkedAt = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
const status: SpeechCollectionStatus = {
  sourceUrl: "https://kokkai.ndl.go.jp/api.html",
  lastSuccessfulCheck: failedIds.length === 0 ? checkedAt : previous?.lastSuccessfulCheck ?? null,
  from: FROM, until: UNTIL, targetCount: nationals.length,
  succeededCount: nationals.length - failedIds.length, failedIds,
};
writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n", "utf-8");
if (failedIds.length) {
  console.error(`照会に失敗した議員が${failedIds.length}人います。全件成功日を進めず、確認を必要とする終了状態にします。`);
  process.exitCode = 1;
}
