import type { Metadata } from "next";
import Link from "next/link";
import { getFactCards } from "@/lib/data";
import { FactCardType } from "@/components/FactCardView";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "事実カード｜記録から見える愛知政治のギャップ",
  description:
    "政治資金・国会発言・採決の「記録」から、愛知政治の意外なギャップや対比を一次ソース付きで。評価はせず、事実だけを並べます。",
};

export default function FactsPage() {
  const cards = getFactCards();

  return (
    <div>
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Fact Cards</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">事実カード</h1>
        <p className="measure mt-3 text-muted">
          政治資金・国会発言・採決の「記録」から見える、愛知政治の意外なギャップや対比。
          すべて一次ソース付きで、評価はせず事実だけを並べます。
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="mt-6 text-sm text-muted">事実カードは準備中です。</p>
      ) : (
        <div className="mt-4">
          {cards.map((card, i) => (
            <Link
              key={card.id}
              href={`/facts/${card.id}/`}
              className="reveal group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-6 transition-colors last:border-b hover:bg-subtle"
            >
              <span className="font-display tnum text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FactCardType type={card.cardType} />
                  {i === 0 && (
                    <span className="eyebrow bg-accent px-1.5 py-0.5 text-on-accent">新着</span>
                  )}
                  <span className="tnum text-xs text-faint">{formatDate(card.publishedAt)}</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl">{card.title}</h2>
                <p className="measure mt-1 line-clamp-2 text-sm text-muted">{card.hook}</p>
              </div>
              <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      <p className="measure mt-8 text-xs text-faint">
        事実カードは、特定の政党・候補者・議員への評価や投票誘導を目的としません。
        題材は争点を起点に複数の会派を横断して選び、必ず一次ソースを併記します。
      </p>
    </div>
  );
}
