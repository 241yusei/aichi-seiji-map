// OGP 画像（事実カード）用の和文サブセットフォントを生成する。
// ビルド時にネットワークへ出ないよう、ここで Google Fonts から必要文字だけの
// woff（satori 対応）を取得して assets/ に同梱する。カードを増やしたら再実行する。
//   npm run og:font
//
// 収録文字＝全事実カードの見出し/フック＋固定文言＋ひらがな/カタカナ/ASCII＋約物。

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getFactCards } from "../lib/data";

const OUT = join(process.cwd(), "assets", "og-noto-jp-subset.woff");
const WEIGHT = 700;

function buildCharset(): string {
  const cards = getFactCards();
  // OGP画像は title/hook に加えて points（ラベル・値）もバー付きで描画する。
  const dynamic = cards
    .map(
      (c) =>
        `${c.title}${c.hook}${(c.points ?? []).map((p) => `${p.label}${p.value}`).join("")}`,
    )
    .join("");
  const fixed =
    "政治のトリセツあいち・なごや愛知政治マップ／事実カード一次ソース付き・中立aichi-seiji-mapギャップ矛盾対比読み方の注意知ってから、選ぶ。名古屋の政をやさしい解説で国会県議会全市町村を横断";
  const ascii = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i)).join(
    "",
  );
  const hira = Array.from({ length: 0x3096 - 0x3041 + 1 }, (_, i) =>
    String.fromCharCode(0x3041 + i),
  ).join("");
  const kata = Array.from({ length: 0x30fa - 0x30a1 + 1 }, (_, i) =>
    String.fromCharCode(0x30a1 + i),
  ).join("");
  const punct = "、。，．・「」『』（）【】〔〕％円件名年月日〜ー－…";
  const all = dynamic + fixed + ascii + hira + kata + punct;
  return Array.from(new Set(Array.from(all))).join("");
}

async function main(): Promise<void> {
  const text = buildCharset();
  const api = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${WEIGHT}&text=${encodeURIComponent(
    text,
  )}`;
  const css = await fetch(api, {
    headers: {
      // 古い UA だと woff/ttf（satori 対応）が返る。最新 UA だと woff2（非対応）。
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0 Safari/537.36",
    },
  }).then((r) => r.text());

  // woff2 以外（woff / truetype / opentype）の URL を集める。
  const urls: string[] = [];
  const re = /url\((https:\/\/[^)]+)\)\s*format\('([^']+)'\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    if (m[2] !== "woff2") urls.push(m[1]);
  }
  if (urls.length === 0) {
    throw new Error(`フォントURLを取得できませんでした。CSS:\n${css.slice(0, 400)}`);
  }
  const res = await fetch(urls[0]);
  const ab = (await res.arrayBuffer()) as ArrayBuffer;
  const bytes = new Uint8Array(ab);
  writeFileSync(OUT, bytes);
  console.log(
    `✓ OGフォント生成: ${OUT}（${(ab.byteLength / 1024).toFixed(1)} KB / 文字数 ${text.length}）`,
  );
}

main().catch((e) => {
  console.error("✗ OGフォント生成に失敗:", (e as Error).message);
  process.exit(1);
});
