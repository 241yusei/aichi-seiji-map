import Link from "next/link";
import { ZipSearch } from "@/components/ZipSearch";
import { getFactCards, getIssues, getLegislators, getSpeeches } from "@/lib/data";
import { FactCardType } from "@/components/FactCardView";
import { formatDate } from "@/lib/format";

const LAYERS = [
  {
    n: "01",
    href: "/legislators?level=national",
    label: "国会（愛知選出）",
    body: "衆院（下院）愛知1〜16区・比例東海と、参院（上院）愛知県選挙区。国全体のルールを決める層。",
  },
  {
    n: "02",
    href: "/legislators?level=prefectural",
    label: "愛知県議会",
    body: "県政の代表者。発言は公式会議録への出典リンクで案内します。",
  },
  {
    n: "03",
    href: "/municipalities",
    label: "市町村議会（全54市町村）",
    body: "名古屋市会から町村まで、愛知の全自治体を地域別に。議会・議員・首長へ。",
  },
];

export default function HomePage() {
  const legCount = getLegislators().length;
  const speechCount = getSpeeches().length;
  const issueCount = getIssues().length;
  const facts = getFactCards();
  const featured = facts[0];
  const rest = facts.slice(1, 3);
  const stats = [
    { v: legCount.toLocaleString(), l: "代表者（国・県・市町村）" },
    { v: speechCount.toLocaleString(), l: "国会発言（出典つき）" },
    { v: "54", l: "市町村を網羅" },
    { v: issueCount.toString(), l: "争点を横串" },
  ];

  return (
    <div>
      {/* ヒーロー（便益＝自分ごと／郵便番号を主役に） */}
      <section className="border-b-2 border-ink pb-10">
        <p className="eyebrow text-accent-deep">政治のトリセツ あいち・なごや ／ 知ってから、選ぶ。</p>
        <h1 className="font-display mt-5 text-[clamp(2.1rem,6.5vw,4.5rem)] leading-[1.05]">
          あなたの暮らしを、
          <br className="hidden sm:block" />
          だれが決めている？
        </h1>
        <p className="measure mt-5 text-base text-muted sm:text-lg">
          郵便番号を入れるだけ。あなたの街の代表者と、その人の“記録”が30秒で見つかります。
          中立・一次ソースで、むずかしい言葉はふれれば意味が出ます。
        </p>

        <div className="mt-7 max-w-xl">
          <p className="eyebrow mb-2 text-ink">郵便番号で、あなたの地域の代表者を調べる</p>
          <ZipSearch />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="text-faint">はじめての方は</span>
          <Link href="/start" className="link-ink font-bold">
            どこから見る？（はじめに）
          </Link>
          <Link href="/learn" className="link-ink">
            基礎からまなぶ
          </Link>
        </div>
      </section>

      {/* 統計 */}
      <section className="grid grid-cols-2 gap-x-6 gap-y-6 py-12 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="border-t-2 border-ink pt-3">
            <div className="font-display tnum text-3xl sm:text-4xl">{s.v}</div>
            <div className="mt-1 text-xs text-muted">{s.l}</div>
          </div>
        ))}
      </section>

      {/* 注目の事実カード（0クリックで価値を見せる） */}
      {featured && (
        <section className="border-t-2 border-ink py-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="eyebrow text-accent-deep">注目の事実カード｜記録から見えるギャップ</h2>
            <Link href="/facts" className="link-ink text-sm">
              一覧へ
            </Link>
          </div>
          <Link
            href={`/facts/${featured.id}/`}
            className="group mt-4 block border border-ink bg-surface p-6 transition-colors hover:bg-subtle"
          >
            <div className="flex items-center gap-2">
              <FactCardType type={featured.cardType} />
              <span className="eyebrow bg-accent px-1.5 py-0.5 text-on-accent">新着</span>
              <span className="tnum text-xs text-faint">{formatDate(featured.publishedAt)}</span>
            </div>
            <h3 className="font-display mt-3 text-2xl leading-snug sm:text-3xl">{featured.title}</h3>
            <p className="measure mt-2 text-muted">{featured.hook}</p>
            <span
              aria-hidden
              className="mt-4 inline-block text-faint transition-colors group-hover:text-accent"
            >
              記録を見る →
            </span>
          </Link>
          {rest.length > 0 && (
            <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
              {rest.map((card) => (
                <Link
                  key={card.id}
                  href={`/facts/${card.id}/`}
                  className="group flex flex-col bg-surface p-5 transition-colors hover:bg-subtle"
                >
                  <FactCardType type={card.cardType} />
                  <h3 className="font-display mt-2 text-lg leading-snug">{card.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{card.hook}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 三層 */}
      <section className="border-t-2 border-ink py-10">
        <h2 className="eyebrow text-faint">三層でたどる（国・県・市で役割がちがう）</h2>
        <p className="measure mt-2 text-sm text-muted">
          全国の話は国会、県全体は県議会、自分の街は市町村議会。
          <Link href="/learn/kokkai-to-chiho" className="link-ink">
            ちがいをまなぶ
          </Link>
        </p>
        <div className="mt-4">
          {LAYERS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-6 transition-colors hover:bg-subtle"
            >
              <span className="font-display tnum text-faint">{l.n}</span>
              <div>
                <h3 className="font-display text-xl sm:text-2xl">{l.label}</h3>
                <p className="mt-1 text-sm text-muted">{l.body}</p>
              </div>
              <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 中立性 */}
      <section className="border-t-2 border-ink py-10">
        <h2 className="eyebrow text-accent-deep">中立・非投票誘導が大原則</h2>
        <p className="measure mt-3 text-muted">
          本サイトは特定の政党・候補者への投票や不投票を呼びかけません。比較はすべて事実に基づき、
          AI要約には必ず元発言へのリンクを併記します。
          <Link href="/about" className="link-ink ml-1">
            詳しくはこちら
          </Link>
          。
        </p>
      </section>
    </div>
  );
}
