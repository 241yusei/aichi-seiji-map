import type { Metadata } from "next";
import Link from "next/link";
import { getLegislators } from "@/lib/data";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED, SITE_URL } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "統一地方選挙2027 愛知では何が選ばれる？｜県議会・名古屋市会など",
  description:
    "2027年4月に見込まれる統一地方選挙。愛知県議会（現員97人）や名古屋市会など、愛知で改選されるものと日程の決まり方を一次ソース付きで中立に解説。特定候補への投票は呼びかけません。",
  alternates: { canonical: "/elections/unified-2027/" },
};

export default function Unified2027Page() {
  const all = getLegislators();
  const prefCount = all.filter((l) => l.level === "prefectural").length;
  const nagoyaCount = all.filter(
    (l) => l.level === "municipal" && l.govCode === "23100",
  ).length;

  // FAQ（画面表示とJSON-LDで内容を一致させる）
  const faqs = [
    {
      q: "統一地方選挙とはなんですか？",
      a: "全国の多くの地方選挙（道府県・市区町村の議員や首長）を、4年に一度、同じ時期にまとめて行うものです。前回は2023年4月に行われ、次回は2027年春に見込まれています。",
    },
    {
      q: "愛知では何が選ばれますか？",
      a: `愛知県議会議員（現員${prefCount}人・任期満了2027年4月29日）の選挙が見込まれるほか、名古屋市会議員（現員${nagoyaCount}人・前回2023年4月の統一地方選で選出）など、多くの市町議会の改選が見込まれます。対象は自治体ごとに異なります。`,
    },
    {
      q: "投票日はいつ決まりますか？",
      a: "統一地方選の期日は、選挙のたびに国会で成立する臨時特例法で確定します（前回2023年分は令和4年11月に成立）。確定後、各選挙管理委員会が告示します。本ページは確定前の日付を予想しません。",
    },
    {
      q: "自分の街が対象か知るには？",
      a: "本サイトの市町村ページで、あなたの街の議会と議員を確認できます。首長（市町村長）の選挙は統一地方選とは別のサイクルで行われることが多く、時期の目安は選挙カレンダーにまとめています。",
    },
    {
      q: "いまの議員の記録はどこで見られますか？",
      a: "議員一覧から、発言・採決・政治資金の記録を一次ソース付きで確認できます。会派の構成は「政党・会派の勢力図」で見られます。",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
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
            name: "統一地方選挙2027（愛知）",
            item: `${SITE_URL}/elections/unified-2027/`,
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
          統一地方選挙2027、愛知では何が選ばれる？
        </h1>
        <p className="measure mt-3 text-muted">
          2027年春に見込まれる第21回統一地方選挙で、愛知県内の何が改選されるのか。
          しくみと日程の決まり方を、一次ソース付きで中立にまとめました。特定の候補者・政党への投票は呼びかけません。
        </p>
      </header>

      {/* 結論ファースト */}
      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">愛知の主な改選（見込み）</h2>
        <ul className="measure mt-2 space-y-1 text-ink">
          <li>
            ・<strong>愛知県議会議員</strong>（現員{prefCount}人）——任期満了は
            <strong>2027年4月29日</strong>
          </li>
          <li>
            ・<strong>名古屋市会議員</strong>（現員{nagoyaCount}人）——前回2023年4月の統一地方選で選出（任期4年）
          </li>
          <li>・そのほか、県内の多くの市町議会も改選見込み（対象は自治体ごとに異なります）</li>
        </ul>
        <p className="chart-note mt-3">
          出典：
          <SourceLink href="https://www.city.obu.aichi.jp/shisei/senkyo/senkyo_info/1004151/1004152.html">
            大府市選挙管理委員会「各種選挙の任期満了日」
          </SourceLink>
          。現員数は本サイト収録の各議会公式名簿に基づく（基準日{LAST_UPDATED}）。
        </p>
      </section>

      {/* よくある質問（FAQ構造化データと同一内容） */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">よくある質問</h2>
        </div>
        <div className="mt-2">
          {faqs.map((f) => (
            <div key={f.q} className="border-t border-line py-5 first:border-0">
              <h3 className="font-display text-lg">{f.q}</h3>
              <p className="measure mt-2 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
        <p className="chart-note mt-2">
          期日を定める特例法（前回分）：
          <SourceLink href="https://laws.e-gov.go.jp/law/504AC0000000084">
            地方公共団体の議会の議員及び長の選挙期日等の臨時特例に関する法律（令和4年法律第84号・e-Gov）
          </SourceLink>
        </p>
      </section>

      {/* 判断材料への導線 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">改選前にできる「下調べ」</h2>
        </div>
        <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
          <Link
            href="/legislators?level=prefectural"
            className="group bg-surface p-5 transition-colors hover:bg-subtle"
          >
            <h3 className="font-display text-lg">県議会の現職{prefCount}人</h3>
            <p className="mt-2 text-sm text-muted">あなたの選挙区の県議と、その記録。</p>
          </Link>
          <Link href="/parties" className="group bg-surface p-5 transition-colors hover:bg-subtle">
            <h3 className="font-display text-lg">会派の勢力図</h3>
            <p className="mt-2 text-sm text-muted">県議会・名古屋市会の構成を人数順に。</p>
          </Link>
          <Link
            href="/municipalities"
            className="group bg-surface p-5 transition-colors hover:bg-subtle"
          >
            <h3 className="font-display text-lg">あなたの街の議会</h3>
            <p className="mt-2 text-sm text-muted">54市町村の議員・首長・会議録への入口。</p>
          </Link>
        </div>
        <p className="measure mt-4 text-sm text-muted">
          議会と首長のちがい（二元代表制）は{" "}
          <Link href="/learn" className="link-ink">
            まなぶ
          </Link>
          、投票の流れは{" "}
          <Link href="/vote-guide" className="link-ink">
            投票ガイド
          </Link>
          へ。名古屋市会の議決の記録は{" "}
          <Link href="/decisions" className="link-ink">
            議会の議決
          </Link>
          で確認できます。
        </p>
      </section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。改選の対象・期日は今後の特例法・各選挙管理委員会の告示で確定します。
        本サイトは特定の政党・候補者への投票を呼びかけません。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/elections" className="link-ink">
          選挙カレンダー（愛知全体）
        </Link>
        <Link href="/elections/aichi-governor-2027" className="hover:text-accent-deep">
          愛知県知事選挙2027
        </Link>
        <Link href="/legislators" className="hover:text-accent-deep">
          議員一覧
        </Link>
      </nav>
    </div>
  );
}
