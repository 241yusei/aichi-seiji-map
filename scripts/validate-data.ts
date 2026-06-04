// /data 配下の正規化JSON を検証する。ビルド前ゲート（npm run validate）。
// - 各ファイルが zod スキーマに適合するか
// - 相互参照の整合（発言・採決・資金の legislatorId が実在するか／争点の relatedSpeechIds が実在するか）
// 失敗時は非ゼロ終了する。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  fundingsSchema,
  issuesSchema,
  legislatorsSchema,
  speechRecordsSchema,
  votesSchema,
} from "../lib/zod-schemas";
import type { Funding, Issue, Legislator, SpeechRecord, Vote } from "../lib/types";

const DATA_DIR = join(process.cwd(), "data");
let errorCount = 0;

function fail(message: string): void {
  console.error(`  ✗ ${message}`);
  errorCount++;
}

function load<T>(file: string, schema: { parse: (d: unknown) => unknown }): T[] {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) {
    console.log(`  - ${file}: 未作成（スキップ）`);
    return [];
  }
  const raw = readFileSync(path, "utf-8").trim();
  if (!raw) {
    console.log(`  - ${file}: 空`);
    return [];
  }
  try {
    const data = schema.parse(JSON.parse(raw)) as T[];
    console.log(`  ✓ ${file}: ${data.length} 件`);
    return data;
  } catch (e) {
    fail(`${file}: スキーマ検証エラー: ${(e as Error).message}`);
    return [];
  }
}

console.log("データ検証を開始します…\n");

const legislators = [
  ...load<Legislator>("legislators.aichi.json", legislatorsSchema),
  ...load<Legislator>("legislators.aichi-pref.json", legislatorsSchema),
  ...load<Legislator>("legislators.nagoya.json", legislatorsSchema),
];
const speeches = [
  ...load<SpeechRecord>("speeches.national.json", speechRecordsSchema),
  ...load<SpeechRecord>("speeches.municipal.json", speechRecordsSchema),
];
const votes = load<Vote>("votes.json", votesSchema);
const funding = load<Funding>("funding.json", fundingsSchema);
const issues = load<Issue>("issues.json", issuesSchema);

console.log("\n相互参照を検査します…");

const legislatorIds = new Set(legislators.map((l) => l.id));
const speechIds = new Set(speeches.map((s) => s.id));

// 議員IDの重複検出
const seen = new Set<string>();
for (const l of legislators) {
  if (seen.has(l.id)) fail(`議員ID重複: ${l.id}`);
  seen.add(l.id);
}
// 発言IDの重複検出
const seenSpeech = new Set<string>();
for (const s of speeches) {
  if (seenSpeech.has(s.id)) fail(`発言ID重複: ${s.id}`);
  seenSpeech.add(s.id);
}

for (const s of speeches) {
  if (!legislatorIds.has(s.legislatorId)) fail(`発言の参照先議員が不明: ${s.id} → ${s.legislatorId}`);
}
for (const v of votes) {
  if (!legislatorIds.has(v.legislatorId)) fail(`採決の参照先議員が不明: ${v.legislatorId}`);
}
for (const f of funding) {
  if (!legislatorIds.has(f.legislatorId)) fail(`政治資金の参照先議員が不明: ${f.legislatorId}`);
}
for (const issue of issues) {
  for (const sid of issue.relatedSpeechIds) {
    if (!speechIds.has(sid)) fail(`争点 ${issue.id} の参照発言が不明: ${sid}`);
  }
}

console.log("");
if (errorCount > 0) {
  console.error(`検証失敗: ${errorCount} 件のエラー`);
  process.exit(1);
}
console.log(
  `検証成功: 議員 ${legislators.length} / 発言 ${speeches.length} / 採決 ${votes.length} / 資金 ${funding.length} / 争点 ${issues.length}`,
);
