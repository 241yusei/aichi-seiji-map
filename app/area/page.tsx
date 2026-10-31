import type { Metadata } from "next";
import { AreaExplorer } from "@/components/AreaExplorer";

export const metadata: Metadata = {
  title: "愛知の議員・代表者を地域から探す｜名古屋市は国・県・市の入口",
  description:
    "愛知54市町村の議員・首長への入口。名古屋市16区は国会・愛知県議会・名古屋市会の議員をまとめて確認できます。郵便番号検索は名古屋市内のみ。名簿の確認状況と公式出典をたどれます。",
  alternates: { canonical: "/area/" },
};

export default function AreaPage() {
  return (
    <div>
      <header className="max-w-4xl pb-6 sm:pb-8">
        <p className="text-sm font-medium tracking-wider text-accent">わたしのまちと、政治</p>
        <h1 className="font-display mt-3 text-[clamp(1.8rem,5vw,3.5rem)] leading-tight">愛知の地域から議員・代表者を探す</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">愛知54市町村から、お住まいの地域を選んでください。名古屋市は区から国・県・市の議員と首長へ、ほかの市町村は首長・議員一覧へ進めます。郵便番号検索は名古屋市内のみです。</p>
      </header>
      <AreaExplorer />
    </div>
  );
}
