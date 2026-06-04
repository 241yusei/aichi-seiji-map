// 汎用・市単位ロスタービルダー（Phase3）。
// 使い方: CITY=<slug> npm run fetch:city  （slug は lib/municipalities.ts に登録済みのもの）
// 名簿シード data/seed/legislators.<slug>.seed.json → data/legislators.<slug>.json（level: municipal）。
// 本文はスクレイプせず、名簿＋会議録リンク（linkout）。会議録URLは lib/municipalities.ts。

import { join } from "node:path";
import { buildRoster } from "./_lib/build-roster";
import { municipalityBySlug } from "../lib/municipalities";

const slug = process.env.CITY;
if (!slug) {
  console.error("CITY 環境変数で市スラッグを指定してください（例: CITY=okazaki npm run fetch:city）");
  process.exit(1);
}
const m = municipalityBySlug(slug);
if (!m) {
  console.error(`未登録の市スラッグ: ${slug}。lib/municipalities.ts に追加してください。`);
  process.exit(1);
}

buildRoster({
  seedPath: join(process.cwd(), "data", "seed", `legislators.${slug}.seed.json`),
  outPath: join(process.cwd(), "data", `legislators.${slug}.json`),
  level: "municipal",
  vendor: "linkout",
  idPrefix: slug,
  govCode: m.govCode,
  label: m.council,
});
