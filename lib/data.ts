// /data 配下の正規化JSON を読み込む唯一の入口。
// ページ・コンポーネントはここ以外からデータを直接触らない。
// 読み込み時に zod で検証し、壊れたデータはビルドを止める（一次ソース主義の担保）。
//
// 注意: fs を使うためサーバーコンポーネント（"use client" でない）からのみ呼ぶこと。

import { existsSync, readFileSync } from "node:fs";
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

export function getSpeeches(): SpeechRecord[] {
  return SPEECH_FILES.flatMap((f) => readArray<SpeechRecord>(f, speechRecordsSchema));
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
