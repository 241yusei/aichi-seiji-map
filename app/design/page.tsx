import type { CSSProperties } from "react";
import { Archivo, Anton, Space_Grotesk, Space_Mono } from "next/font/google";

// デザイン方向の比較用プレビュー（/design）。本番サイトのトークンには影響しない。
// 各案は CSS 変数をローカル上書きして同一マークアップを別トーンで描画する。
const archivo = Archivo({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-archivo", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-grotesk", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });

type Variant = {
  id: string;
  name: string;
  note: string;
  vars: CSSProperties;
  /** アクセントをベタ面で使う案（C）だけ true。 */
  block?: boolean;
};

const VARIANTS: Variant[] = [
  {
    id: "swiss",
    name: "案A ─ 硬派スイス",
    note: "コバルト #1A3FB0 ／ 見出し Archivo。中立データの王道・最も外さない。",
    vars: {
      "--color-paper": "#f7f5ef",
      "--color-ink": "#16161a",
      "--color-muted": "#56564f",
      "--color-faint": "#8a897f",
      "--color-line": "#dedbce",
      "--color-accent": "#1a3fb0",
      "--color-accent-deep": "#16357f",
      "--font-display": "var(--font-archivo), var(--font-noto), sans-serif",
    } as CSSProperties,
  },
  {
    id: "zine",
    name: "案B ─ 032c 編集誌",
    note: "くすんだ朱 #C8351B ／ 見出し Anton（超极太ポスター）。攻めの雑誌トーン。",
    vars: {
      "--color-paper": "#f6f2ea",
      "--color-ink": "#14140f",
      "--color-muted": "#55524a",
      "--color-faint": "#8b897c",
      "--color-line": "#ddd6c7",
      "--color-accent": "#c8351b",
      "--color-accent-deep": "#9e2814",
      "--font-display": "var(--font-anton), var(--font-noto), sans-serif",
    } as CSSProperties,
  },
  {
    id: "acid",
    name: "案C ─ アシッド・モダン",
    note: "アシッド #C7F000 を一撃のベタ面で ／ 見出し Space Grotesk。最も尖る・若い読者向け。",
    block: true,
    vars: {
      "--color-paper": "#eeede6",
      "--color-ink": "#14140f",
      "--color-muted": "#53524b",
      "--color-faint": "#86857c",
      "--color-line": "#d8d6cc",
      "--color-accent": "#c7f000",
      "--color-accent-deep": "#46550a",
      "--font-display": "var(--font-grotesk), var(--font-noto), sans-serif",
    } as CSSProperties,
  },
];

const monoStyle = { fontFamily: "var(--font-mono)" } as CSSProperties;

function Specimen({ block }: { block?: boolean }) {
  return (
    <div className="bg-paper px-5 py-10 text-ink sm:px-8">
      {/* ヒーロー（写真なし＝中立。タイポ・ファースト） */}
      <p className="text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep" style={monoStyle}>
        Aichi Politics Map / 一次ソースで
      </p>
      <h2 className="font-display mt-3 text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.0] tracking-[-0.02em]">
        誰が言い、
        <br />
        どう動いたか。
      </h2>
      <p className="mt-5 max-w-xl text-muted">
        国会・愛知県議会・全54市町村を横断。発言・採決・政治資金を、公的な一次ソース付きで。
      </p>

      {/* 統計（二極化＝数字を主役に） */}
      <div className="mt-8 grid grid-cols-3 gap-x-6 border-t-2 border-ink pt-3">
        {[
          ["1,244", "代表者"],
          ["1,604", "国会発言"],
          ["54", "市町村"],
        ].map(([v, l]) => (
          <div key={l}>
            <div className="font-display text-3xl tabular-nums sm:text-4xl">{v}</div>
            <div className="mt-1 text-[0.7rem] uppercase tracking-wider text-faint" style={monoStyle}>
              {l}
            </div>
          </div>
        ))}
      </div>

      {/* 議員行（No. ＋ 大判氏名 ＋ モノスペースのメタ。カードでなく罫線） */}
      <div className="mt-10">
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-faint" style={monoStyle}>
          Legislators / index
        </p>
        {[
          ["001", "河村たかし", "減税日本 ─ 衆・愛知1区"],
          ["002", "古川元久", "国民民主党 ─ 衆・愛知2区"],
          ["003", "伊藤孝恵", "国民民主党 ─ 参・愛知県選挙区"],
        ].map(([no, name, meta]) => (
          <div
            key={no}
            className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-4 transition-colors hover:bg-ink/[0.03]"
          >
            <span className="text-sm text-faint tabular-nums" style={monoStyle}>
              {no}
            </span>
            <div>
              <span className="font-display text-2xl leading-tight">{name}</span>
              <span className="ml-3 text-xs text-muted" style={monoStyle}>
                {meta}
              </span>
            </div>
            <span aria-hidden className="text-faint transition-colors group-hover:text-accent-deep">
              →
            </span>
          </div>
        ))}
      </div>

      {/* 発言（一次資料の引用ブロック＋出典） */}
      <div className="mt-10 border-l-2 border-ink pl-4">
        {block ? (
          <span className="inline-block bg-accent px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-ink" style={monoStyle}>
            Speech · 出典あり
          </span>
        ) : (
          <span className="text-[0.7rem] uppercase tracking-[0.16em] text-accent-deep" style={monoStyle}>
            Speech · 出典あり
          </span>
        )}
        <p className="mt-2 text-sm leading-relaxed">
          「商売と産業を大事にしていく、それをまず宣言せないかぬ。日本は戦後、弱体化法制で…」
        </p>
        <p className="mt-2 text-xs">
          <span className="text-ink underline decoration-accent decoration-2 underline-offset-4">
            発言の原文（国会会議録）
          </span>{" "}
          <span className="text-accent-deep">↗</span>
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <span className="bg-ink px-5 py-2.5 text-sm font-bold text-paper">地域から探す</span>
        <span className="border border-ink px-5 py-2.5 text-sm font-bold">議員を見る</span>
      </div>
    </div>
  );
}

export default function DesignPreviewPage() {
  return (
    <div className={`${archivo.variable} ${anton.variable} ${grotesk.variable} ${mono.variable}`}>
      <div className="mb-8">
        <h1 className="font-display text-2xl">デザイン方向 比較（3案）</h1>
        <p className="mt-2 text-sm text-muted">
          同じ内容を 3 つのトーンで描画。スクロールで見比べて、好みの案を選んでください。
          全案に共通：写真に頼らないタイポ・ファースト／カード廃止・罫線と余白／差し色は1色だけ／番号・インデックス／数字は等幅。
        </p>
      </div>

      <div className="space-y-12">
        {VARIANTS.map((v) => (
          <section key={v.id} className="overflow-hidden border-2 border-ink">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink bg-ink px-5 py-3 text-paper">
              <span className="font-display text-lg">{v.name}</span>
              <span className="text-xs text-paper/70">{v.note}</span>
            </div>
            <div style={v.vars}>
              <Specimen block={v.block} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
