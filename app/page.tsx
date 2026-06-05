import Link from "next/link";
import { ZipSearch } from "@/components/ZipSearch";
import { getIssues, getLegislators, getSpeeches } from "@/lib/data";

const LAYERS = [
  {
    n: "01",
    href: "/legislators?level=national",
    label: "国会（愛知選出）",
    body: "衆院 愛知1〜16区・比例東海・参院 愛知県選挙区。発言は国会会議録から取得。",
  },
  {
    n: "02",
    href: "/legislators?level=prefectural",
    label: "愛知県議会",
    body: "県政の代表者。発言は公式会議録への出典リンクで案内します。",
  },
  {
    n: "03",
    href: "/legislators?level=municipal",
    label: "市町村議会（全54市町村）",
    body: "名古屋市会から町村まで、愛知の全自治体の代表者を収録しています。",
  },
];

export default function HomePage() {
  const legCount = getLegislators().length;
  const speechCount = getSpeeches().length;
  const issueCount = getIssues().length;
  const stats = [
    { v: legCount.toLocaleString(), l: "代表者（国・県・市町村）" },
    { v: speechCount.toLocaleString(), l: "国会発言（出典つき）" },
    { v: "54", l: "市町村を網羅" },
    { v: issueCount.toString(), l: "争点を横串" },
  ];

  return (
    <div>
      {/* ヒーロー */}
      <section className="border-b-2 border-ink pb-12">
        <p className="eyebrow text-accent-deep">Aichi Politics Map ／ 愛知の政治を、一次ソースで</p>
        <h1 className="font-display mt-5 text-[clamp(2.2rem,7vw,5rem)] leading-[1.02]">
          あなたの地域の代表者が、
          <br className="hidden sm:block" />
          何を言い、どう動いたか。
        </h1>
        <p className="measure mt-6 text-base text-muted sm:text-lg">
          国会（愛知選出）・愛知県議会・全54市町村を横断して、発言・採決・政治資金を
          公的な一次ソース付きで。専門用語を避け、5分で全体像をつかめる導線をめざします。
        </p>

        <div className="mt-9 max-w-xl">
          <p className="eyebrow mb-2 text-ink">郵便番号で、あなたの地域の代表者を調べる</p>
          <ZipSearch />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/area"
            className="bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
          >
            地域から探す
          </Link>
          <Link
            href="/legislators"
            className="border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
          >
            議員を見る
          </Link>
          <Link
            href="/issues"
            className="border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
          >
            争点から見る
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

      {/* 三層 */}
      <section className="border-t-2 border-ink py-10">
        <h2 className="eyebrow text-faint">三層でたどる</h2>
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
