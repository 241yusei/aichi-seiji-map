import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";

export const metadata: Metadata = {
  title: "検索（議員・首長・争点・事実カード）",
  description:
    "愛知の国会議員・県議・市町村議・首長、争点、事実カードを横断検索。氏名・地域・政党・キーワードで探せます。",
  alternates: { canonical: "/search/" },
};

export default function SearchPage() {
  return (
    <div>
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Search</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">検索</h1>
        <p className="measure mt-3 text-muted">
          議員（国・県・市町村）・首長・争点・事実カードを横断して検索します。氏名・地域・政党・キーワードでどうぞ。
        </p>
      </header>

      <div className="mt-6">
        <SearchClient />
      </div>
    </div>
  );
}
