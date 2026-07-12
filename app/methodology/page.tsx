import type { Metadata } from "next";
import Link from "next/link";
import { getSpeeches } from "@/lib/data";
import { coverageRange } from "@/lib/activity-stats";
import { getDivergences, MIN_FACTION_SIZE } from "@/lib/faction-divergence";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED, SITE_URL } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "集計方法（methodology）— 発言統計と会派多数の算出",
  description:
    "発言統計の収録範囲と限界、会派多数と異なる投票の算出方法（会派の指示は非公開のため会派内多数を近似とする）、立場スコアを採用しない理由、出典データの一覧を全面開示します。",
  alternates: { canonical: "/methodology/" },
};

// 出典データ一覧（本サイトが集計に使う一次ソース）。
const DATA_SOURCES: { label: string; url: string; note: string }[] = [
  {
    label: "国会会議録検索システム API（国立国会図書館）",
    url: "https://kokkai.ndl.go.jp/api.html",
    note: "国会発言の本文・会議名・日付・原文リンクの取得元。発言の統計はこのデータの再集計です。",
  },
  {
    label: "参議院 本会議投票結果",
    url: "https://www.sangiin.go.jp/japanese/touhyoulist/touhyoulist.html",
    note: "参院の記名投票（押しボタン式）の個人別賛否。会派多数と異なる投票の検出に使います。",
  },
  {
    label: "衆議院 議案・本会議の議決結果",
    url: "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/menu.htm",
    note: "衆院の多くは起立採決で個人の賛否は非公開。記名投票のときのみ個人別が分かります。",
  },
  {
    label: "TheyWorkForYou — Voting information（英・参考にした手法）",
    url: "https://www.theyworkforyou.com/voting-information/",
    note: "「会派の正式な指示は非公開のため所属議員の平均を会派の立場の近似とする」手法の出典。",
  },
];

function SectionHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b-[3px] border-ink pb-2">
      <span className="num-display tnum text-sm text-faint">{n}</span>
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}

