// /data の正規化JSON を読み込む際・収集スクリプトの出力検証に使う zod スキーマ。
// lib/types.ts のハンド型と内容を一致させること（型の単一の真実は types.ts）。

import { z } from "zod";

/** 一次ソースURLは http(s):// で始まることを必須にする（出典のない断定をしない原則）。 */
const httpUrl = z
  .string()
  .regex(/^https?:\/\//, "一次ソースURLは http(s):// で始まる必要があります");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, "日付は ISO 8601 (YYYY-MM-DD...) 形式である必要があります");

export const levelSchema = z.enum(["national", "prefectural", "municipal"]);

export const vendorSchema = z.enum([
  "kokkai",
  "discussvision",
  "dbsr",
  "corpus",
  "kensakusystem",
  "linkout",
]);

export const legislatorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kana: z.string(),
  level: levelSchema,
  party: z.string().optional(),
  district: z.string().min(1),
  photoUrl: httpUrl.optional(),
  sourceUrl: httpUrl,
  govCode: z.string().optional(),
  vendor: vendorSchema.optional(),
});

export const speechSchema = z.object({
  legislatorId: z.string().min(1),
  date: isoDate,
  body: z.string(),
  text: z.string(),
  sourceUrl: httpUrl,
  aiSummary: z.string().optional(),
  summaryModel: z.string().optional(),
  summaryGeneratedAt: z.string().optional(),
  isExcerpt: z.boolean().optional(),
});

export const speechRecordSchema = speechSchema.extend({
  id: z.string().min(1),
});

export const voteSchema = z.object({
  legislatorId: z.string().min(1),
  billTitle: z.string().min(1),
  date: isoDate,
  result: z.enum(["yea", "nay", "absent", "not_recorded"]),
  sourceUrl: httpUrl,
});

export const fundingSchema = z.object({
  legislatorId: z.string().min(1),
  year: z.number().int(),
  teamName: z.string().optional(),
  totalIncome: z.number().optional(),
  totalExpense: z.number().optional(),
  sourceUrl: httpUrl,
});

export const issueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  relatedSpeechIds: z.array(z.string()),
  keywords: z.array(z.string()).optional(),
});

// 事実カード（矛盾・ギャップ型）。中立担保のため caveat と sources を必須にする。
export const factCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  hook: z.string().min(1),
  cardType: z.enum(["gap", "contradiction", "comparison"]),
  body: z.string().min(1),
  caveat: z.string().min(1), // 誤解回避の注記を必須化（中立を仕組みで担保）
  points: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .optional(),
  sources: z.array(z.object({ label: z.string().min(1), url: httpUrl })).min(1),
  relatedIssueIds: z.array(z.string()).optional(),
  relatedLegislatorIds: z.array(z.string()).optional(),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
});

// 議員の補足プロフィール（当選回数・役職・委員会）。出典必須。
export const legislatorProfileSchema = z.object({
  id: z.string().min(1),
  electionCount: z.number().int().min(0),
  positions: z.array(z.string()),
  committees: z.array(z.string()),
  sourceUrl: httpUrl,
  summary: z.string().optional(),
  homepage: httpUrl.optional(),
  x: httpUrl.optional(),
});

// 首長（知事・市町村長）。一次ソース（公式サイト）必須。
export const executiveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kana: z.string().optional(),
  title: z.string().min(1),
  level: z.enum(["prefectural", "municipal"]),
  govCode: z.string().min(1),
  area: z.string().min(1),
  party: z.string().optional(),
  termStart: isoDate.optional(),
  termEnd: isoDate.optional(),
  termSourceUrl: httpUrl.optional(),
  homepage: httpUrl.optional(),
  sourceUrl: httpUrl,
});

// 争点の「一言でいうと」解説（説明報道カード）。
export const issueExplainerSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1),
  oneLine: z.string().min(1),
  youEffect: z.string().optional(),
  whyImportant: z.string().min(1),
  now: z.string().min(1),
  keyStats: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        sourceUrl: httpUrl,
        note: z.string().optional(),
      }),
    )
    .optional(),
  stances: z.array(z.object({ label: z.string().min(1), text: z.string().min(1) })),
  debate: z
    .object({
      pro: z.string().min(1),
      con: z.string().min(1),
      openQuestion: z.string().min(1),
    })
    .optional(),
  timeline: z
    .array(z.object({ date: z.string().min(1), event: z.string().min(1), sourceUrl: httpUrl.optional() }))
    .optional(),
  sources: z.array(z.object({ label: z.string().min(1), url: httpUrl })).optional(),
});
export const issueExplainersSchema = z.array(issueExplainerSchema);

// 議会の議決（会期×主要議案）。出典必須。
export const councilDecisionSchema = z.object({
  id: z.string().min(1),
  level: z.enum(["prefectural", "municipal"]),
  council: z.string().min(1),
  session: z.string().min(1),
  billNumber: z.string().optional(),
  billTitle: z.string().min(1),
  category: z.string().optional(),
  result: z.string().min(1),
  factions: z
    .array(z.object({ name: z.string().min(1), stance: z.string().min(1) }))
    .optional(),
  note: z.string().optional(),
  sourceUrl: httpUrl,
});
export const councilDecisionsSchema = z.array(councilDecisionSchema);

export const legislatorsSchema = z.array(legislatorSchema);
export const speechRecordsSchema = z.array(speechRecordSchema);
export const votesSchema = z.array(voteSchema);
export const fundingsSchema = z.array(fundingSchema);
export const issuesSchema = z.array(issueSchema);
export const factCardsSchema = z.array(factCardSchema);
export const executivesSchema = z.array(executiveSchema);
export const legislatorProfilesSchema = z.array(legislatorProfileSchema);
