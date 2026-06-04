// AI要約バッチ。data/speeches.*.json の各発言を中立・多視点で要約し、
// data/summaries/<speechId>.json にキャッシュする（既にあればスキップ＝再生成回避）。
//
// 要件: .env に ANTHROPIC_API_KEY。既定モデルは claude-haiku-4-5。
// 中立・非投票誘導・原文優先の方針は ~/.claude/aichi_seiji/compliance.md に準拠。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { speechRecordsSchema } from "../lib/zod-schemas";
import type { SpeechRecord } from "../lib/types";

const MODEL = process.env.SUMMARY_MODEL ?? "claude-haiku-4-5";
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY が未設定です。.env を設定してから再実行してください。");
  process.exit(1);
}

const client = new Anthropic({ apiKey });
const DATA_DIR = join(process.cwd(), "data");
const SUM_DIR = join(DATA_DIR, "summaries");
mkdirSync(SUM_DIR, { recursive: true });

const SPEECH_FILES = ["speeches.national.json", "speeches.municipal.json"];

const SYSTEM = `あなたは中立的な政治情報サイトの編集者です。国会・地方議会の発言を、政治に詳しくない有権者向けに要約します。
厳守事項:
- 政党・議員・政策への評価や論評をしない。賛否や投票を誘導しない。
- 「誰が・何について・どのような立場や主張を述べたか」を事実として中立にまとめる。
- 発言に書かれていない情報・背景・数値を補わない（推測しない）。
- 専門用語はやさしく言い換える。120〜160字、2〜3文。要約本文のみを出力する。`;

function loadSpeeches(): SpeechRecord[] {
  const out: SpeechRecord[] = [];
  for (const f of SPEECH_FILES) {
    const path = join(DATA_DIR, f);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf-8").trim();
    if (!raw) continue;
    out.push(...(speechRecordsSchema.parse(JSON.parse(raw)) as SpeechRecord[]));
  }
  return out;
}

async function summarizeOne(s: SpeechRecord): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.2,
    // 静的なシステムプロンプトはキャッシュしてコストを抑える。
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `次の発言を方針に沿って中立に要約してください。\n\n【会議】${s.body}\n【日付】${s.date}\n【発言】\n${s.text}`,
      },
    ],
  });
  const block = res.content.find((c) => c.type === "text");
  return block && block.type === "text" ? block.text.trim() : "";
}

const speeches = loadSpeeches();
if (speeches.length === 0) {
  console.log("要約対象の発言がありません。先に収集スクリプトを実行してください。");
  process.exit(0);
}

console.log(`要約対象 ${speeches.length} 件（モデル: ${MODEL}）\n`);

let made = 0;
let skipped = 0;
let failed = 0;

for (const s of speeches) {
  const out = join(SUM_DIR, `${s.id}.json`);
  if (existsSync(out)) {
    skipped++;
    continue;
  }
  try {
    const aiSummary = await summarizeOne(s);
    if (!aiSummary) throw new Error("空の要約");
    writeFileSync(
      out,
      JSON.stringify(
        { id: s.id, aiSummary, summaryModel: MODEL, summaryGeneratedAt: new Date().toISOString() },
        null,
        2,
      ) + "\n",
      "utf-8",
    );
    made++;
    if (made % 10 === 0) console.log(`  … ${made} 件生成`);
  } catch (e) {
    failed++;
    console.error(`  ✗ ${s.id}: ${(e as Error).message}`);
  }
}

console.log(`\n完了: 生成 ${made} / キャッシュ流用 ${skipped} / 失敗 ${failed}`);
