import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// トップ（サイト共通）のOGP画像。静的エクスポートのためビルド時に PNG を書き出す。
export const runtime = "nodejs";
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 和文サブセットフォントは同梱（assets/）。文字を増やしたら `npm run og:font` で再生成。
const fontData = readFileSync(join(process.cwd(), "assets", "og-noto-jp-subset.woff"));

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#f7f2e9",
          padding: "64px",
          justifyContent: "space-between",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#463254" }}>
          政治のトリセツ あいち・なごや
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: "#1f1a14" }}>
            知ってから、選ぶ。
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#5d564b", lineHeight: 1.5 }}>
            愛知・名古屋の政治を、やさしい解説と一次ソースで。
          </div>
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "5px solid #5c4470",
            paddingTop: 18,
            fontSize: 22,
            color: "#857c6d",
          }}
        >
          国会（愛知選出）・愛知県議会・全54市町村を横断 ／ 中立・一次ソース付き
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans JP", data: fontData, style: "normal", weight: 400 }],
    },
  );
}
