import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Archivo, Inter, Noto_Sans_JP } from "next/font/google";
import { getActiveElectionWindow } from "@/lib/election-window";
import { ElectionPeriodBanner } from "@/components/ElectionPeriodBanner";
import "./globals.css";

// 大胆グロテスクのディスプレイ書体（見出し・ワードマーク）。
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});
// UI・本文の欧文/数字（Helvetica 的な中立グロテスク）。
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// 和文（見出しは 900 で塊感）。
const notoJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "愛知政治マップ｜国・県・市の代表者を一次ソースで",
    template: "%s｜愛知政治マップ",
  },
  description:
    "愛知県の有権者が、国会(愛知選出)・愛知県議会・全54市町村の代表者の発言・採決・政治資金を、一次ソース付きで横断的に確認できる中立的な情報サイト。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp"),
};

const NAV = [
  { href: "/legislators", label: "議員" },
  { href: "/issues", label: "争点" },
  { href: "/area", label: "郵便番号で探す" },
  { href: "/about", label: "このサイトについて" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  const election = getActiveElectionWindow();
  return (
    <html lang="ja" className={`${archivo.variable} ${inter.variable} ${notoJP.variable}`}>
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
              <span className="font-display text-xl tracking-tight sm:text-2xl">愛知政治マップ</span>
              <span className="eyebrow hidden text-faint sm:inline">Aichi Politics Map</span>
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

        <footer className="mt-20 border-t-2 border-ink bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <p className="font-display text-lg tracking-tight">愛知政治マップ</p>
            <p className="measure mt-3 text-sm text-muted">
              特定の政党・候補者への投票／不投票を呼びかけるものではありません。
              すべてのデータは公的な一次ソースに基づき、出典リンクを併記しています。
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <Link href="/about" className="link-ink">
                中立性・出典・免責
              </Link>
              <Link href="/legislators" className="hover:text-accent-deep">
                議員一覧
              </Link>
              <Link href="/issues" className="hover:text-accent-deep">
                争点
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
