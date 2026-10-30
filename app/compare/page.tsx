import type { Metadata } from "next";
import Link from "next/link";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "議員をくらべる",
  description:
    "愛知の議員2人を選んで、当選回数・主な役職・発言数・採決・政治資金を並べて比較。発言本文・採決・政治資金の個人記録は国会議員の収録分が中心。未収録と活動なしを区別し、出典で確認できます。",
  alternates: { canonical: "/compare/" },
};

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium tracking-wider text-accent">くらべる</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          議員をくらべる
        </h1>
        <p className="measure mt-3 text-muted">
          2人の議員を選ぶと、当選回数・主な役職・発言数・採決・政治資金を並べて見られます。
          優劣をつけるためではなく、事実を並べて確かめるための機能です。中立・投票誘導はしません。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">発言本文・採決・政治資金の個人記録は国会議員の収録分が中心で、県議会・市町村議会は本サイトでは未収録です。未収録は活動なしを意味しません。役職・所属の確認日と出典は各議員ページで確認できます。当選回数・略歴は今回の名簿照合とは別の収録項目です。</p>
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
