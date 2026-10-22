import type { Metadata } from "next";
import { AreaExplorer } from "@/components/AreaExplorer";

export const metadata: Metadata = {
  title: "地域から探す（あなたの代表者）",
  description:
    "愛知54市町村から首長・議員を探せます。名古屋市は区や郵便番号から国・県・市の代表者をまとめて確認できます。地域はログインなしでこの端末に保存できます。",
  alternates: { canonical: "/area/" },
};

export default function AreaPage() {
  return (
    <div>
      <header className="max-w-4xl pb-6 sm:pb-8">
        <p className="text-sm font-medium tracking-wider text-accent">わたしのまちと、政治</p>
        <h1 className="font-display mt-3 text-[clamp(1.8rem,5vw,3.5rem)] leading-tight">あなたのまちの代表者</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">お住まいの市町村・区を選んでください。名古屋市は郵便番号でも探せます。</p>
      </header>
      <AreaExplorer />
    </div>
  );
}
