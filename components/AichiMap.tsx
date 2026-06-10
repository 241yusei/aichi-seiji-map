import { AICHI_MAP } from "@/lib/aichi-map.generated";

// 地域ごとの淡色（非政党色・暖色ニュートラルの濃淡で区別）。
const REGION_CLASS: Record<string, string> = {
  名古屋: "r-nagoya",
  尾張: "r-owari",
  知多: "r-chita",
  西三河: "r-nishi",
  東三河: "r-higashi",
};

// 愛知県の市町村クリック可能地図（静的SVG・一次GeoJSON由来）。
// 各市町村は /municipalities/[slug] へ。色は地域別の濃淡のみ（中立）。
export function AichiMap() {
  return (
    <figure className="amap border border-line bg-surface p-2">
      <style>{`
        .amap svg { width: 100%; height: auto; display: block; }
        .amap path { stroke: #1f1a14; stroke-width: 0.6; transition: fill .15s; }
        .amap .r-nagoya { fill: #e0d2b8; }
        .amap .r-owari { fill: #f2ebdb; }
        .amap .r-chita { fill: #e9dfc8; }
        .amap .r-nishi { fill: #ece3d0; }
        .amap .r-higashi { fill: #dccfb4; }
        .amap a:hover path { fill: #5c4470 !important; }
        .amap a:focus path { fill: #5c4470 !important; outline: none; }
      `}</style>
      <svg viewBox={AICHI_MAP.viewBox} role="img" aria-label="愛知県の市町村地図（クリックで各市町村へ）">
        {AICHI_MAP.shapes.map((s) => (
          <a key={s.govCode} href={`/municipalities/${s.slug}/`} aria-label={s.city}>
            <title>{s.city}</title>
            <path d={s.d} className={REGION_CLASS[s.region] ?? "r-owari"} />
          </a>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs text-faint">
        市町村をクリックすると、その議会・議員・首長へ移動します。色は地域区分（名古屋・尾張・知多・西三河・東三河）の目安で、政党とは無関係です。
        境界データ：国土数値情報（行政区域）。
      </figcaption>
    </figure>
  );
}
