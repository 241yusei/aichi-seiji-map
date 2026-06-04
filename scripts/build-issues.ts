// 争点シード（id・title・description・keywords）から、国会発言をキーワードで横断検索し、
// 各争点に関連発言（relatedSpeechIds）を紐付けて data/issues.json を生成する。
// 県・市は発言本文を持たない（linkout）ため、横串ビューでは会議録検索へのリンクで補う。

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { speechRecordsSchema } from "../lib/zod-schemas";
import type { Issue, SpeechRecord } from "../lib/types";

const DATA = join(process.cwd(), "data");
const PER_ISSUE = 15;

interface IssueSeed {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

const seed = JSON.parse(
  readFileSync(join(DATA, "seed", "issues.seed.json"), "utf-8"),
) as IssueSeed[];

function loadSpeeches(): SpeechRecord[] {
  return ["speeches.national.json", "speeches.municipal.json"].flatMap((f) => {
    const p = join(DATA, f);
    if (!existsSync(p)) return [];
    const raw = readFileSync(p, "utf-8").trim();
    if (!raw) return [];
    return speechRecordsSchema.parse(JSON.parse(raw)) as SpeechRecord[];
  });
}

const speeches = loadSpeeches();

const issues: Issue[] = seed.map((s) => {
  const matched = speeches
    .filter((sp) => s.keywords.some((k) => sp.text.includes(k) || sp.body.includes(k)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, PER_ISSUE);
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    relatedSpeechIds: matched.map((m) => m.id),
  };
});

writeFileSync(join(DATA, "issues.json"), JSON.stringify(issues, null, 2) + "\n", "utf-8");
console.log("✓ 争点を生成しました:");
for (const i of issues) console.log(`   - ${i.title}: 関連発言 ${i.relatedSpeechIds.length} 件`);
