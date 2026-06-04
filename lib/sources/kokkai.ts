// 国会会議録検索システム API アダプタ（vendor: "kokkai", level: "national"）。
// 公開API・手続き不要。直列・数秒間隔・キャッシュは http.ts で担保する。
// API 仕様: https://kokkai.ndl.go.jp/api.html

import type { DateRange, Legislator, SpeechRecord } from "../types";
import type { SpeechSource } from "./types";
import { getJson } from "./http";

const ENDPOINT = "https://kokkai.ndl.go.jp/api/speech";
const NAMESPACE = "kokkai";
const TEXT_CAP = 8000; // 1発言の保存上限（極端に長い議事進行の発言対策）

interface KokkaiSpeechRecord {
  speechID: string;
  date: string;
  nameOfHouse: string;
  nameOfMeeting: string;
  issue: string;
  speaker: string;
  speakerGroup?: string;
  speech: string;
  speechURL: string;
}

interface KokkaiResponse {
  numberOfRecords: number;
  numberOfReturn: number;
  startRecord: number;
  nextRecordPosition?: number | null;
  message?: string;
  speechRecord?: KokkaiSpeechRecord[];
}

function normalizeName(name: string): string {
  return name.replace(/[\s　]/g, "");
}

function buildUrl(speaker: string, range: DateRange, startRecord: number): string {
  const params = new URLSearchParams({
    speaker,
    from: range.from,
    until: range.until,
    maximumRecords: "100",
    startRecord: String(startRecord),
    recordPacking: "json",
  });
  return `${ENDPOINT}?${params.toString()}`;
}

function capText(text: string): { text: string; isExcerpt: boolean } {
  if (text.length <= TEXT_CAP) return { text, isExcerpt: false };
  return { text: text.slice(0, TEXT_CAP) + "…（以下略・全文は出典を参照）", isExcerpt: true };
}

/**
 * 指定議員の発言を期間で取得して SpeechRecord[]（id = speechID）で返す。
 * - 同姓同名対策として speaker 名の完全一致（空白除去後）でフィルタ。
 * - 日付降順・上位 keep 件に絞る。
 */
export async function fetchKokkaiSpeeches(
  legislator: Legislator,
  range: DateRange,
  opts: { maxPages?: number; keep?: number } = {},
): Promise<SpeechRecord[]> {
  const maxPages = opts.maxPages ?? 2;
  const keep = opts.keep ?? 20;
  const wanted = normalizeName(legislator.name);
  const collected: SpeechRecord[] = [];
  let startRecord = 1;

  for (let page = 0; page < maxPages; page++) {
    const url = buildUrl(legislator.name, range, startRecord);
    const data = await getJson<KokkaiResponse>(url, { namespace: NAMESPACE });
    if (data.message) throw new Error(`国会API: ${data.message}`);
    const records = data.speechRecord ?? [];
    for (const r of records) {
      if (normalizeName(r.speaker) !== wanted) continue; // 同姓同名・部分一致を除外
      if (!r.speechURL || !r.date) continue;
      const { text, isExcerpt } = capText(r.speech ?? "");
      collected.push({
        id: r.speechID,
        legislatorId: legislator.id,
        date: r.date,
        body: `${r.nameOfHouse} ${r.nameOfMeeting} ${r.issue}`.trim(),
        text,
        sourceUrl: r.speechURL,
        isExcerpt,
      });
    }
    if (!data.nextRecordPosition) break;
    startRecord = data.nextRecordPosition;
  }

  const unique = new Map<string, SpeechRecord>();
  for (const s of collected) unique.set(s.id, s);
  return [...unique.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, keep);
}

/** レジストリ用の SpeechSource 実装（ロスターは seed 由来のため fetchLegislators は空）。 */
export const kokkaiSource: SpeechSource = {
  id: "kokkai",
  vendor: "kokkai",
  level: "national",
  capabilities: {
    speeches: true,
    votes: false,
    funding: false,
    fulltextRedistribution: true,
  },
  async fetchLegislators() {
    return [];
  },
  async fetchSpeeches(legislator, range) {
    return fetchKokkaiSpeeches(legislator, range);
  },
};
