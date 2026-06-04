// /data 配下の正規化JSON を読み込む唯一の入口。
// ページ・コンポーネントはここ以外からデータを直接触らない。
// 読み込み時に zod で検証し、壊れたデータはビルドを止める（一次ソース主義の担保）。
//
// 注意: fs を使うためサーバーコンポーネント（"use client" でない）からのみ呼ぶこと。

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Funding, Issue, Legislator, SpeechRecord, Vote } from "./types";
import {
  fundingsSchema,
  issuesSchema,
  legislatorsSchema,
  speechRecordsSchema,
  votesSchema,
} from "./zod-schemas";

const DATA_DIR = join(process.cwd(), "data");

function readArray<T>(file: string, schema: { parse: (data: unknown) => unknown }): T[] {
  const path = join(DATA_DIR, file);
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8").trim();
  if (!raw) return [];
  return schema.parse(JSON.parse(raw)) as T[];
}

// --- 議員 ---
const LEGISLATOR_FILES = [
  "legislators.aichi.json", // 国会（愛知選出）
  "legislators.aichi-pref.json", // 愛知県議会
  "legislators.nagoya.json", // 名古屋市会
];

export function getLegislators(): Legislator[] {
  return LEGISLATOR_FILES.flatMap((f) => readArray<Legislator>(f, legislatorsSchema));
}

export function getLegislator(id: string): Legislator | undefined {
  return getLegislators().find((l) => l.id === id);
}

// --- 発言 ---
const SPEECH_FILES = ["speeches.national.json", "speeches.municipal.json"];

// AI要約は data/summaries/<speechId>.json にキャッシュし、読込時にマージする。
// （収集の再実行で要約が消えないよう、発言データとは分離して保持する）
interface CachedSummary {
  id: string;
  aiSummary: string;
  summaryModel?: string;
  summaryGeneratedAt?: string;
}
let summaryCache: Map<string, CachedSummary> | null = null;

function loadSummaries(): Map<string, CachedSummary> {
  if (summaryCache) return summaryCache;
  const map = new Map<string, CachedSummary>();
  const dir = join(DATA_DIR, "summaries");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      try {
        const obj = JSON.parse(readFileSync(join(dir, f), "utf-8")) as CachedSummary;
        if (obj?.id && obj.aiSummary) map.set(obj.id, obj);
      } catch {
        // 壊れた要約ファイルは無視（本文表示は継続）
      }
    }
  }
  summaryCache = map;
  return map;
}

export function getSpeeches(): SpeechRecord[] {
  const summaries = loadSummaries();
  return SPEECH_FILES.flatMap((f) => readArray<SpeechRecord>(f, speechRecordsSchema)).map((s) => {
    const sum = summaries.get(s.id);
    return sum
      ? {
          ...s,
          aiSummary: sum.aiSummary,
          summaryModel: sum.summaryModel,
          summaryGeneratedAt: sum.summaryGeneratedAt,
        }
      : s;
  });
}

export function getSpeechesByLegislator(legislatorId: string): SpeechRecord[] {
  return getSpeeches()
    .filter((s) => s.legislatorId === legislatorId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getSpeechesByIds(ids: string[]): SpeechRecord[] {
  const set = new Set(ids);
  return getSpeeches().filter((s) => set.has(s.id));
}

// --- 採決 ---
export function getVotes(legislatorId: string): Vote[] {
  return readArray<Vote>("votes.json", votesSchema)
    .filter((v) => v.legislatorId === legislatorId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// --- 政治資金 ---
export function getFunding(legislatorId: string): Funding[] {
  return readArray<Funding>("funding.json", fundingsSchema)
    .filter((f) => f.legislatorId === legislatorId)
    .sort((a, b) => b.year - a.year);
}

// --- 争点 ---
export function getIssues(): Issue[] {
  return readArray<Issue>("issues.json", issuesSchema);
}

export function getIssue(id: string): Issue | undefined {
  return getIssues().find((i) => i.id === id);
}
