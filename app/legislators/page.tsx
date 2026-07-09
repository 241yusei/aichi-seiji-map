import type { Metadata } from "next";
import { getLegislators } from "@/lib/data";
import { LegislatorFilter } from "@/components/LegislatorFilter";
import { ZipSearch } from "@/components/ZipSearch";

export const metadata: Metadata = {
  title: "議員一覧",
  description:
    "国会（愛知選出）・愛知県議会・愛知の全54市町村の議員一覧。層・会派・地域で絞り込めます。",
  alternates: { canonical: "/legislators/" },
};

export default function LegislatorsPage() {
  const legislators = getLegislators().sort((a, b) => a.kana.localeCompare(b.kana, "ja"));

  return (
    <div>
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Legislators</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">議員一覧</h1>
        <p className="measure mt-3 text-muted">
          国会（愛知選出）・愛知県議会・愛知の全54市町村。層・会派・地域で絞り込めます。
        </p>
        <p className="mt-2 text-xs text-faint">
          愛知県議会は定数102に対し本サイト収録97名（基準日時点・欠員等）。名簿は各議会の公式ページに基づきます。
        </p>
      </header>

      <div className="mt-6 border border-line bg-surface p-4">
        <p className="eyebrow mb-2 text-ink">郵便番号で、あなたの地域の代表者だけを見る</p>
        <ZipSearch />
      </div>

      <div className="mt-6">
        {legislators.length === 0 ? (
          <p className="text-sm text-muted">議員データは準備中です。</p>
        ) : (
          <LegislatorFilter legislators={legislators} />
        )}
      </div>
    </div>
  );
}
