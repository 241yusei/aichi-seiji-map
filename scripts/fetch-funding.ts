// 政治資金データの整備スクリプト。
// Phase1 方針: 総務省「政治資金収支報告書」を出典に、主要項目（収入・支出の総額）のみを掲載。
// 価値判断はせず、金額と出典リンクのみを示す（FundingPanel）。PDF パースが難しいため手入力許容。
// 個別データ（funding.json）が空でも UI は総務省への出典リンクで成立する。

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "data", "funding.json");
if (!existsSync(OUT)) {
  writeFileSync(OUT, "[]\n", "utf-8");
  console.log("funding.json を作成しました（空）。");
}

console.log("政治資金の Phase1 方針:");
console.log("  - 総務省 政治資金収支報告書を出典に、主要項目（収入・支出の総額）のみを掲載。");
console.log("  - 価値判断はせず、金額と出典リンクのみ。PDF のため手入力を許容。");
console.log("  - funding.json が空でも UI は総務省への出典リンクで成立する。");
