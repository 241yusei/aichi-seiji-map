import type { Metadata } from "next";
import Link from "next/link";
import { getExecutives } from "@/lib/data";
import { SourceLink } from "@/components/SourceLink";
import { formatDate } from "@/lib/format";
import { LAST_UPDATED, SITE_URL } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "愛知県知事選挙（2027年）はいつ？｜任期満了日と仕組み",
  description:
    "次の愛知県知事選はいつごろか。現職の任期満了日（2027年2月14日）・投票日の決まり方・知事の役割を、一次ソース付きで中立に解説。特定候補への投票は呼びかけません。",
  alternates: { canonical: "/elections/aichi-governor-2027/" },
};

// FAQ（画面表示とJSON-LDで内容を一致させる）
const FAQS = [
  {
    q: "次の愛知県知事選挙はいつですか？",
    a: "現職知事の任期満了日は2027年2月14日です。任期満了にともなう選挙は、公職選挙法により任期満了の日前30日以内に行うと定められており、実際の投票日は愛知県選挙管理委員会の告示で確定します。",
  },
  {
    q: "知事はどんな仕事をする人ですか？",
    a: "県の予算案・条例案をつくって議会に提出し、可決されたものを実行する県行政のトップです。議員（県議会）とは別に、住民の直接選挙で選ばれます（二元代表制）。",
  },
  {
    q: "現職の知事はだれですか？",
    a: "大村秀章氏です。2023年2月の知事選で当選し、現在4期目。任期満了日は2027年2月14日です。",
  },
  {
    q: "前回の知事選はいつでしたか？",
    a: "前回の愛知県知事選挙は2023年2月に投開票されました。結果の詳細は愛知県選挙管理委員会の公式ページで確認できます。",
  },
  {
    q: "投票するにはどうすればいいですか？",
    a: "投票日当日に指定の投票所へ行くか、期日前投票を利用します。はじめての方向けの流れは、本サイトの「投票ガイド」でやさしく解説しています。",
  },
];

export default function GovernorElection2027Page() {
  const governor = getExecutives().find((e) => e.level === "prefectural");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "選挙カレンダー", item: `${SITE_URL}/elections/` },
          {
            "@type": "ListItem",
            position: 3,
            name: "愛知県知事選挙2027",
            item: `${SITE_URL}/elections/aichi-governor-2027/`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Elections 2027</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          愛知県知事選挙（2027年）はいつ？
        </h1>
        <p className="measure mt-3 text-muted">
          次の知事選の「時期の目安」と、知事という仕事のしくみを、一次ソース付きで中立にまとめました。
          特定の候補者への投票は呼びかけません。立候補者の情報は、告示後に愛知県選挙管理委員会が公表します。
        </p>
      </header>

      {/* 結論ファースト：時期の目安 */}
      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">時期の目安</h2>
        <p className="measure mt-2 text-ink">
          現職知事の<strong>任期満了日は{governor?.termEnd ? formatDate(governor.termEnd) : "2027年2月14日"}</strong>。
          任期満了にともなう選挙は<strong>任期満了の日前30日以内</strong>に行うと公職選挙法で定められています。
          実際の投票日は愛知県選挙管理委員会の告示で確定します（本ページは確定日を予想しません）。
        </p>
        <p className="chart-note mt-3">
          出典：
          {governor?.termSourceUrl && (
            <>
              <SourceLink href={governor.termSourceUrl}>全国知事会 歴代知事（任期）</SourceLink>
              {" ・ "}
            </>
          )}
          <SourceLink href="https://laws.e-gov.go.jp/law/325AC1000000100">
            公職選挙法（e-Gov法令検索）
          </SourceLink>
        </p>
      </section>

      {/* よくある質問（FAQ構造化データと同一内容） */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">よくある質問</h2>
        </div>
        <div className="mt-2">
          {FAQS.map((f) => (
            <div key={f.q} className="border-t border-line py-5 first:border-0">
              <h3 className="font-display text-lg">{f.q}</h3>
              <p className="measure mt-2 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="chart-note mt-2">
          現職の期数の出典：
          <SourceLink href="https://www.pref.aichi.jp/site/chiji/profile.html">
            愛知県 知事プロフィール（公式）
          </SourceLink>
          ・前回選挙の結果：
          <SourceLink href="https://www.pref.aichi.jp/soshiki/senkyo/0000087359.html">
            愛知県選挙管理委員会 投開票の状況
          </SourceLink>
        </p>
      </section>

      {/* 判断材料への導線（中立：記録を見る、だけ） */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">このサイトでできる「下調べ」</h2>
        </div>
        <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
          <Link href="/executives" className="group bg-surface p-5 transition-colors hover:bg-subtle">
            <h3 className="font-display text-lg">現職の首長を知る</h3>
            <p className="mt-2 text-sm text-muted">知事・市町村長の一覧と任期満了日。</p>
          </Link>
          <Link
            href="/legislators?level=prefectural"
            className="group bg-surface p-5 transition-colors hover:bg-subtle"
          >
            <h3 className="font-display text-lg">県議会の顔ぶれ</h3>
            <p className="mt-2 text-sm text-muted">知事とともに県政を担う97人の議員。</p>
          </Link>
          <Link href="/issues" className="group bg-surface p-5 transition-colors hover:bg-subtle">
            <h3 className="font-display text-lg">愛知の争点を知る</h3>
            <p className="mt-2 text-sm text-muted">リニア・アジア大会など、賛否は両論併記で。</p>
          </Link>
        </div>
        <p className="measure mt-4 text-sm text-muted">
          「知事と議会はどうちがう？」は{" "}
          <Link href="/learn" className="link-ink">
            まなぶ（二元代表制）
          </Link>
          、投票の流れは{" "}
          <Link href="/vote-guide" className="link-ink">
            投票ガイド
          </Link>
          でやさしく解説しています。
        </p>
      </section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。任期満了日＝投票日ではありません。投票日・立候補者は愛知県選挙管理委員会の告示・発表でご確認ください。
        本サイトは特定の政党・候補者への投票を呼びかけません。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/elections" className="link-ink">
          選挙カレンダー（愛知全体）
        </Link>
        <Link href="/elections/unified-2027" className="hover:text-accent-deep">
          統一地方選挙2027（愛知）
        </Link>
        <Link href="/vote-guide" className="hover:text-accent-deep">
          投票ガイド
        </Link>
      </nav>
    </div>
  );
}