export default function MethodologyPage() {
  const speeches = getSpeeches();
  const coverage = coverageRange(speeches);
  const speakers = new Set(speeches.map((s) => s.legislatorId)).size;
  const div = getDivergences();

  const coverageText = coverage
    ? `${coverage.fromYear}年${coverage.fromMonth}月〜${coverage.toYear}年${coverage.toMonth}月`
    : "整備中";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "集計方法（methodology）",
    description:
      "発言統計・会派多数と異なる投票の算出方法と限界の全面開示。",
    url: `${SITE_URL}/methodology/`,
    dateModified: LAST_UPDATED,
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Methodology</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">集計方法</h1>
        <p className="measure mt-3 text-muted">
          本サイトの「発言の統計」と「会派多数と異なる投票」が、どのデータから・どう計算され・
          何を計算しないのかを開示します。数字はすべて事実の集計で、働きぶりや優劣の評価ではありません。
        </p>
        <p className="mt-2 text-xs text-faint">情報の基準日：{LAST_UPDATED}</p>
      </header>

      {/* 要点（先に結論） */}
      <div className="zone-calm card-soft p-5">
        <p className="eyebrow text-accent-deep">この方針の要点</p>
        <ul className="measure mt-2 space-y-1.5 text-sm text-muted">
          <li>発言の統計は、会議録の再集計です。「収録分」であり、活動のすべてではありません。</li>
          <li>
            会派の正式な賛否指示は非公開のため、同じ採決の
            <span className="font-bold text-ink">同会派メンバーの多数</span>を会派の立場の近似とします。
          </li>
          <li>
            少数会派の「多数」は誤解を招くため、その採決で賛否を投じた同会派が
            <span className="font-bold text-ink">{MIN_FACTION_SIZE}人未満</span>なら対象外にします。
          </li>
          <li>
            データが浅いため、議員を0〜100で採点する
            <span className="font-bold text-ink">立場スコアは採用しません</span>。
          </li>
        </ul>
      </div>

      {/* 01 発言の統計 */}
      <section className="space-y-4">
        <SectionHead n="01" title="発言の統計：収録範囲と限界" />
        <div className="measure space-y-3 text-sm text-ink">
          <p>
            議員詳細ページの「発言の統計」は、国会会議録検索システムから取得した発言を、
            ビルド時に議員ごとに再集計したものです（収録発言数・年別の件数・会議別の件数）。
            集計はキーワードやAIの判断を使わず、会議録のメタデータ（日付・会議名）だけを数えます。
          </p>
          <div className="border border-line bg-surface p-4">
            <p className="eyebrow text-faint">現在の収録状況</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                収録範囲：<span className="font-bold">{coverageText}</span>・愛知選出議員のみ
              </li>
              <li>
                収録発言数：<span className="tnum font-bold">{speeches.length}</span> 件（
                <span className="tnum font-bold">{speakers}</span> 名分）
              </li>
            </ul>
          </div>
          <p>
            <span className="font-bold">限界（必ずお読みください）：</span>
            この数は「本サイトが収録した発言」の集計であり、国会での実際の発言・活動のすべてではありません。
            収録は会議録の整備状況や取得時期に左右されます。
            発言数が少ない・0件であることは、活動量の多寡や優劣を示すものではありません。
            当選時期や役職（大臣・委員長は質疑より答弁側に回るなど）によっても件数は大きく変わります。
          </p>
          <p className="text-muted">
            会議別の内訳は、会議名の末尾「第N号」を除いた委員会・会議の単位で数えています。
            上位のみ表示し、それ以外はまとめて「その他の会議」として合算しています。
          </p>
        </div>
      </section>

      {/* 02 会派多数と異なる投票 */}
      <section className="space-y-4">
        <SectionHead n="02" title="会派多数と異なる投票：算出方法" />
        <div className="measure space-y-3 text-sm text-ink">
          <p>
            参議院の記名投票（押しボタン式）は、個人ごとの賛否が公開されます。
            この記録から、同じ採決で
            <span className="font-bold">同会派の多数と異なる賛否だった票</span>を機械的に検出し、
            議員ページの採決欄と{" "}
            <Link href="/decisions/" className="link-ink">
              議会の議決
            </Link>
            のページに事実として表示します。
          </p>
          <div className="border-l-2 border-accent bg-subtle px-4 py-3">
            <p className="eyebrow text-accent-deep">計算の手順</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
              <li>採決（議案×日付）ごとに、投票した議員を会派別にまとめる。</li>
              <li>
                賛成／反対を投じた同会派の人数が {MIN_FACTION_SIZE} 人以上のときだけ、
                その会派の「多数」（賛成が多いか・反対が多いか）を求める。
              </li>
              <li>同会派の多数と反対の票を投じた議員を「会派多数と異なる投票」として印を付ける。</li>
              <li>賛否が同数で多数が定まらない会派、{MIN_FACTION_SIZE} 人未満の会派は対象外。</li>
            </ol>
          </div>
          <p>
            <span className="font-bold">これは近似です（TheyWorkForYou 方式）：</span>
            会派の正式な賛否指示は公表されないため、
            本サイトは「同じ採決での同会派メンバーの多数」を会派の立場の近似として用います。
            英国の TheyWorkForYou も同様に、党の指示は非公開である前提で所属議員の傾向を党の立場の近似としています。
            したがって「会派多数と異なる投票」は、党議拘束への違反を断定するものではありません。
          </p>
          <p>
            さらに本サイトの記名投票データは愛知選出議員に絞っているため、ここでいう「会派の多数」は
            <span className="font-bold">その採決に加わった同会派の愛知選出議員内での多数</span>です。
            会派全体（全国）の多数とは一致しない場合があります。
          </p>
          <p className="font-bold text-ink">
            用語について：本サイトは「会派多数と異なる投票」という事実表現のみを用い、
            「造反」などの評価を含む言葉は使いません。良し悪しの判断はしません。
          </p>

          <div className="border border-line bg-surface p-4">
            <p className="eyebrow text-faint">現在の検出状況</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                対象とした記名投票：<span className="tnum font-bold">{div.billsAnalyzed}</span> 件
              </li>
              <li>
                {MIN_FACTION_SIZE}人以上の会派があり多数を算出できた採決：{" "}
                <span className="tnum font-bold">{div.billsEligible}</span> 件
              </li>
              <li>
                検出された「会派多数と異なる投票」：{" "}
                <span className="tnum font-bold">{div.divergenceCount}</span> 件
              </li>
            </ul>
            {div.divergenceCount === 0 && (
              <p className="mt-2 text-xs text-muted">
                現在のデータでは、多くの採決で各会派の愛知選出議員が {MIN_FACTION_SIZE} 人に満たず、
                会派多数と異なる投票は検出されていません。データが増えると検出される場合があります。
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 03 立場スコアを採用しない理由 */}
      <section className="space-y-4">
        <SectionHead n="03" title="立場スコア（0〜100）を採用しない理由" />
        <div className="measure space-y-3 text-sm text-ink">
          <p>
            投票記録を0〜100の点数にして「賛成度」を1つの数字で表す手法（英 TheyWorkForYou の
            投票サマリー等）がありますが、本サイトでは採用しません。
          </p>
          <p>
            本サイトの参院記名投票は{" "}
            <span className="tnum font-bold">{div.billsAnalyzed}</span>{" "}
            件・約3.5か月分と浅く、少数のデータを1つのスコアに圧縮すると、
            わずかな票の違いが過大な印象を与え、かえって誤解を招きます。
            そのため今回は、
            <span className="font-bold">（1）活動量の統計</span>と
            <span className="font-bold">（2）会派内での相違の事実表示</span>の2点に限定し、
            スコア化・ランキング化はしません。
          </p>
          <p className="text-muted">
            将来データが十分に蓄積された場合でも、スコア化は中立性・誤読リスクを検討したうえで、
            採用の可否をこのページで改めて開示します。
          </p>
        </div>
      </section>

      {/* 04 出典データ */}
      <section className="space-y-4">
        <SectionHead n="04" title="出典データの一覧" />
        <ul className="divide-y divide-line border-y border-line">
          {DATA_SOURCES.map((s) => (
            <li key={s.url} className="py-3">
              <SourceLink href={s.url}>{s.label}</SourceLink>
              <p className="measure mt-1 text-sm text-muted">{s.note}</p>
            </li>
          ))}
        </ul>
        <p className="measure text-xs text-faint">
          本サイトの中立性の考え方・免責は{" "}
          <Link href="/about/" className="link-ink">
            このサイトについて
          </Link>
          を、誤りの報告は{" "}
          <Link href="/corrections/" className="link-ink">
            訂正の申し出
          </Link>
          をご覧ください。
        </p>
      </section>
    </div>
  );
}
