import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getActiveElectionWindows, getElectionWindows } from "@/lib/election-window";
import { ElectionPeriodBanner } from "@/components/ElectionPeriodBanner";
import { BottomNav } from "@/components/BottomNav";
import { SiteHeader } from "@/components/SiteHeader";
import {
  LAST_UPDATED,
  SITE_URL,
  SITE_X,
  SITE_X_HANDLE,
  SITE_THREADS,
  SITE_INSTAGRAM,
} from "@/lib/site-meta";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "政治のトリセツ あいち・なごや｜知ってから、選ぶ。",
    template: "%s｜政治のトリセツ あいち・なごや",
  },
  description:
    "政治をはじめて知る人のための、愛知・名古屋の政治の入口。国会(愛知選出)・愛知県議会・全54市町村の代表者の発言・採決・政治資金を、やさしい解説と一次ソースで。中立・非投票誘導。",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_X_HANDLE,
  },
  verification: {
    google: "Z-83tdi-pSo_e25a34c5t13JHOYtRdhBNHAivPjonZU",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // 選挙期間の判定は閲覧時にブラウザでも行う（ビルド日だけで固定しない）。
  const electionWindows = getElectionWindows();
  const activeAtBuild = getActiveElectionWindows();
  return (
    <html lang="ja">
      <body className="min-h-dvh">
        {/* サイト全体の構造化データ（検索結果でのサイト名表示用） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "政治のトリセツ あいち・なごや",
              alternateName: "愛知政治マップ",
              url: SITE_URL,
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-sm focus:text-paper"
        >
          本文へスキップ
        </a>
        <ElectionPeriodBanner windows={electionWindows} initial={activeAtBuild} />

        <SiteHeader />

        <main id="main" className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12">
          {children}
        </main>

        <footer className="site-footer mt-24 rounded-t-[32px] bg-sand">
          <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
            <p className="font-display text-2xl tracking-tight">政治のトリセツ あいち・なごや</p>
            <p className="eyebrow mt-1 text-faint">知ってから、選ぶ。— 愛知・名古屋の政治を一次ソースで</p>
            {/* 中立宣言（常設）。中立を「掲げる」だけでなく仕組みで示す。 */}
            <ul className="measure mt-3 space-y-1 text-sm text-muted">
              <li>・特定の政党・候補者・団体と関係を持ちません。</li>
              <li>・投票／不投票を呼びかけません。比較はすべて事実に基づきます。</li>
              <li>・全データに一次ソースを併記。AI要約には必ず元発言リンクを付けます。</li>
            </ul>
            {/* フッターは4カテゴリに見出し付きでグルーピング（旧・17リンク羅列を解消）。 */}
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 text-sm text-muted sm:grid-cols-4">
              <div>
                <p className="eyebrow text-faint">はじめる</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link href="/start" className="hover:text-accent-deep">
                    はじめに
                  </Link>
                  <Link href="/learn" className="hover:text-accent-deep">
                    まなぶ
                  </Link>
                  <Link href="/vote-guide" className="hover:text-accent-deep">
                    投票ガイド
                  </Link>
                  <Link href="/for-education" className="hover:text-accent-deep">
                    教育でつかう
                  </Link>
                </div>
              </div>
              <div>
                <p className="eyebrow text-faint">調べる</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link href="/area" className="hover:text-accent-deep">
                    地域から探す
                  </Link>
                  <Link href="/legislators" className="hover:text-accent-deep">
                    議員一覧
                  </Link>
                  <Link href="/compare" className="hover:text-accent-deep">
                    くらべる
                  </Link>
                  <Link href="/executives" className="hover:text-accent-deep">
                    首長
                  </Link>
                  <Link href="/municipalities" className="hover:text-accent-deep">
                    市町村
                  </Link>
                  <Link href="/parties" className="hover:text-accent-deep">
                    政党・会派
                  </Link>
                </div>
              </div>
              <div>
                <p className="eyebrow text-faint">読む</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link href="/facts" className="hover:text-accent-deep">
                    事実カード
                  </Link>
                  <Link href="/issues" className="hover:text-accent-deep">
                    争点
                  </Link>
                  <Link href="/themes" className="hover:text-accent-deep">
                    テーマから探す
                  </Link>
                  <Link href="/decisions" className="hover:text-accent-deep">
                    議会の議決
                  </Link>
                  <Link href="/finance" className="hover:text-accent-deep">
                    財政（予算）
                  </Link>
                  <Link href="/elections" className="hover:text-accent-deep">
                    選挙カレンダー
                  </Link>
                  <Link href="/history" className="hover:text-accent-deep">
                    県政・市政の歴史
                  </Link>
                </div>
              </div>
              <div>
                <p className="eyebrow text-faint">サイトについて</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <Link href="/about" className="link-ink">
                    中立性・運営・財源
                  </Link>
                  <Link href="/methodology" className="hover:text-accent-deep">
                    集計方法の開示
                  </Link>
                  <Link href="/search" className="hover:text-accent-deep">
                    検索
                  </Link>
                  <Link href="/support" className="hover:text-accent-deep">
                    支援・寄付
                  </Link>
                </div>
              </div>
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
                    X
                  </a>
                </>
              )}
              {SITE_THREADS && (
                <>
                  {" ・ "}
                  <a
                    href={SITE_THREADS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-ink"
                  >
                    Threads
                  </a>
                </>
              )}
              {SITE_INSTAGRAM && (
                <>
                  {" ・ "}
                  <a
                    href={SITE_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-ink"
                  >
                    Instagram
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
