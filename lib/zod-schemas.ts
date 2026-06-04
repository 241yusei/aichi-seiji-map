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
  totalIncome: z.number().optional(),
  totalExpense: z.number().optional(),
  sourceUrl: httpUrl,
});

export const issueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  relatedSpeechIds: z.array(z.string()),
});

export const legislatorsSchema = z.array(legislatorSchema);
export const speechRecordsSchema = z.array(speechRecordSchema);
export const votesSchema = z.array(voteSchema);
export const fundingsSchema = z.array(fundingSchema);
export const issuesSchema = z.array(issueSchema);
