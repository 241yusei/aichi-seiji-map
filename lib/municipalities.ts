// 自治体（市区町村）レジストリ＝市単位アダプタの単一の真実。
// 市を増やす手順:
//   1) ここに1行追加（govCode・slug・city・council・会議録URL）
//   2) data/seed/legislators.<slug>.seed.json に名簿（公式サイト由来）
//   3) `CITY=<slug> npm run fetch:city`（→ data/legislators.<slug>.json）
//   4) lib/data.ts の LEGISLATOR_FILES と scripts/validate-data.ts に追加
// minutesUrl が未確認の市は "" にする（会議録リンクは非表示になる）。

export interface Municipality {
  govCode: string; // 全国地方公共団体コード
  slug: string; // ファイル名スラッグ（英字）
  city: string; // 例: "豊田市"
  council: string; // 例: "豊田市議会"（名古屋市のみ "名古屋市会"）
  minutesLabel: string;
  minutesUrl: string; // 公式会議録検索のトップ。未確認なら "" → リンク非表示
}

export const MUNICIPALITIES: Municipality[] = [
  {
    govCode: "23100",
    slug: "nagoya",
    city: "名古屋市",
    council: "名古屋市会",
    minutesLabel: "名古屋市会 会議録・委員会記録検索システム",
    minutesUrl: "https://ssp.kaigiroku.net/tenant/nagoya/SpTop.html",
  },
  {
    govCode: "23211",
    slug: "toyota",
    city: "豊田市",
    council: "豊田市議会",
    minutesLabel: "豊田市議会 会議録検索システム",
    minutesUrl: "https://www.kensakusystem.jp/toyota-c/",
  },
  // Phase3（名簿・会議録URLは取得後に充填。現状は枠のみ）
  {
    govCode: "23201",
    slug: "toyohashi",
    city: "豊橋市",
    council: "豊橋市議会",
    minutesLabel: "豊橋市議会 会議録検索システム",
    minutesUrl: "",
  },
  {
    govCode: "23202",
    slug: "okazaki",
    city: "岡崎市",
    council: "岡崎市議会",
    minutesLabel: "岡崎市議会 会議録検索システム",
    minutesUrl: "",
  },
  {
    govCode: "23203",
    slug: "ichinomiya",
    city: "一宮市",
    council: "一宮市議会",
    minutesLabel: "一宮市議会 会議録検索システム",
    minutesUrl: "",
  },
  {
    govCode: "23206",
    slug: "kasugai",
    city: "春日井市",
    council: "春日井市議会",
    minutesLabel: "春日井市議会 会議録検索システム",
    minutesUrl: "",
  },
];

export function municipalityByGov(govCode?: string): Municipality | undefined {
  return govCode ? MUNICIPALITIES.find((m) => m.govCode === govCode) : undefined;
}

export function municipalityBySlug(slug: string): Municipality | undefined {
  return MUNICIPALITIES.find((m) => m.slug === slug);
}
