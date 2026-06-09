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

export default async function OgImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getFactCard(id);
  const brand = "政治のトリセツ ／ 事実カード";
  const title = card?.title ?? "事実カード";
  const hook = card?.hook ?? "";
  const footer = "一次ソース付き・中立 ／ aichi-seiji-map";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fbfbfa",
          padding: "64px",
          justifyContent: "space-between",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#0a5b62" }}>{brand}</div>
        <div
          style={{
            display: "flex",
            fontSize: 58,
            fontWeight: 700,
            color: "#1a1c1e",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#5b6066" }}>{hook}</div>
        <div
          style={{
            display: "flex",
            borderTop: "5px solid #0f7d86",
            paddingTop: 18,
            fontSize: 22,
            color: "#7a828a",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
