import type { Metadata } from "next";
import Link from "next/link";
import { getHistory } from "@/lib/data";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { TurnoutChart } from "@/components/TurnoutChart";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED, SITE_URL } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "愛知県政・名古屋市政の歴史｜歴代知事・市長と投票率の推移",
  description:
    "1947年の公選制スタートから現在まで。歴代の愛知県知事・名古屋市長の系譜、知事選・名古屋市長選の投票率の推移、県政・市政の画期となった出来事を、一次ソース付きで中立にまとめた年表アーカイブ。",
  alternates: { canonical: "/history/" },
};

// 公選制の開始年（1947年・第1回統一地方選挙）。系譜・投票率ともここを起点にする。
const START_YEAR = 1947;

// イベント日付は YYYY / YYYY-MM / YYYY-MM-DD の3形式（判明している粒度のまま持つ）。
function formatFlexDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (d) return `${y}年${Number(m)}月${Number(d)}日`;
  if (m) return `${y}年${Number(m)}月`;
  return `${y}年`;
}

export default function HistoryPage() {
  const { governors, mayors, governorTurnout, mayorTurnout, events } = getHistory();
  // 現職の在任バーは「情報の基準日」の年まで描く（未来を描かない）
  const maxYear = Number(LAST_UPDATED.slice(0, 4));
  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const incumbentMayor = mayors.find((t) => t.endYear === null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "県政・市政の歴史", item: `${SITE_URL}/history/` },
    ],
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">History</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          県政・市政の歴史
        </h1>
        <p className="measure mt-3 text-muted">
          1947年に知事・市長が住民の直接選挙で選ばれるようになってから、愛知県政と名古屋市政を担ってきた歴代首長の系譜、
          投票率の推移、画期となった出来事を一次ソース付きでまとめました。
          いまの政治を読むための「縦軸」のアーカイブです。評価や論評は加えません。
        </p>
      </header>

      {/* 歴代知事の系譜 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">歴代の愛知県知事（公選）</h2>
          <span className="tnum text-sm text-muted">{governors.length}人</span>
        </div>
        <div className="mt-4">
          <HistoryTimeline
            tenures={governors}
            minYear={START_YEAR}
            maxYear={maxYear}
            color="var(--color-chart-pref)"
          />
        </div>
        <ul className="chart-note mt-2 space-y-1">
          {governors
            .filter((t) => t.note)
            .map((t) => (
              <li key={t.name}>
                ※ {t.name}：{t.note}
              </li>
            ))}
        </ul>
        <p className="chart-note mt-2">
          出典：
          <SourceLink href={governors[0].sourceUrl}>全国知事会 歴代知事一覧（愛知県）</SourceLink>
        </p>
      </section>

      {/* 歴代名古屋市長の系譜 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">歴代の名古屋市長（公選）</h2>
          <span className="tnum text-sm text-muted">{mayors.length}人</span>
        </div>
        <div className="mt-4">
          <HistoryTimeline
            tenures={mayors}
            minYear={START_YEAR}
            maxYear={maxYear}
            color="var(--color-chart-municipal)"
          />
        </div>
        <ul className="chart-note mt-2 space-y-1">
          {mayors
            .filter((t) => t.note)
            .map((t) => (
              <li key={t.name}>
                ※ {t.name}：{t.note}
              </li>
            ))}
        </ul>
        <p className="chart-note mt-2">
          出典：
          <SourceLink href={mayors[0].sourceUrl}>名古屋市長の一覧（Wikipedia）</SourceLink>
          {incumbentMayor && (
            <>
              ・現職は
              <SourceLink href={incumbentMayor.sourceUrl}>名古屋市 公式（市長の部屋）</SourceLink>
            </>
          )}
        </p>
      </section>

      {/* 投票率の推移 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">投票率の推移（知事選・名古屋市長選）</h2>
        </div>
        <p className="measure mt-3 text-sm text-muted">
          1947年の第1回から直近まで、愛知県知事選挙（県全体）と名古屋市長選挙（名古屋市）の投票率です。
          高低の解釈は加えず、数値の記録として掲載します。
        </p>
        <div className="mt-4">
          <TurnoutChart governor={governorTurnout} mayor={mayorTurnout} />
        </div>
        <p className="chart-note mt-3">
          出典：
          <SourceLink href={governorTurnout.sourceUrl}>{governorTurnout.sourceLabel}</SourceLink>
          {" ・ "}
          <SourceLink href={mayorTurnout.sourceUrl}>{mayorTurnout.sourceLabel}</SourceLink>
        </p>
      </section>

      {/* 画期イベント年表 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">県政・市政をめぐる主な出来事</h2>
          <span className="tnum text-sm text-muted">{sortedEvents.length}件</span>
        </div>
        <p className="measure mt-3 text-sm text-muted">
          災害・インフラ・国際イベント・選挙や制度の節目など、性質の異なる出来事を偏りなく選んでいます。
          各項目に一次ソースへのリンクを付けています。
        </p>
        <div className="mt-3">
          {sortedEvents.map((e) => (
            <div
              key={`${e.date}-${e.title}`}
              className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-4 border-t border-line py-4 last:border-b sm:grid-cols-[6rem_1fr]"
            >
              <div className="tnum font-display text-base sm:text-lg">{e.year}</div>
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-lg">{e.title}</h3>
                  <span className="border border-line px-1.5 py-0.5 text-[0.65rem] text-muted">
                    {e.category}
                  </span>
                </div>
                <p className="measure mt-1 text-sm text-muted">{e.description}</p>
                <p className="mt-1 text-xs">
                  <span className="text-faint">{formatFlexDate(e.date)}・</span>
                  <SourceLink href={e.sourceUrl}>{e.sourceLabel}</SourceLink>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。歴代首長の在任・投票率・出来事は、いずれも掲載の出典に基づく事実の記録です。
        在任の長短や投票率の高低に評価を加えるものではなく、特定の政党・候補者への投票も呼びかけません。
        誤りに気づかれた方は
        <Link href="/corrections" className="link-ink">
          訂正窓口
        </Link>
        からお知らせください。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/elections" className="link-ink">
          選挙カレンダー
        </Link>
        <Link href="/elections/aichi-governor-2027" className="hover:text-accent-deep">
          愛知県知事選挙2027
        </Link>
        <Link href="/executives" className="hover:text-accent-deep">
          首長一覧
        </Link>
        <Link href="/learn" className="hover:text-accent-deep">
          まなぶ（二元代表制）
        </Link>
      </nav>
    </div>
  );
}
