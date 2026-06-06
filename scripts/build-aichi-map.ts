// 愛知県の市町村境界GeoJSONから、クリック可能なSVG用のパスデータを生成する。
// 出力 lib/aichi-map.generated.ts（自己完結・ビルド時ネット不要）。
// データ元: smartnews-smri/japan-topography（国土数値情報 行政区域 N03 を簡略化）。
//   取得: data/raw/aichi-municipalities.geojson（.gitignore。再生成時に再取得）
//   実行: npm run build:map
//
// 名古屋市は16区に分かれているため govCode 231xx を 23100 に統合する。

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MUNICIPALITIES } from "../lib/municipalities";
import { regionOf } from "../lib/regions";

const SRC = join(process.cwd(), "data", "raw", "aichi-municipalities.geojson");
const OUT = join(process.cwd(), "lib", "aichi-map.generated.ts");
const W = 1000;

if (!existsSync(SRC)) {
  console.error(`✗ ${SRC} が無い。先に GeoJSON を取得すること。`);
  process.exit(1);
}

interface Feature {
  properties: Record<string, string | null>;
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
}

const gj = JSON.parse(readFileSync(SRC, "utf-8")) as { features: Feature[] };

// 名古屋の区コード(23101..23116)を 23100 に丸める。
function normGov(code: string): string {
  if (/^231\d\d$/.test(code) && code !== "23100") return "23100";
  return code;
}

// bbox
let minLon = Infinity,
  maxLon = -Infinity,
  minLat = Infinity,
  maxLat = -Infinity;
function eachPoint(geom: Feature["geometry"], fn: (lon: number, lat: number) => void) {
  const polys = (geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates) as number[][][][];
  for (const poly of polys) for (const ring of poly) for (const [lon, lat] of ring) fn(lon, lat);
}
for (const f of gj.features)
  eachPoint(f.geometry, (lon, lat) => {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

const midLat = (minLat + maxLat) / 2;
const kx = Math.cos((midLat * Math.PI) / 180);
const pxRange = (maxLon - minLon) * kx;
const pyRange = maxLat - minLat;
const scale = W / pxRange;
const H = Math.round(pyRange * scale);

function X(lon: number): number {
  return Math.round((lon - minLon) * kx * scale * 10) / 10;
}
function Y(lat: number): number {
  return Math.round((maxLat - lat) * scale * 10) / 10;
}

function ringToPath(ring: number[][]): string {
  return (
    ring.map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${X(lon)},${Y(lat)}`).join("") + "Z"
  );
}
function geomToPath(geom: Feature["geometry"]): string {
  const polys = (geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates) as number[][][][];
  return polys.map((poly) => poly.map(ringToPath).join("")).join("");
}

// govCode ごとにパスを連結
const pathByGov = new Map<string, string>();
let skipped = 0;
for (const f of gj.features) {
  const raw = f.properties.N03_007 ?? "";
  const gov = normGov(raw);
  const muni = MUNICIPALITIES.find((m) => m.govCode === gov);
  if (!muni) {
    skipped++;
    continue;
  }
  pathByGov.set(gov, (pathByGov.get(gov) ?? "") + geomToPath(f.geometry));
}

const shapes = [...pathByGov.entries()]
  .map(([gov, d]) => {
    const muni = MUNICIPALITIES.find((m) => m.govCode === gov)!;
    return { govCode: gov, slug: muni.slug, city: muni.city, region: regionOf(gov)?.name ?? "", d };
  })
  .sort((a, b) => a.govCode.localeCompare(b.govCode));

const body = `// 自動生成（scripts/build-aichi-map.ts）。編集しない。
export interface AichiMapShape { govCode: string; slug: string; city: string; region: string; d: string }
export const AICHI_MAP: { viewBox: string; width: number; height: number; shapes: AichiMapShape[] } = {
  viewBox: "0 0 ${W} ${H}",
  width: ${W},
  height: ${H},
  shapes: ${JSON.stringify(shapes)},
};
`;
writeFileSync(OUT, body);
console.log(
  `✓ 地図生成: ${OUT}（市町村 ${shapes.length} / viewBox 0 0 ${W} ${H} / skip ${skipped}）`,
);
