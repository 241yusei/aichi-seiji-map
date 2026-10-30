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

export const verificationRecordSchema = z.object({
  checkedAt: z.iso.date(),
  status: z.enum(["verified", "not_listed", "unconfirmed"]),
  sourceUrls: z.array(z.url().refine((url) => /^https?:\/\//.test(url), "http(s)の出典が必要です")).min(1),
  sourceAsOf: z.iso.date().optional(),
  note: z.string().min(1).optional(),
}).strict().superRefine((record, ctx) => {
  if (record.sourceAsOf && record.sourceAsOf > record.checkedAt) {
    ctx.addIssue({ code: "custom", message: "資料の基準日が照合日より後です" });
  }
  if (record.status !== "verified" && !record.note) {
    ctx.addIssue({ code: "custom", message: "掲載なし・未確認の理由を記録してください" });
  }
  if (new Set(record.sourceUrls).size !== record.sourceUrls.length) {
    ctx.addIssue({ code: "custom", message: "確認根拠URLが重複しています" });
  }
  if (record.status === "verified" && record.sourceUrls.some((url) => {
    try { return /(^|\.)wikipedia\.org$/.test(new URL(url).hostname); } catch { return false; }
  })) {
    ctx.addIssue({ code: "custom", message: "公式照合の根拠には一次資料を使用してください" });
  }
});

export const rosterVerificationSchema = z.object({
  membership: verificationRecordSchema,
  affiliation: verificationRecordSchema,
  faction: verificationRecordSchema.optional(),
}).strict();

export const profileVerificationSchema = z.object({
  positions: verificationRecordSchema,
  committees: verificationRecordSchema,
}).strict();

export const legislatorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kana: z.string(),
  level: levelSchema,
  party: z.string().optional(),
  faction: z.string().min(1).optional(),
  verification: rosterVerificationSchema.optional(),
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
  factionAtVote: z.string().min(1).optional(),
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
  checkedAt: z.iso.date().optional(),
  asOf: isoDate.optional(),
  historical: z.boolean().optional(),
});

// 議員の補足プロフィール（当選回数・役職・委員会）。出典必須。
export const legislatorProfileSchema = z.object({
  id: z.string().min(1),
  electionCount: z.number().int().min(0).optional(),
  verification: profileVerificationSchema.optional(),
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
  nowAsOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
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

// 財政（自治体単位・一般会計当初予算）。金額は千円。出典必須。
const financeItemSchema = z.object({
  label: z.string().min(1),
  amount: z.number().int(),
  sharePct: z.number().optional(),
});

const financeYearSchema = z.object({
  fiscalYear: z.number().int(),
  era: z.string().min(1),
  total: z.number().int(),
  revenues: z.array(financeItemSchema).min(1),
  expenditures: z.array(financeItemSchema).min(1),
  taxes: z.array(financeItemSchema).optional(),
  notes: z.array(z.string()).optional(),
  sources: z.array(z.object({ label: z.string().min(1), url: httpUrl })).min(1),
});

export const governmentFinanceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  level: z.enum(["prefectural", "municipal"]),
  govCode: z.string().min(1),
  years: z.array(financeYearSchema).min(1),
  keyFacts: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        note: z.string().optional(),
        sourceUrl: httpUrl,
      }),
    )
    .optional(),
  relatedDecisionIds: z.array(z.string()).optional(),
  relatedFactCardIds: z.array(z.string()).optional(),
});
export const governmentFinancesSchema = z.array(governmentFinanceSchema);

export const legislatorsSchema = z.array(legislatorSchema);
export const speechRecordsSchema = z.array(speechRecordSchema);
export const votesSchema = z.array(voteSchema);
export const fundingsSchema = z.array(fundingSchema);
export const issuesSchema = z.array(issueSchema);
export const factCardsSchema = z.array(factCardSchema);
export const executivesSchema = z.array(executiveSchema);
export const legislatorProfilesSchema = z.array(legislatorProfileSchema);

// ============================================================
// 歴史の縦軸（Issue #59） — data/history.json のスキーマ
// lib/types.ts の HistoryData と一致させること。全項目に一次ソースURLを持たせる。
// ============================================================

// イベント日付は YYYY / YYYY-MM / YYYY-MM-DD のいずれかを許容する（年しか特定できない事象がある）。
const flexDate = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "日付は YYYY / YYYY-MM / YYYY-MM-DD 形式である必要があります");

export const historyTenureSchema = z.object({
  name: z.string().min(1),
  kana: z.string().min(1),
  startYear: z.number().int(),
  endYear: z.number().int().nullable(),
  terms: z.number().int().min(1),
  tenureLabel: z.string().min(1),
  note: z.string().optional(),
  sourceUrl: httpUrl,
});

export const turnoutPointSchema = z.object({
  date: isoDate,
  year: z.number().int(),
  turnout: z.number(),
  note: z.string().optional(),
});

export const turnoutSeriesSchema = z.object({
  scope: z.string().min(1),
  sourceUrl: httpUrl,
  sourceLabel: z.string().min(1),
  points: z.array(turnoutPointSchema).min(1),
});

