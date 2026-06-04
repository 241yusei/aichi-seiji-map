// Phase2: 豊田市議会の議員名簿シード → data/legislators.toyota.json（level: municipal, govCode: 23211）。
// 会議録は kensakusystem.jp（神戸総合速記）。本文はスクレイプせず、名簿＋会議録検索リンク（linkout）。
// 市単位アダプタの追加例：Phase3 で他市を増やす際もこの形を踏襲する。

import { join } from "node:path";
import { buildRoster } from "./_lib/build-roster";

buildRoster({
  seedPath: join(process.cwd(), "data", "seed", "legislators.toyota.seed.json"),
  outPath: join(process.cwd(), "data", "legislators.toyota.json"),
  level: "municipal",
  vendor: "linkout",
  idPrefix: "toyota",
  govCode: "23211", // 豊田市
  label: "豊田市議会",
});
