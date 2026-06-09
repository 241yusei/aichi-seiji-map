// /data 配下の正規化JSON を検証する。ビルド前ゲート（npm run validate）。
// - 各ファイルが zod スキーマに適合するか
// - 相互参照の整合（発言・採決・資金の legislatorId が実在するか／争点の relatedSpeechIds が実在するか）
// 失敗時は非ゼロ終了する。

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  councilDecisionsSchema,
  executivesSchema,
  factCardsSchema,
  fundingsSchema,
  issueExplainersSchema,
  issuesSchema,
  legislatorProfilesSchema,
  legislatorsSchema,
  speechRecordsSchema,
  votesSchema,
} from "../lib/zod-schemas";
import type {
  CouncilDecision,
  Executive,
  FactCard,
  Funding,
  Issue,
  IssueExplainer,
  Legislator,
  LegislatorProfile,
  SpeechRecord,
  Vote,
} from "../lib/types";
import { MUNICIPALITIES } from "../lib/municipalities";

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

const legislatorFiles = [
  "legislators.aichi.json",
  "legislators.aichi-pref.json",
  ...MUNICIPALITIES.map((m) => `legislators.${m.slug}.json`),
];
const legislators = legislatorFiles.flatMap((f) => load<Legislator>(f, legislatorsSchema));
const speeches = [
  ...load<SpeechRecord>("speeches.national.json", speechRecordsSchema),
  ...load<SpeechRecord>("speeches.municipal.json", speechRecordsSchema),
];
const votes = load<Vote>("votes.json", votesSchema);
const funding = load<Funding>("funding.json", fundingsSchema);
const issues = load<Issue>("issues.json", issuesSchema);
const factCards = load<FactCard>("fact-cards.json", factCardsSchema);
const executives = load<Executive>("executives.json", executivesSchema);
const profiles = load<LegislatorProfile>("profiles.national.json", legislatorProfilesSchema);
const issueExplainers = load<IssueExplainer>("issue-explainers.json", issueExplainersSchema);
const councilDecisions = load<CouncilDecision>("council-decisions.json", councilDecisionsSchema);

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

// 事実カードの相互参照・ID重複を検査
const issueIds = new Set(issues.map((i) => i.id));
const seenFact = new Set<string>();
for (const fc of factCards) {
  if (seenFact.has(fc.id)) fail(`事実カードID重複: ${fc.id}`);
  seenFact.add(fc.id);
  for (const iid of fc.relatedIssueIds ?? []) {
    if (!issueIds.has(iid)) fail(`事実カード ${fc.id} の参照争点が不明: ${iid}`);
  }
  for (const lid of fc.relatedLegislatorIds ?? []) {
    if (!legislatorIds.has(lid)) fail(`事実カード ${fc.id} の参照議員が不明: ${lid}`);
  }
}

// 首長の相互参照（govCode は県=23000 か登録済み市町村）・ID重複を検査
const validGov = new Set<string>(["23000", ...MUNICIPALITIES.map((m) => m.govCode)]);
const seenExec = new Set<string>();
for (const e of executives) {
  if (seenExec.has(e.id)) fail(`首長ID重複: ${e.id}`);
  seenExec.add(e.id);
  if (!validGov.has(e.govCode)) fail(`首長 ${e.id} の govCode が不明: ${e.govCode}`);
}

// 争点解説の参照整合（id が争点に存在するか）・ID重複
const issueIdSet = new Set(issues.map((i) => i.id));
const seenExp = new Set<string>();
for (const e of issueExplainers) {
  if (seenExp.has(e.id)) fail(`争点解説ID重複: ${e.id}`);
  seenExp.add(e.id);
  if (!issueIdSet.has(e.id)) fail(`争点解説の参照先争点が不明: ${e.id}`);
}

// 議員プロフィールの参照整合・ID重複
const seenProf = new Set<string>();
for (const p of profiles) {
  if (seenProf.has(p.id)) fail(`プロフィールID重複: ${p.id}`);
  seenProf.add(p.id);
  if (!legislatorIds.has(p.id)) fail(`プロフィールの参照先議員が不明: ${p.id}`);
}

console.log("");
if (errorCount > 0) {
  console.error(`検証失敗: ${errorCount} 件のエラー`);
  process.exit(1);
}
console.log(
  `検証成功: 議員 ${legislators.length} / 発言 ${speeches.length} / 採決 ${votes.length} / 資金 ${funding.length} / 争点 ${issues.length} / 事実カード ${factCards.length} / 首長 ${executives.length} / プロフィール ${profiles.length} / 議決 ${councilDecisions.length}`,
);
