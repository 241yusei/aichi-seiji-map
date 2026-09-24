// 参議院の押しボタン投票・記名投票から、愛知選出の参院議員の賛否を取得して data/votes.json に統合する。
// 方針:
// - 参院の本会議投票結果は議員ごとの賛否が公式に公開されている（起立採決は個人の賛否が非公開のため対象外）。
// - 編集側で案件を選ばない。指定した国会回次の「すべての」投票案件を取り込む（選別そのものが編集判断になるため）。
// - 取得は lib/sources/http.ts（直列・3秒間隔・UA明示・キャッシュ・robots確認）に従う。
// - 各案件の賛否合計が公式の「賛成票・反対票」と一致しない場合は、その案件を取り込まずに警告する（解析誤りの防止）。
// - 既存レコード（衆院の記名投票など）は消さない。同じ議員×同じ出典URLは既存を優先して重複させない。
//
// 実行例: SANGIIN_SESSIONS=221 npm run fetch:votes

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getLegislators } from "../lib/data";
import { getHtml } from "../lib/sources/http";
import { indexUrl, parseIndex, parseResult } from "../lib/sources/sangiin";
import type { Vote } from "../lib/types";

const OUT = join(process.cwd(), "data", "votes.json");
const NAMESPACE = "sangiin";
const SESSIONS = (process.env.SANGIIN_SESSIONS ?? "221")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isInteger(n) && n > 0);

// 参院の愛知選出議員（ロスターの district で判定）。氏名は空白を除いて照合する。
const senators = getLegislators().filter((l) => l.level === "national" && l.district.includes("愛知県選挙区"));
const idByName = new Map(senators.map((l) => [l.name.replace(/[\s　]+/g, ""), l.id]));

if (senators.length === 0) {
  console.error("参院愛知県選挙区の議員がロスターにいません。legislators.aichi.json を確認してください。");
  process.exit(1);
}

const existing = JSON.parse(readFileSync(OUT, "utf-8")) as Vote[];
// 重複判定のキー。参院の投票結果ページは1案件1URLなので「議員×URL」で一意。
// それ以外（衆院の記名投票など）は同じ会議録URLで複数案件を出典にしうるため、案件名と日付も含める。
const key = (v: Pick<Vote, "legislatorId" | "sourceUrl" | "billTitle" | "date">) =>
  v.sourceUrl.includes("sangiin.go.jp/japanese/touhyoulist/")
    ? `${v.legislatorId}|${v.sourceUrl}`
    : `${v.legislatorId}|${v.sourceUrl}|${v.date}|${v.billTitle}`;
const merged = new Map(existing.map((v) => [key(v), v]));
const before = merged.size;
let added = 0;
let skippedMismatch = 0;

for (const session of SESSIONS) {
  const items = parseIndex(await getHtml(indexUrl(session), { namespace: NAMESPACE }), session);
  console.log(`第${session}回国会: 投票案件 ${items.length} 件`);
  for (const item of items) {
    const result = parseResult(await getHtml(item.url, { namespace: NAMESPACE }));
    const yea = result.ballots.filter((b) => b.vote === "yea").length;
    const nay = result.ballots.length - yea;
    if (yea !== result.yea || nay !== result.nay) {
      console.warn(`  ⚠ 合計が公式と不一致のため除外: ${item.date} ${item.billTitle}（解析 ${yea}/${nay}・公式 ${result.yea}/${result.nay}）`);
      skippedMismatch++;
      continue;
    }
    for (const b of result.ballots) {
      const legislatorId = idByName.get(b.name);
      if (!legislatorId) continue;
      const vote: Vote = { legislatorId, billTitle: item.billTitle, date: item.date, result: b.vote, sourceUrl: item.url };
      if (!merged.has(key(vote))) {
        merged.set(key(vote), vote);
        added++;
      }
    }
  }
}

const out = [...merged.values()].sort((a, b) =>
  a.date === b.date ? a.legislatorId.localeCompare(b.legislatorId) : a.date < b.date ? 1 : -1,
);
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`\n既存 ${before} 件 ＋ 追加 ${added} 件 → ${out.length} 件（合計不一致で除外した案件: ${skippedMismatch}）`);
