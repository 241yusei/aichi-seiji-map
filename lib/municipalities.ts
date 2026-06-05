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
    minutesUrl: "https://ssp.kaigiroku.net/tenant/toyohashi/SpTop.html",
  },
  {
    govCode: "23202",
    slug: "okazaki",
    city: "岡崎市",
    council: "岡崎市議会",
    minutesLabel: "岡崎市議会 会議録検索システム",
    minutesUrl: "https://ssp.kaigiroku.net/tenant/okazaki/SpTop.html",
  },
  {
    govCode: "23203",
    slug: "ichinomiya",
    city: "一宮市",
    council: "一宮市議会",
    minutesLabel: "一宮市議会 会議録検索システム",
    minutesUrl: "https://ssp.kaigiroku.net/tenant/ichinomiya/SpTop.html",
  },
  {
    govCode: "23206",
    slug: "kasugai",
    city: "春日井市",
    council: "春日井市議会",
    minutesLabel: "春日井市議会 会議録検索システム",
    minutesUrl: "https://ssp.kaigiroku.net/tenant/kasugai/SpTop.html",
  },
  // Phase3（第2陣・名簿/会議録URLは取得後に充填）
  { govCode: "23207", slug: "toyokawa", city: "豊川市", council: "豊川市議会", minutesLabel: "豊川市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/toyokawa/SpTop.html" },
  { govCode: "23210", slug: "kariya", city: "刈谷市", council: "刈谷市議会", minutesLabel: "刈谷市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/kariya/SpTop.html" },
  { govCode: "23212", slug: "anjo", city: "安城市", council: "安城市議会", minutesLabel: "安城市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/anjo/SpTop.html" },
  { govCode: "23213", slug: "nishio", city: "西尾市", council: "西尾市議会", minutesLabel: "西尾市議会 会議録検索システム", minutesUrl: "https://www.city.nishio.aichi.dbsr.jp/" },
  { govCode: "23219", slug: "komaki", city: "小牧市", council: "小牧市議会", minutesLabel: "小牧市議会 会議録検索システム", minutesUrl: "https://komaki.gijiroku.com/" },
  { govCode: "23220", slug: "inazawa", city: "稲沢市", council: "稲沢市議会", minutesLabel: "稲沢市議会 会議録検索システム", minutesUrl: "https://inazawa.gijiroku.com/" },
  // Phase3（第3陣・名簿/会議録URLは取得後に充填）
  { govCode: "23204", slug: "seto", city: "瀬戸市", council: "瀬戸市議会", minutesLabel: "瀬戸市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/seto/SpTop.html" },
  { govCode: "23205", slug: "handa", city: "半田市", council: "半田市議会", minutesLabel: "半田市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/handa/SpTop.html" },
  { govCode: "23217", slug: "konan", city: "江南市", council: "江南市議会", minutesLabel: "江南市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/kounan/SpTop.html" },
  { govCode: "23222", slug: "tokai", city: "東海市", council: "東海市議会", minutesLabel: "東海市議会 会議録検索システム", minutesUrl: "https://www.kensakusystem.jp/tokai/" },
  { govCode: "23223", slug: "obu", city: "大府市", council: "大府市議会", minutesLabel: "大府市議会 会議録検索システム", minutesUrl: "https://obu.gijiroku.com/" },
  { govCode: "23224", slug: "chita", city: "知多市", council: "知多市議会", minutesLabel: "知多市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/chita/SpTop.html" },
  { govCode: "23226", slug: "owariasahi", city: "尾張旭市", council: "尾張旭市議会", minutesLabel: "尾張旭市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/owariasahi/SpTop.html" },
  { govCode: "23230", slug: "nisshin", city: "日進市", council: "日進市議会", minutesLabel: "日進市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/nisshin/SpTop.html" },
  // Phase3（第4陣・名簿/会議録URLは取得後に充填）
  { govCode: "23208", slug: "tsushima", city: "津島市", council: "津島市議会", minutesLabel: "津島市議会 会議録検索システム", minutesUrl: "https://www.city.tsushima.aichi.dbsr.jp/" },
  { govCode: "23209", slug: "hekinan", city: "碧南市", council: "碧南市議会", minutesLabel: "碧南市議会 会議録検索システム", minutesUrl: "https://city.hekinan.aichi.dbsr.jp/" },
  { govCode: "23214", slug: "gamagori", city: "蒲郡市", council: "蒲郡市議会", minutesLabel: "蒲郡市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/gamagori/SpTop.html" },
  { govCode: "23215", slug: "inuyama", city: "犬山市", council: "犬山市議会", minutesLabel: "犬山市議会 会議録検索システム", minutesUrl: "https://www.kensakusystem.jp/inuyama/" },
  { govCode: "23216", slug: "tokoname", city: "常滑市", council: "常滑市議会", minutesLabel: "常滑市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/tokoname/SpTop.html" },
  { govCode: "23221", slug: "shinshiro", city: "新城市", council: "新城市議会", minutesLabel: "新城市議会 会議録検索システム", minutesUrl: "https://www.city.shinshiro.aichi.dbsr.jp/" },
  { govCode: "23225", slug: "chiryu", city: "知立市", council: "知立市議会", minutesLabel: "知立市議会 会議録検索システム", minutesUrl: "http://www.kensakusystem.jp/chiryu/index.html" },
  { govCode: "23227", slug: "takahama", city: "高浜市", council: "高浜市議会", minutesLabel: "高浜市議会 議会中継（発言検索）", minutesUrl: "https://smart.discussvision.net/smart/tenant/takahama/WebView/rd/council.html" },
  { govCode: "23228", slug: "iwakura", city: "岩倉市", council: "岩倉市議会", minutesLabel: "岩倉市議会 会議録検索システム", minutesUrl: "https://www.kensakusystem.jp/iwakura/" },
  // Phase3（第5陣＝最終陣・これで愛知38市すべて収録）
  { govCode: "23229", slug: "toyoake", city: "豊明市", council: "豊明市議会", minutesLabel: "豊明市議会 会議録検索システム", minutesUrl: "https://www.city.toyoake.aichi.dbsr.jp/" },
  { govCode: "23231", slug: "tahara", city: "田原市", council: "田原市議会", minutesLabel: "田原市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/tahara/SpTop.html" },
  { govCode: "23232", slug: "aisai", city: "愛西市", council: "愛西市議会", minutesLabel: "愛西市議会 会議録（市公式PDF）", minutesUrl: "" },
  { govCode: "23233", slug: "kiyosu", city: "清須市", council: "清須市議会", minutesLabel: "清須市議会 会議録検索システム", minutesUrl: "https://www.kensakusystem.jp/kiyosu/" },
  { govCode: "23234", slug: "kitanagoya", city: "北名古屋市", council: "北名古屋市議会", minutesLabel: "北名古屋市議会 会議録検索システム", minutesUrl: "https://ssp.kaigiroku.net/tenant/kitanagoya/SpTop.html" },
  { govCode: "23235", slug: "yatomi", city: "弥富市", council: "弥富市議会", minutesLabel: "弥富市議会 会議録（市公式PDF）", minutesUrl: "" },
  { govCode: "23236", slug: "miyoshi", city: "みよし市", council: "みよし市議会", minutesLabel: "みよし市議会 会議録検索システム", minutesUrl: "https://www.kensakusystem.jp/miyoshi-c/index.html" },
  { govCode: "23237", slug: "ama", city: "あま市", council: "あま市議会", minutesLabel: "あま市議会 会議録検索システム", minutesUrl: "https://www.city.ama.aichi.dbsr.jp/" },
  { govCode: "23238", slug: "nagakute", city: "長久手市", council: "長久手市議会", minutesLabel: "長久手市議会 会議録検索システム", minutesUrl: "http://www.kensakusystem.jp/nagakute/" },
];

export function municipalityByGov(govCode?: string): Municipality | undefined {
  return govCode ? MUNICIPALITIES.find((m) => m.govCode === govCode) : undefined;
}

export function municipalityBySlug(slug: string): Municipality | undefined {
  return MUNICIPALITIES.find((m) => m.slug === slug);
}
