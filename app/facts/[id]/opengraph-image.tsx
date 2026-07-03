import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getFactCard, getFactCards } from "@/lib/data";

// 静的エクスポート（output: export）では nodejs ランタイムでビルド時に PNG を書き出す。
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 事実カードごとに OGP 画像を1枚ずつ静的生成する。
export function generateStaticParams() {
  return getFactCards().map((f) => ({ id: f.id }));
}

// 和文サブセットフォントは同梱（assets/）。ビルド時にネットへ出ない。
// カードを増やして新しい文字が出たら `npm run og:font` で再生成する。
const fontData = readFileSync(join(process.cwd(), "assets", "og-noto-jp-subset.woff"));

// クリーム台帳の配色（globals.css @theme と同期）
const C = {
  paper: "#f7f2e9",
  ink: "#1f1a14",
  muted: "#5d564b",
  faint: "#857c6d",
  line: "#e3dccd",
  accent: "#5c4470",
  accentDeep: "#463254",
  yea: "#2f6f4f",
  nay: "#a63a2b",
};

// 「賛成17・反対7」型 → 賛否の内訳
function parseYeaNay(v: string): { yea: number; nay: number } | null {
  const m = v.match(/賛成\s*([\d,]+)\s*[・,、]\s*反対\s*([\d,]+)/);
  if (!m) return null;
  return { yea: Number(m[1].replace(/,/g, "")), nay: Number(m[2].replace(/,/g, "")) };
}

// 「約1億547万円」「約2,224万円」「54人」「11件」型 → 数値（バー比率用）
function parseNumeric(v: string): number | null {
  const s = v.replace(/[,，約]/g, "");
  const oku = s.match(/([\d.]+)億(?:([\d.]+)万)?/);
  if (oku) return parseFloat(oku[1]) * 1e8 + (oku[2] ? parseFloat(oku[2]) * 1e4 : 0);
  const man = s.match(/([\d.]+)万/);
  if (man) return parseFloat(man[1]) * 1e4;
  const plain = s.match(/([\d.]+)/);
  return plain ? parseFloat(plain[1]) : null;
}

const BAR_W = 1088; // 1200 - padding 56*2

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getFactCard(id);
  const brand = "政治のトリセツ ／ 事実カード";
  const title = card?.title ?? "事実カード";
  const hook = card?.hook ?? "";
  const footer = "一次ソース付き・中立 ／ aichi-seiji-map";

  // 上位3ポイントをバー付きで描画（数字が主役の1枚チャートにする）
  const points = (card?.points ?? []).slice(0, 3);
  const numerics = points.map((p) => parseNumeric(p.value));
  const maxNum = Math.max(1, ...numerics.filter((n): n is number => n !== null));

  const rows = points.map((p, i) => {
    const yn = parseYeaNay(p.value);
    const num = numerics[i];
    let bar: React.ReactNode = null;
    if (yn && yn.yea + yn.nay > 0) {
      const total = yn.yea + yn.nay;
      const yeaW = Math.max(6, Math.round((yn.yea / total) * BAR_W));
      const nayW = Math.max(yn.nay > 0 ? 6 : 0, BAR_W - yeaW);
      bar = (
        <div style={{ display: "flex", width: BAR_W, height: 24 }}>
          <div style={{ display: "flex", width: yeaW, backgroundColor: C.yea }} />
          <div style={{ display: "flex", width: nayW, backgroundColor: C.nay }} />
        </div>
      );
    } else if (num !== null) {
      const w = Math.max(6, Math.round((num / maxNum) * BAR_W));
      bar = (
        <div style={{ display: "flex", width: BAR_W, height: 24, backgroundColor: C.line }}>
          <div style={{ display: "flex", width: w, backgroundColor: C.accent }} />
        </div>
      );
    }
    return (
      <div key={i} style={{ display: "flex", flexDirection: "column", marginTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: C.muted }}>{p.label}</div>
          <div style={{ display: "flex", fontSize: 28, color: C.ink }}>{p.value}</div>
        </div>
        {bar}
      </div>
    );
  });

  const titleSize = title.length > 26 ? 40 : 46;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: C.paper,
          padding: "56px",
          justifyContent: "space-between",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, color: C.accentDeep }}>{brand}</div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            color: C.ink,
            lineHeight: 1.22,
          }}
        >
          {title}
        </div>
        {rows.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>{rows}</div>
        ) : (
          <div style={{ display: "flex", fontSize: 30, color: C.muted }}>{hook}</div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `5px solid ${C.accent}`,
            paddingTop: 16,
            fontSize: 20,
            color: C.faint,
          }}
        >
          <div style={{ display: "flex" }}>{rows.length > 0 ? hook : ""}</div>
          <div style={{ display: "flex" }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
