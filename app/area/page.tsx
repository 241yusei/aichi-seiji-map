import type { Metadata } from "next";
import { AreaExplorer } from "@/components/AreaExplorer";

export const metadata: Metadata = {
  title: "地域から探す（あなたの代表者）",
  description:
    "郵便番号または名古屋市の区から、あなたの地域の衆院・参院・愛知県議会・名古屋市会の代表者と首長をまとめて確認できます。",
  alternates: { canonical: "/area/" },
};

export default function AreaPage() {
  return (
    <div>
      <header className="max-w-4xl pb-10 pt-4 sm:pb-14 sm:pt-8">
        <p className="text-sm font-medium tracking-wider text-accent">わたしのまちと、政治</p>
        <h1 className="font-display mt-5 text-[clamp(2.3rem,6vw,4.5rem)] leading-[1.15]">
          あなたのまちの、<br />代表者を知ろう。
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          郵便番号やお住まいの区から、国・県・市の代表者と首長をひとつの画面に。
          地域にかかわる争点も、あわせて確認できます。
        </p>
      </header>
      <AreaExplorer />
    </div>
  );
}
