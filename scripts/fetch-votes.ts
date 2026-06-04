// 採決データの整備スクリプト。
// Phase1 方針: 記名投票（参院の押しボタン式）の個人賛否のみが公開され、起立採決は非公開。
// UI では「個人の賛否は非公開」を明示し、公式の投票結果へ出典リンクで案内する（VoteTable）。
// 個別の賛否データ（votes.json）は、参院 記名投票の確実な取得が整い次第、追記する。
// 捏造はしない（出典のない断定をしない原則）。

import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "data", "votes.json");
if (!existsSync(OUT)) {
  writeFileSync(OUT, "[]\n", "utf-8");
  console.log("votes.json を作成しました（空）。");
}

console.log("採決の Phase1 方針:");
console.log("  - 記名投票でない採決は『個人の賛否は非公開』として UI で明示（VoteTable）。");
console.log("  - 参院 本会議投票結果 / 衆院 議案の議決結果へ出典リンクで案内。");
console.log("  - 確実に取得できた記名投票（yea/nay/absent）のみ votes.json に追記する。");
console.log("  ※ 参院記名投票の自動取得は今後の整備項目（現状 votes.json は空でも UI は成立）。");
