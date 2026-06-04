// 出典リンクのみのソース（本文＝発言全文を保持しない）。
// - 愛知県議会(dbsr): robots が実質 Disallow のためスクレイプせず、公式会議録検索へ出典リンクで案内。
// - 名古屋市会(discussvision): 全文の外部公開は市へ要許諾のため、v1 は名簿＋会議録リンクに留める
//   （許諾後に discussvision アダプタで「抜粋＋AI要約」を追加可能）。

import type { DateRange, Legislator, Level, Speech } from "../types";
import type { SpeechSource } from "./types";

/** 県・市の公式会議録検索システム。発言は本文を持たず、ここへ出典リンクで案内する。 */
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
