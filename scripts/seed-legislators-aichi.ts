// 愛知選出 国会議員ロスターの seed を検証し、id を付与して
// data/legislators.aichi.json を生成する。
// seed は人手キュレーション（氏名・かな・院・選挙区・会派・公式URL）。出典URL必須。

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { Legislator } from "../lib/types";

const seedSchema = z.array(
  z.object({
    name: z.string().min(1),
    kana: z.string(),
    house: z.enum(["衆議院", "参議院"]),
    district: z.string().min(1),
    party: z.string().optional(),
    sourceUrl: z.string().regex(/^https?:\/\//, "公式プロフィール等の一次ソースURLが必要です"),
  }),
);

const SEED = join(process.cwd(), "data", "seed", "legislators.aichi.seed.json");
const OUT = join(process.cwd(), "data", "legislators.aichi.json");

/** 氏名から安定した id を生成する（順序に依存しない）。 */
function idFor(name: string): string {
  return "nat-" + createHash("sha1").update(name).digest("hex").slice(0, 8);
}

const seed = seedSchema.parse(JSON.parse(readFileSync(SEED, "utf-8")));

const legislators: Legislator[] = seed.map((s) => ({
  id: idFor(s.name),
  name: s.name,
  kana: s.kana,
  level: "national",
  party: s.party,
  district: s.district,
  sourceUrl: s.sourceUrl,
  vendor: "kokkai",
}));

// id 重複の検出（同姓同名など）
const ids = new Set<string>();
let dup = 0;
for (const l of legislators) {
  if (ids.has(l.id)) {
    console.error(`  ✗ id 重複: ${l.id}（${l.name}）`);
    dup++;
  }
  ids.add(l.id);
}
if (dup > 0) {
  console.error(`id が重複しています。氏名に院・選挙区を加味した id 生成に切り替えてください。`);
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify(legislators, null, 2) + "\n", "utf-8");

const byHouse = legislators.reduce<Record<string, number>>((acc, l) => {
  const h = l.district.includes("比例") ? "比例東海" : l.district.includes("選挙区") ? "参院" : "衆院";
  acc[h] = (acc[h] ?? 0) + 1;
  return acc;
}, {});
console.log(`✓ ${legislators.length} 件を ${OUT} に書き出しました`);
console.log(`  内訳: ${JSON.stringify(byHouse)}`);
