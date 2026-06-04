// 名古屋市の区 → 各層の選挙区マッピング（純関数のみ。クライアントからも安全に import 可）。
// 衆院小選挙区の区割りは各 愛知N区 の Wikipedia（2024-01-01現在の区域・第51回も同じ）で確認。
// 県議・市会の district はデータ側の "名古屋市○区" 文字列に一致させる。

export interface NagoyaWard {
  ward: string; // "千種区"
  prefDistrict: string; // "名古屋市千種区"（県議・市会データの district に一致）
  shugiin: string; // "愛知2区"
  zip3: string[]; // 郵便番号の上3桁（おおよその対応）
}

export const NAGOYA_WARDS: NagoyaWard[] = [
  { ward: "東区", prefDistrict: "名古屋市東区", shugiin: "愛知1区", zip3: ["461"] },
  { ward: "北区", prefDistrict: "名古屋市北区", shugiin: "愛知1区", zip3: ["462"] },
  { ward: "西区", prefDistrict: "名古屋市西区", shugiin: "愛知1区", zip3: ["451"] },
  { ward: "中区", prefDistrict: "名古屋市中区", shugiin: "愛知1区", zip3: ["460"] },
  { ward: "千種区", prefDistrict: "名古屋市千種区", shugiin: "愛知2区", zip3: ["464"] },
  { ward: "守山区", prefDistrict: "名古屋市守山区", shugiin: "愛知2区", zip3: ["463"] },
  { ward: "名東区", prefDistrict: "名古屋市名東区", shugiin: "愛知2区", zip3: ["465"] },
  { ward: "昭和区", prefDistrict: "名古屋市昭和区", shugiin: "愛知3区", zip3: ["466"] },
  { ward: "緑区", prefDistrict: "名古屋市緑区", shugiin: "愛知3区", zip3: ["458"] },
  { ward: "天白区", prefDistrict: "名古屋市天白区", shugiin: "愛知3区", zip3: ["468"] },
  { ward: "瑞穂区", prefDistrict: "名古屋市瑞穂区", shugiin: "愛知4区", zip3: ["467"] },
  { ward: "熱田区", prefDistrict: "名古屋市熱田区", shugiin: "愛知4区", zip3: ["456"] },
  { ward: "港区", prefDistrict: "名古屋市港区", shugiin: "愛知4区", zip3: ["455"] },
  { ward: "南区", prefDistrict: "名古屋市南区", shugiin: "愛知4区", zip3: ["457"] },
  { ward: "中村区", prefDistrict: "名古屋市中村区", shugiin: "愛知5区", zip3: ["450", "453"] },
  { ward: "中川区", prefDistrict: "名古屋市中川区", shugiin: "愛知5区", zip3: ["454"] },
];

/** 郵便番号（7桁またはハイフン付き）の上3桁から名古屋市の区を引く。市外・対象外は null。 */
export function resolveZipToWard(zip: string): NagoyaWard | null {
  const digits = zip.replace(/[^0-9]/g, "");
  if (digits.length < 3) return null;
  const p3 = digits.slice(0, 3);
  return NAGOYA_WARDS.find((w) => w.zip3.includes(p3)) ?? null;
}

export interface LegBrief {
  id: string;
  name: string;
  district: string;
  party?: string;
}

export interface WardData {
  ward: string;
  shugiin: LegBrief[];
  sangiin: LegBrief[];
  kengikai: LegBrief[];
  shikai: LegBrief[];
}
