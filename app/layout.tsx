import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getActiveElectionWindow } from "@/lib/election-window";
import { ElectionPeriodBanner } from "@/components/ElectionPeriodBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "愛知政治マップ｜国・県・市の代表者を一次ソースで",
    template: "%s｜愛知政治マップ",
  },
  description:
    "愛知県の有権者が、国会(愛知選出)・愛知県議会・名古屋市会の代表者の発言・採決・政治資金を、一次ソース付きで横断的に確認できる中立的な情報サイト。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const election = getActiveElectionWindow();
  return (
    <html lang="ja">
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          本文へスキップ
        </a>
        {election && <ElectionPeriodBanner name={election.name} />}
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              愛知政治マップ
            </Link>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/legislators" className="hover:text-ink">
                議員
              </Link>
              <Link href="/issues" className="hover:text-ink">
                争点
              </Link>
              <Link href="/about" className="hover:text-ink">
                このサイトについて
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>

        <footer className="mt-16 border-t border-line bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-muted">
            <p>
              本サイトは特定の政党・候補者への投票／不投票を呼びかけるものではありません。
              すべてのデータは公的な一次ソースに基づき、出典リンクを併記しています。
            </p>
            <p className="mt-2">
              <Link href="/about" className="underline">
                中立性・データの出典・免責について
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
