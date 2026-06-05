import type { Metadata } from "next";
import { getLegislators } from "@/lib/data";
import { NAGOYA_WARDS, type LegBrief, type WardData } from "@/lib/area";
import { AreaExplorer } from "@/components/AreaExplorer";
import type { Legislator } from "@/lib/types";

export const metadata: Metadata = {
  title: "地域から探す（あなたの代表者）",
  description:
    "郵便番号または名古屋市の区から、あなたの地域の衆院・参院・愛知県議会・名古屋市会の代表者をまとめて確認できます。",
};

function brief(l: Legislator): LegBrief {
  return { id: l.id, name: l.name, district: l.district, party: l.party };
}

export default function AreaPage() {
  const legs = getLegislators();
  const national = legs.filter((l) => l.level === "national");
  const pref = legs.filter((l) => l.level === "prefectural");
  const muni = legs.filter((l) => l.level === "municipal");
  const sangiin = national.filter((l) => l.district === "愛知県選挙区").map(brief);

  const wardData: WardData[] = NAGOYA_WARDS.map((w) => ({
    ward: w.ward,
    shugiin: national.filter((l) => l.district === w.shugiin).map(brief),
    sangiin,
    kengikai: pref.filter((l) => l.district === w.prefDistrict).map(brief),
    shikai: muni.filter((l) => l.district === w.prefDistrict).map(brief),
  }));

  return (
    <div>
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Area</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">地域から探す</h1>
        <p className="measure mt-3 text-muted">
          郵便番号、または名古屋市の区から、あなたの地域の代表者（国・県・市）をまとめて表示します。
          ※ 現在は名古屋市内に対応。対象範囲は順次拡大します。
        </p>
      </header>
      <div className="mt-6">
        <AreaExplorer wardData={wardData} />
      </div>
    </div>
  );
}
