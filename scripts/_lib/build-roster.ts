// 県・市の議員名簿シード（人手キュレーション/公式名簿由来）を読み、
// id を付与して legislators JSON を生成する共通処理。
// 発言本文は持たない（linkout）。各議員に公式の sourceUrl 必須。

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";
import type { Legislator, Level, Vendor } from "../../lib/types";

const rosterSchema = z.array(
  z.object({
    name: z.string().min(1),
    kana: z.string(),
    party: z.string().optional(),
    district: z.string().min(1),
    sourceUrl: z.string().regex(/^https?:\/\//, "公式の一次ソースURLが必要です"),
  }),
);

export function buildRoster(opts: {
  seedPath: string;
  outPath: string;
  level: Level;
  vendor: Vendor;
  idPrefix: string;
  govCode?: string;
  label: string;
}): void {
  const seed = rosterSchema.parse(JSON.parse(readFileSync(opts.seedPath, "utf-8")));

  const legislators: Legislator[] = seed.map((s) => ({
    // 同姓を選挙区で区別するため name+district をハッシュ
    id: `${opts.idPrefix}-${createHash("sha1").update(s.name + s.district).digest("hex").slice(0, 8)}`,
    name: s.name,
    kana: s.kana,
    level: opts.level,
    party: s.party,
    district: s.district,
    sourceUrl: s.sourceUrl,
    govCode: opts.govCode,
    vendor: opts.vendor,
  }));

  const ids = new Set<string>();
  let dup = 0;
  for (const l of legislators) {
    if (ids.has(l.id)) {
      console.error(`  ✗ id 重複: ${l.id}（${l.name} / ${l.district}）`);
      dup++;
    }
    ids.add(l.id);
  }
  if (dup > 0) {
    console.error("id が重複しています。シードの氏名・選挙区を確認してください。");
    process.exit(1);
  }

  writeFileSync(opts.outPath, JSON.stringify(legislators, null, 2) + "\n", "utf-8");
  console.log(`✓ ${opts.label}: ${legislators.length} 件 → ${opts.outPath}`);
}
