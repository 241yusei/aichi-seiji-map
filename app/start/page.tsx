import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "はじめに｜どこから見ればいい？",
  description:
    "政治がよくわからない人のための入口。やりたいことを選ぶと、見る順番を案内します。地域の代表を知る／争点を理解する／そもそも選挙から／投票の準備。",
};

const LADDERS = [
  {
    n: "01",
    title: "自分の地域の代表を知りたい",
    desc: "まずは「自分の街の代表は誰か」から。郵便番号でたどれます。",
    steps: [
      { label: "郵便番号で地域の代表を出す", href: "/area" },
      { label: "市町村のページで議会・首長を見る", href: "/municipalities" },
      { label: "気になる議員の発言・採決・資金を見る", href: "/legislators" },
    ],
  },
  {
    n: "02",
    title: "いま話題の争点を理解したい",
    desc: "リニア・名古屋城・アジア大会など、愛知の争点をやさしく。",
    steps: [
      { label: "争点の一覧から選ぶ", href: "/issues" },
      { label: "事実カードで“記録から見えるギャップ”を見る", href: "/facts" },
      { label: "「県の話？市の話？」を見分ける基礎へ", href: "/learn/kokkai-to-chiho" },
    ],
  },
  {
    n: "03",
    title: "そもそも選挙の仕組みから知りたい",
    desc: "まったくの初心者ならここ。3分ずつ、ゼロから。",
    steps: [
      { label: "そもそも政治とは？", href: "/learn/seiji-towa" },
      { label: "選挙のしくみ（小選挙区・比例）", href: "/learn/senkyo" },
      { label: "二元代表制（地方政治の背骨）", href: "/learn/nigen-daihyo" },
    ],
  },
  {
    n: "04",
    title: "次の投票にそなえたい",
    desc: "基礎をおさえ、自分の地域の代表と争点を確認しておく。",
    steps: [
      { label: "基礎をまとめて読む（まなぶ）", href: "/learn" },
      { label: "自分の地域の代表を確認する", href: "/area" },
      { label: "争点ごとの立場を事実で見る", href: "/issues" },
    ],
  },
];

export default function StartPage() {
  return (
    <div className="space-y-10">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-accent-deep">はじめに ／ Start here</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6.5vw,3.75rem)] leading-tight">
          政治、よくわからない人はここから。
        </h1>
        <p className="measure mt-4 text-base text-muted sm:text-lg">
          むずかしい言葉は使いません。やりたいことを選ぶと、見る順番を案内します。
          このサイトは「誰に入れるべき」とは言いません。事実と出典だけを示します。
        </p>
      </header>

      <div className="grid gap-px border border-line bg-line md:grid-cols-2">
        {LADDERS.map((l) => (
          <section key={l.n} className="bg-surface p-6">
            <div className="flex items-baseline gap-3">
              <span className="font-display tnum text-2xl text-faint">{l.n}</span>
              <h2 className="font-display text-xl leading-snug">{l.title}</h2>
            </div>
            <p className="mt-2 text-sm text-muted">{l.desc}</p>
            <ol className="mt-4 space-y-2">
              {l.steps.map((s, i) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="group flex items-baseline gap-3 border-t border-line pt-2 text-sm transition-colors hover:text-accent-deep"
                  >
                    <span className="eyebrow text-faint">STEP {i + 1}</span>
                    <span className="flex-1">{s.label}</span>
                    <span aria-hidden className="text-faint group-hover:text-accent">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className="measure border-t-2 border-ink pt-5 text-sm text-muted">
        言葉でつまずいたら
        <Link href="/glossary" className="link-ink">
          用語集
        </Link>
        、じっくり学ぶなら
        <Link href="/learn" className="link-ink">
          まなぶ
        </Link>
        へ。
      </p>
    </div>
  );
}
