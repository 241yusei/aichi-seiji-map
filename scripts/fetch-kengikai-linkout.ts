// 愛知県議会の議員名簿シード → data/legislators.aichi-pref.json（level: prefectural）。
// dbsr は robots が実質 Disallow のためスクレイプせず、名簿＋公式会議録への出典リンク（linkout）。

import { join } from "node:path";
import { buildRoster } from "./_lib/build-roster";

buildRoster({
  seedPath: join(process.cwd(), "data", "seed", "legislators.aichi-pref.seed.json"),
  outPath: join(process.cwd(), "data", "legislators.aichi-pref.json"),
  level: "prefectural",
  vendor: "linkout",
  idPrefix: "pref",
  govCode: "23000", // 愛知県
  label: "愛知県議会",
});
