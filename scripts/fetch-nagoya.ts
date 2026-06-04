// 名古屋市会の議員名簿シード → data/legislators.nagoya.json（level: municipal）。
// v1 は名簿＋会議録への出典リンク（linkout）。発言全文の外部公開は市へ要許諾のため本文は持たない。
// 将来 discussvision アダプタで「抜粋＋AI要約」を追加可能。

import { join } from "node:path";
import { buildRoster } from "./_lib/build-roster";

buildRoster({
  seedPath: join(process.cwd(), "data", "seed", "legislators.nagoya.seed.json"),
  outPath: join(process.cwd(), "data", "legislators.nagoya.json"),
  level: "municipal",
  vendor: "linkout",
  idPrefix: "city",
  govCode: "23100", // 名古屋市
  label: "名古屋市会",
});
