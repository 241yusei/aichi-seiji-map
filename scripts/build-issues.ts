// キーワード一致を編集確認用候補として data/raw に出力する。
// 公開 data/issues.json は編集者が原文を確認して管理し、この処理では上書きしない。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { issuesSchema, speechRecordsSchema } from "../lib/zod-schemas";
import { buildIssueCandidates } from "./_lib/issue-candidates";

const DATA = join(process.cwd(), "data");
const seedSchema = z.array(z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  keywords: z.array(z.string().min(1)),
}));
const seed = seedSchema.parse(JSON.parse(readFileSync(join(DATA, "seed", "issues.seed.json"), "utf-8")));
const published = issuesSchema.parse(JSON.parse(readFileSync(join(DATA, "issues.json"), "utf-8")));
const speeches = ["speeches.national.json", "speeches.municipal.json"].flatMap((file) => {
  const path = join(DATA, file);
  if (!existsSync(path)) return [];
  return speechRecordsSchema.parse(JSON.parse(readFileSync(path, "utf-8")));
});
const report = {
  status: "unreviewed",
  notice: "編集確認用の機械抽出候補。一般語の一致を含み、公開の関連発言や件数には反映していません。",
  issues: buildIssueCandidates(seed, published, speeches),
};
const outDir = join(DATA, "raw", "issue-candidates");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "latest.json"), JSON.stringify(report, null, 2) + "\n", "utf-8");
console.log("✓ 未確認候補を data/raw/issue-candidates/latest.json に出力（公開 issues.json は変更なし）");
for (const issue of report.issues) {
  console.log(`   - ${issue.title}: 公開 ${issue.publishedSpeechIds.length} 件・未確認候補 ${issue.unmatchedReviewCount} 件（出力 ${issue.candidates.length} 件）`);
}