export const historyEventSchema = z.object({
  date: flexDate,
  year: z.number().int(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  sourceUrl: httpUrl,
  sourceLabel: z.string().min(1),
});

export const historySchema = z.object({
  governors: z.array(historyTenureSchema).min(1),
  mayors: z.array(historyTenureSchema).min(1),
  governorTurnout: turnoutSeriesSchema,
  mayorTurnout: turnoutSeriesSchema,
  events: z.array(historyEventSchema),
});

// 立候補者（告示後・選挙管理委員会の発表のみ）。出典URLと読みがなは必須。
export const candidateSchema = z.object({
  electionId: z.string().min(1),
  name: z.string().min(1),
  kana: z.string().min(1),
  age: z.number().int().min(18).max(120).optional(),
  party: z.string().min(1),
  status: z.enum(["現職", "新人", "元職"]).optional(),
  occupation: z.string().optional(),
  filedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceUrl: httpUrl,
});
export const candidatesSchema = z.array(candidateSchema);

export const speechCollectionStatusSchema = z.object({
  sourceUrl: httpUrl,
  lastSuccessfulCheck: z.iso.date().nullable(),
  from: z.iso.date(),
  until: z.iso.date(),
  targetCount: z.number().int().positive(),
  succeededCount: z.number().int().nonnegative(),
  failedIds: z.array(z.string().min(1)),
}).refine((s) => s.from <= s.until, "照会期間の順序が不正です")
  .refine((s) => s.succeededCount + s.failedIds.length === s.targetCount, "照会成否の件数が一致しません")
;

const sourcedStatementSchema = z.object({ text: z.string().min(1), sourceIds: z.array(z.string().min(1)) });
export const livingTopicSchema = z.object({
  issueId: z.enum(["kosodate", "transit", "bousai"]),
  title: z.string().min(1), summary: z.string().min(1), caseTitle: z.string().min(1),
  confirmedAt: z.iso.date(),
  status: sourcedStatementSchema.extend({ sourceIds: z.array(z.string().min(1)).min(1) }),
  decisions: z.array(sourcedStatementSchema).min(1),
  affected: z.array(sourcedStatementSchema).min(1),
  responsibilities: z.array(sourcedStatementSchema.extend({ level: levelSchema, label: z.string().min(1) })).min(1),
  costs: z.array(sourcedStatementSchema).min(1), unknowns: z.array(sourcedStatementSchema).min(1),
  nextChecks: z.array(sourcedStatementSchema).min(1),
  sources: z.array(z.object({ id: z.string().min(1), label: z.string().min(1), url: httpUrl, publishedAt: z.iso.date().optional() })).min(1),
}).superRefine((topic, ctx) => {
  const ids = new Set(topic.sources.map((s) => s.id));
  if (ids.size !== topic.sources.length) ctx.addIssue({ code: "custom", message: "出典IDが重複しています" });
  for (const item of [topic.status, ...topic.decisions, ...topic.affected, ...topic.responsibilities, ...topic.costs, ...topic.unknowns, ...topic.nextChecks]) {
    if (!item.sourceIds.length && !/未確認/.test(item.text)) ctx.addIssue({ code: "custom", message: "出典のない記述は未確認であることを明示してください" });
    for (const id of item.sourceIds) if (!ids.has(id)) ctx.addIssue({ code: "custom", message: `不明な出典ID: ${id}` });
  }
});
export const livingTopicsSchema = z.array(livingTopicSchema).length(3).refine((topics) => new Set(topics.map((t) => t.issueId)).size === 3, "暮らしの3テーマに重複があります");


export const rosterVerificationAuditSchema = z.object({
  scope: z.enum(["national", "prefectural", "nagoya"]),
  checkedAt: z.iso.date(),
  sources: z.array(z.object({ url: httpUrl, purpose: z.string().min(1), accessNotes: z.string().optional() })).min(1),
  matchedIds: z.array(z.string().min(1)).min(1),
  changes: z.array(z.string()),
  unresolved: z.array(z.string()),
  notes: z.array(z.string()).optional(),
}).refine((audit) => new Set(audit.matchedIds).size === audit.matchedIds.length, "照合済みIDが重複しています");

export const speechImportAuditSchema = z.object({
  pullRequestUrl: httpUrl,
  sourceCommit: z.string().regex(/^[0-9a-f]{40}$/),
  runUrl: httpUrl,
  reviewedAt: z.iso.date(),
  collectionCheckedAt: z.iso.date(),
  beforeCount: z.number().int().nonnegative(),
  afterCount: z.number().int().positive(),
  speechIds: z.array(z.string().min(1)).min(1),
  note: z.string().min(1),
}).refine((audit) => audit.collectionCheckedAt <= audit.reviewedAt, "照会日と取込確認日の順序が不正です")
  .refine((audit) => audit.afterCount - audit.beforeCount === audit.speechIds.length, "追加件数と取込記録が一致しません")
  .refine((audit) => new Set(audit.speechIds).size === audit.speechIds.length, "取込発言IDが重複しています");
