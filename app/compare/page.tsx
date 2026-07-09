import type { Metadata } from "next";
import Link from "next/link";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "議員をくらべる",
  description:
    "愛知の議員2人を選んで、当選回数・主な役職・発言数・採決・政治資金を並べて比較。すべて一次ソース付きの収録データから。中立・投票誘導なし。",
  alternates: { canonical: "/compare/" },
};

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Compare</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          議員をくらべる
        </h1>
        <p className="measure mt-3 text-muted">
          2人の議員を選ぶと、当選回数・主な役職・発言数・採決・政治資金を並べて見られます。
          優劣をつけるためではなく、事実を並べて確かめるための機能です。中立・投票誘導はしません。
        </p>
      </header>

      <CompareClient />

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/legislators" className="link-ink">
          ← 議員一覧
        </Link>
        <Link href="/search" className="hover:text-accent-deep">
          検索
        </Link>
        <Link href="/area" className="hover:text-accent-deep">
          郵便番号で探す
        </Link>
      </nav>
    </div>
  );
}
