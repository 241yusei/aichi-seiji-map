import type { Metadata } from "next";
import { getLegislators } from "@/lib/data";
import { LegislatorFilter } from "@/components/LegislatorFilter";

export const metadata: Metadata = {
  title: "議員一覧",
  description:
    "国会（愛知選出）・愛知県議会・名古屋市会の議員一覧。level・会派・地域で絞り込めます。",
};

export default function LegislatorsPage() {
  const legislators = getLegislators().sort((a, b) => a.kana.localeCompare(b.kana, "ja"));

  return (
    <div>
      <h1 className="text-xl font-bold">議員一覧</h1>
      <p className="mt-1 text-sm text-muted">
        国会（愛知選出）・愛知県議会・名古屋市会。level・会派・地域で絞り込めます。
      </p>
      <div className="mt-5">
        {legislators.length === 0 ? (
          <p className="text-sm text-muted">議員データは準備中です。</p>
        ) : (
          <LegislatorFilter legislators={legislators} />
        )}
      </div>
    </div>
  );
}
