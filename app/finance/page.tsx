import type { Metadata } from "next";
import Link from "next/link";
import { getCouncilDecisions, getFinances } from "@/lib/data";
import { DataBar } from "@/components/DataBar";
import { SourceLink } from "@/components/SourceLink";
import { formatOkuYen } from "@/lib/format";
import { LAST_UPDATED } from "@/lib/site-meta";
import type { FinanceItem, FinanceYear, GovernmentFinance } from "@/lib/types";

export const metadata: Metadata = {
  title: "財政：愛知県・名古屋市の予算（歳入・歳出の内訳）",
  description:
    "愛知県（3兆2,224億円）と名古屋市（1兆6,961億円）の令和8年度一般会計当初予算を、歳入・歳出・税収の内訳まで公式資料に基づいて可視化。前年度（令和7年度）との比較、法人二税の割合、基金取崩し、市民税減税の減収額も一次ソース付きで。",
  alternates: { canonical: "/finance/" },
};

// 自治体ごとのチャート色（三層カラーを踏襲：県＝媚茶金・市＝accent）。
const CHART_COLOR: Record<string, string> = {
  "aichi-pref": "var(--color-chart-pref)",
  "nagoya-city": "var(--color-chart-municipal)",
};

/** 構成比：公式記載値があればそれを、なければ予算額から算出する。 */
function sharePct(item: FinanceItem, total: number): string {
  const pct = item.sharePct ?? (total > 0 ? (item.amount / total) * 100 : 0);
  return pct.toFixed(1);
}

