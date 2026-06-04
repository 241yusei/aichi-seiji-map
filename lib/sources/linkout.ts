// 出典リンクのみのソース（本文＝発言全文を保持しない）。
// - 愛知県議会(dbsr): robots が実質 Disallow のためスクレイプせず、公式会議録検索へ出典リンクで案内。
// - 名古屋市会(discussvision): 全文の外部公開は市へ要許諾のため、v1 は名簿＋会議録リンクに留める
//   （許諾後に discussvision アダプタで「抜粋＋AI要約」を追加可能）。

import type { DateRange, Legislator, Level, Speech } from "../types";
import type { SpeechSource } from "./types";

/** 県・市の公式会議録検索システム（争点横串ビュー用。Phase1は県＝愛知県議会・市＝名古屋市会）。 */
export const MINUTES_SEARCH: Partial<Record<Level, { label: string; url: string }>> = {
  prefectural: {
    label: "愛知県議会 会議録検索システム",
    url: "https://www.pref.aichi.dbsr.jp/",
  },
  municipal: {
    label: "名古屋市会 会議録・委員会記録検索システム",
    url: "https://ssp.kaigiroku.net/tenant/nagoya/SpTop.html",
  },
};

/** 自治体コード単位の会議録検索リンク（Phase2 で市が増えても拡張できる）。 */
export const MINUTES_BY_GOV: Record<string, { label: string; url: string }> = {
  "23000": { label: "愛知県議会 会議録検索システム", url: "https://www.pref.aichi.dbsr.jp/" },
  "23100": {
    label: "名古屋市会 会議録・委員会記録検索システム",
    url: "https://ssp.kaigiroku.net/tenant/nagoya/SpTop.html",
  },
  "23211": { label: "豊田市議会 会議録検索システム", url: "https://www.kensakusystem.jp/toyota-c/" },
};

/** 議員の層・自治体コードから、本人の発言を探せる公式会議録検索を返す（国会は undefined）。 */
export function minutesFor(legislator: { level: Level; govCode?: string }): {
  label: string;
  url: string;
} | undefined {
  if (legislator.level === "national") return undefined;
  if (legislator.govCode && MINUTES_BY_GOV[legislator.govCode]) {
    return MINUTES_BY_GOV[legislator.govCode];
  }
  if (legislator.level === "prefectural") return MINUTES_BY_GOV["23000"];
  return MINUTES_SEARCH.municipal;
}

/** 国会の採決（投票結果）の公式出典。記名でない採決は個人賛否が非公開。 */
export const VOTE_RESULT_SOURCE: Record<"衆議院" | "参議院", { label: string; url: string }> = {
  衆議院: {
    label: "衆議院 議案・本会議の議決結果",
    url: "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm",
  },
  参議院: {
    label: "参議院 本会議投票結果",
    url: "https://www.sangiin.go.jp/japanese/touhyoulist/touhyoulist.html",
  },
};

/** 政治資金の公式出典（総務省）。Phase1は出典リンク＋主要項目のみ。 */
export const FUNDING_SOURCE = {
  label: "総務省 政治資金収支報告書",
  url: "https://www.soumu.go.jp/senkyo/seiji_s/seijishikin/",
};

/** レジストリ用の linkout ソース（本文を持たないため speeches=false）。 */
export function makeLinkoutSource(args: {
  id: string;
  level: Exclude<Level, "national">;
  govCode?: string;
}): SpeechSource {
  return {
    id: args.id,
    vendor: "linkout",
    level: args.level,
    govCode: args.govCode,
    capabilities: {
      speeches: false,
      votes: false,
      funding: false,
      fulltextRedistribution: false,
    },
    async fetchLegislators() {
      return [];
    },
    async fetchSpeeches(_legislator: Legislator, _range: DateRange): Promise<Speech[]> {
      return [];
    },
  };
}
