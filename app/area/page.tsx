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
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Area</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">地域から探す</h1>
        <p className="measure mt-3 text-muted">
          郵便番号、または名古屋市の区から、あなたの地域の代表者（国・県・市）と首長、効く争点をまとめて表示します。
        </p>
      </header>
      <div className="mt-6">
        <AreaExplorer />
      </div>
    </div>
  );
}