/** 前年度比の増減率（％・符号付き）。 */
function deltaPct(current: number, previous: number): string {
  if (previous <= 0) return "—";
  const d = ((current - previous) / previous) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

function BreakdownBars({
  title,
  items,
  total,
  color,
}: {
  title: string;
  items: FinanceItem[];
  total: number;
  color: string;
}) {
  const max = items.reduce((m, i) => Math.max(m, i.amount), 0);
  return (
    <div>
      <h3 className="eyebrow text-faint">{title}</h3>
      <div className="mt-2">
        {items.map((i) => (
          <DataBar
            key={i.label}
            label={i.label}
            value={i.amount}
            max={max}
            valueLabel={`${formatOkuYen(i.amount)}・${sharePct(i, total)}%`}
            color={color}
          />
        ))}
      </div>
    </div>
  );
}

/** 税収内訳の2年比較表（令和7→8年度）。 */
function TaxCompareTable({ latest, prev }: { latest: FinanceYear; prev: FinanceYear }) {
  if (!latest.taxes || !prev.taxes) return null;
  const prevMap = new Map(prev.taxes.map((t) => [t.label, t.amount]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-sm">
        <thead>
          <tr className="border-b-2 border-ink text-left">
            <th className="py-2 pr-3 font-bold">税目</th>
            <th className="py-2 pr-3 text-right font-bold">{latest.era}</th>
            <th className="py-2 pr-3 text-right font-bold">{prev.era}</th>
            <th className="py-2 text-right font-bold">増減率</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {latest.taxes.map((t) => {
            const prevAmount = prevMap.get(t.label);
            return (
              <tr key={t.label}>
                <td className="py-2 pr-3">{t.label}</td>
                <td className="tnum py-2 pr-3 text-right">{formatOkuYen(t.amount)}</td>
                <td className="tnum py-2 pr-3 text-right">
                  {prevAmount !== undefined ? formatOkuYen(prevAmount) : "—"}
                </td>
                <td className="tnum py-2 text-right">
                  {prevAmount !== undefined ? deltaPct(t.amount, prevAmount) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GovernmentSection({ gov }: { gov: GovernmentFinance }) {
  const color = CHART_COLOR[gov.id] ?? "var(--color-ink)";
  const years = [...gov.years].sort((a, b) => b.fiscalYear - a.fiscalYear);
  const latest = years[0];
  const prev = years[1];
  if (!latest) return null;

  const decisions = getCouncilDecisions().filter((d) =>
    gov.relatedDecisionIds?.includes(d.id),
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-[3px] border-ink pb-2">
        <h2 className="font-display text-2xl sm:text-3xl">{gov.name}の一般会計（当初予算）</h2>
        <span className="tnum text-sm text-muted">
          {latest.era} {formatOkuYen(latest.total)}
          {prev && `（前年度比 ${deltaPct(latest.total, prev.total)}）`}
        </span>
      </div>

      {/* 総額の経年比較（令和7→8年度） */}
      {prev && (
        <div>
          <h3 className="eyebrow text-faint">予算総額の推移</h3>
          <div className="mt-2">
            {years
              .slice()
              .reverse()
              .map((y) => (
                <DataBar
                  key={y.fiscalYear}
                  label={y.era}
                  value={y.total}
                  max={latest.total}
                  valueLabel={formatOkuYen(y.total)}
                  color={color}
                />
              ))}
          </div>
        </div>
      )}

      {/* 数値で見るポイント（法人二税・基金取崩し・減税の減収額など） */}
      {gov.keyFacts && gov.keyFacts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {gov.keyFacts.map((k) => (
            <div key={k.label} className="card-soft border border-line p-4">
              <p className="eyebrow text-faint">{k.label}</p>
              <p className="tnum mt-1 text-xl font-bold text-ink">{k.value}</p>
              {k.note && <p className="measure mt-2 text-xs text-muted">{k.note}</p>}
              <p className="mt-2 text-xs">
                <SourceLink href={k.sourceUrl}>出典（公式資料）</SourceLink>
              </p>
            </div>
          ))}
        </div>
      )}

      <BreakdownBars
        title={`歳入の内訳（${latest.era}）`}
        items={latest.revenues}
        total={latest.total}
        color={color}
      />

      <BreakdownBars
        title={`歳出の内訳（${latest.era}）`}
        items={latest.expenditures}
        total={latest.total}
        color={color}
      />

      {latest.taxes && prev?.taxes && (
        <div>
          <h3 className="eyebrow text-faint">
            {gov.level === "prefectural" ? "県税" : "市税"}の内訳（令和7→8年度）
          </h3>
          <div className="mt-2">
            <TaxCompareTable latest={latest} prev={prev} />
          </div>
        </div>
      )}

      {/* この予算はどう議決されたか（既存の議決データへの接続） */}
      {decisions.length > 0 && (
        <div className="zone-calm card-soft p-5">
          <p className="eyebrow text-accent-deep">この予算はどう議決されたか</p>
          <ul className="mt-2 space-y-2 text-sm">
            {decisions.map((d) => (
              <li key={d.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-bold text-ink">{d.billTitle}</span>
                <span className="text-muted">
                  {d.council}・{d.session}
                </span>
                <span className="inline-block whitespace-nowrap border border-ink px-2 py-0.5 text-xs font-bold text-ink">
                  {d.result}
                </span>
                <SourceLink href={d.sourceUrl}>出典</SourceLink>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            <Link href="/decisions/" className="link-ink">
              会派ごとの賛否は「議会の議決」で見る →
            </Link>
          </p>
        </div>
      )}

      {/* 注記・出典 */}
      <div className="border-t border-line pt-4">
        {latest.notes && latest.notes.length > 0 && (
          <ul className="measure space-y-1 text-xs text-faint">
            {latest.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <p className="eyebrow mt-3 text-faint">出典（一次ソース）</p>
        <ul className="mt-1 space-y-1 text-sm">
          {latest.sources.map((s) => (
            <li key={s.url}>
              <SourceLink href={s.url}>{s.label}</SourceLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function FinancePage() {
  const finances = getFinances();

  return (
    <div className="space-y-12">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Finance</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          財政：県と名古屋市の予算
        </h1>
        <p className="measure mt-3 text-muted">
          愛知県と名古屋市の一般会計当初予算を、歳入・歳出・税収の内訳まで公式資料に基づいて示します。
          お金の集め方（歳入）と使い方（歳出）は、議会が議決して決まります。
        </p>
        <p className="mt-2 text-xs text-faint">情報の基準日：{LAST_UPDATED}</p>
      </header>

      {/* 読み方の注意（中立・単位・算出方法の明示） */}
      <div className="zone-calm card-soft p-5">
        <p className="eyebrow text-accent-deep">読み方の注意</p>
        <ul className="measure mt-2 space-y-1.5 text-sm text-muted">
          <li>
            金額は<span className="font-bold text-ink">当初予算</span>
            ベースです。年度途中の補正予算で実際の予算額は変わります（決算とも一致しません）。
          </li>
          <li>
            原資料の単位は千円です。表示は億円に丸めています（例：3,222,441,000千円 →
            3兆2,224億円）。
          </li>
          <li>
            構成比は、愛知県は公式資料の記載値、名古屋市は公式資料に記載がないため予算額から算出した値です。
          </li>
          <li>
            予算の大小や増減は良し悪しを示しません。本サイトは評価をせず、記録と出典のみを示します。
          </li>
        </ul>
      </div>

      {finances.length === 0 ? (
        <p className="text-sm text-muted">財政データは準備中です。</p>
      ) : (
        finances.map((gov) => <GovernmentSection key={gov.id} gov={gov} />)
      )}

      {/* 構造のメモ（数値はすべて上のセクション・出典に基づく） */}
      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">県税の約3分の1は「法人二税」</h2>
        <p className="measure mt-2 text-sm text-ink">
          法人事業税・法人県民税（あわせて「法人二税」）は、企業の所得などに応じて課される税です。
          愛知県の令和8年度当初予算では法人二税が4,314億円で、県税1兆3,243億円の32.6%を占めます。
          企業業績が変動すると税収も変動しやすい構造であることが、公式資料の数値から読み取れます。
        </p>
      </section>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/decisions/" className="link-ink">
          議会の議決
        </Link>
        <Link href="/facts/comparison-vote-budget-2026/" className="link-ink">
          国の令和8年度予算・衆院の賛否
        </Link>
        <Link href="/facts/comparison-vote-budget-sangiin-2026/" className="link-ink">
          国の令和8年度予算・参院の賛否
        </Link>
        <Link href="/parties/" className="link-ink">
          政党・会派の勢力図
        </Link>
      </nav>
    </div>
  );
}
