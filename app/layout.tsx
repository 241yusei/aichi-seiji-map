import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Anton, IBM_Plex_Sans_JP, Space_Mono } from "next/font/google";
import { getActiveElectionWindow } from "@/lib/election-window";
import { ElectionPeriodBanner } from "@/components/ElectionPeriodBanner";
import { BottomNav } from "@/components/BottomNav";
import { LAST_UPDATED, SITE_X } from "@/lib/site-meta";
import "./globals.css";

// 数字・章番号・特大カウンタ専用（“見せ場”だけ。見出し本体には使わない＝声を下げる）。
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});
// 本文・見出しの主役（和文＝“見える声”。Plex JP でエディトリアルな識別性／和欧混植も同ファミリで）。
const plexJP = IBM_Plex_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-plex",
  display: "swap",
  preload: false,
});
// メタ・ラベル・番号（モノスペース＝編集的）。
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-spacemono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "政治のトリセツ あいち・なごや｜知ってから、選ぶ。",
    template: "%s｜政治のトリセツ あいち・なごや",
  },
  description:
    "政治をはじめて知る人のための、愛知・名古屋の政治の入口。国会(愛知選出)・愛知県議会・全54市町村の代表者の発言・採決・政治資金を、やさしい解説と一次ソースで。中立・非投票誘導。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp"),
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

// ヘッダーは主要6項目に絞る（残りはフッターから到達可）。モバイルの過密を避ける。
const NAV = [
  { href: "/start", label: "はじめに" },
  { href: "/learn", label: "まなぶ" },
  { href: "/legislators", label: "議員" },
  { href: "/issues", label: "争点" },
  { href: "/facts", label: "事実カード" },
  { href: "/municipalities", label: "地域" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const election = getActiveElectionWindow();
  return (
    <html
      lang="ja"
      className={`${anton.variable} ${plexJP.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-paper"
        >
          本文へスキップ
        </a>
        {election && <ElectionPeriodBanner name={election.name} />}

        <header className="border-b-2 border-ink bg-paper">
          <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-5 py-4">
            <Link href="/" className="group inline-flex items-baseline gap-2">
              <span className="font-display whitespace-nowrap text-xl tracking-tight sm:text-2xl">
                政治のトリセツ
              </span>
              <span className="eyebrow hidden text-faint sm:inline">あいち・なごや</span>
            </Link>
            <nav className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm text-muted">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="transition-colors hover:text-accent-deep"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
          {children}
        </main>

        <footer className="mt-20 border-t-2 border-ink bg-paper pb-20 sm:pb-0">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <p className="font-display text-lg tracking-tight">政治のトリセツ あいち・なごや</p>
            <p className="eyebrow mt-1 text-faint">知ってから、選ぶ。— 愛知・名古屋の政治を一次ソースで</p>
            {/* 中立宣言（常設）。中立を「掲げる」だけでなく仕組みで示す。 */}
            <ul className="measure mt-3 space-y-1 text-sm text-muted">
              <li>・特定の政党・候補者・団体と関係を持ちません。</li>
              <li>・投票／不投票を呼びかけません。比較はすべて事実に基づきます。</li>
              <li>・全データに一次ソースを併記。AI要約には必ず元発言リンクを付けます。</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <Link href="/about" className="link-ink">
                中立性・運営・財源
              </Link>
              <Link href="/start" className="hover:text-accent-deep">
                はじめに
              </Link>
              <Link href="/learn" className="hover:text-accent-deep">
                まなぶ
              </Link>
              <Link href="/vote-guide" className="hover:text-accent-deep">
                投票ガイド
              </Link>
              <Link href="/facts" className="hover:text-accent-deep">
                事実カード
              </Link>
              <Link href="/legislators" className="hover:text-accent-deep">
                議員一覧
              </Link>
              <Link href="/executives" className="hover:text-accent-deep">
                首長
              </Link>
              <Link href="/municipalities" className="hover:text-accent-deep">
                市町村
              </Link>
              <Link href="/issues" className="hover:text-accent-deep">
                争点
              </Link>
              <Link href="/decisions" className="hover:text-accent-deep">
                議会の議決
              </Link>
              <Link href="/search" className="hover:text-accent-deep">
                検索
              </Link>
              <Link href="/support" className="hover:text-accent-deep">
                支援・寄付
              </Link>
            </div>
            <p className="mt-5 text-xs text-faint">
              更新を受け取る：
              <a href="/feed.xml" className="link-ink">
                RSS
              </a>
              {SITE_X && (
                <>
                  {" ・ "}
                  <a href={SITE_X} target="_blank" rel="noopener noreferrer" className="link-ink">
                    公式X
                  </a>
                </>
              )}
            </p>
            <p className="mt-2 text-xs text-faint">
              データ最終更新：{LAST_UPDATED}（手動更新のため、改選などで内容が変わることがあります）。
              訂正・更新は{" "}
              <Link href="/corrections" className="link-ink">
                訂正・更新ログ
              </Link>
              。
            </p>
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
