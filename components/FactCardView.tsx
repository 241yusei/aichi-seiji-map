import type { FactCard } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SourceLink } from "./SourceLink";
import { ShareButton } from "./ShareButton";

const TYPE_LABEL: Record<FactCard["cardType"], string> = {
  gap: "ギャップ",
  contradiction: "矛盾",
  comparison: "対比",
};

// 事実カードの種類チップ。色で政党を連想させない（罫線＋モノラベル）。
export function FactCardType({ type }: { type: FactCard["cardType"] }) {
  return (
    <span className="eyebrow inline-flex items-center self-start border border-ink px-1.5 py-0.5 text-ink">
      {TYPE_LABEL[type]}
    </span>
  );
}

// 事実カードの本体表示。評価語を使わず「記録」を見せ、注記と一次ソースを必ず併記する。
export function FactCardView({ card }: { card: FactCard }) {
  return (
    <article className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <div className="flex items-center gap-3">
          <FactCardType type={card.cardType} />
          <time dateTime={card.publishedAt} className="eyebrow tnum text-faint">
            {formatDate(card.publishedAt)}
          </time>
        </div>
        <h1 className="font-display mt-3 text-[clamp(1.9rem,5.5vw,3.25rem)] leading-[1.08]">
          {card.title}
        </h1>
        <p className="measure mt-4 text-base text-muted sm:text-lg">{card.hook}</p>
      </header>

      {card.points && card.points.length > 0 && (
        <div className="border border-line bg-surface">
          <table className="w-full text-sm">
            <tbody>
              {card.points.map((p, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-muted">{p.label}</td>
                  <td className="num-display tnum whitespace-nowrap px-4 py-3 text-right text-lg">
                    {p.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="measure space-y-4">
        <p className="leading-relaxed">{card.body}</p>
      </div>

      {/* 中立注記（誤解回避）。左の朱罫線＋微塗りで「補助・前提」を示す。 */}
      <div className="border-l-2 border-accent bg-subtle px-4 py-3">
        <p className="eyebrow text-accent-deep">読み方の注意</p>
        <p className="measure mt-1 text-sm text-muted">{card.caveat}</p>
      </div>

      <div className="border-t border-line pt-5">
        <p className="eyebrow text-faint">一次ソース</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {card.sources.map((s, i) => (
            <li key={i}>
              <SourceLink href={s.url}>{s.label}</SourceLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line pt-5">
        <ShareButton title={card.title} />
      </div>
    </article>
  );
}
