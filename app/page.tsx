import Link from "next/link";
import { ZipSearch } from "@/components/ZipSearch";
import { CivicIllustration } from "@/components/CivicIllustration";
import { TopicIcon } from "@/components/TopicIcon";
import { getFactCards, getIssues, getLegislators, getSpeeches } from "@/lib/data";
import { FactCardType } from "@/components/FactCardView";
import { formatDate } from "@/lib/format";
import { THEMES } from "@/lib/themes";
import { LAST_UPDATED } from "@/lib/site-meta";

const LAYERS = [
  { n: "01", href: "/legislators?level=national", label: "国会", sub: "国のルールをつくる", body: "法律や国の予算について。愛知選出の代表者の記録をたどります。" },
  { n: "02", href: "/legislators?level=prefectural", label: "愛知県議会", sub: "県全体のことを考える", body: "県の医療や産業、防災について。県議会の代表者を調べます。" },
  { n: "03", href: "/municipalities", label: "市町村議会", sub: "身近なまちのことを決める", body: "子育てやごみ、まちづくりについて。あなたの自治体から探せます。" },
];

export default function HomePage() {
  const stats = [
    { value: getLegislators().length.toLocaleString(), unit: "人", label: "掲載している議員" },
    { value: getSpeeches().length.toLocaleString(), unit: "件", label: "出典つきの発言記録" },
    { value: "54", unit: "市町村", label: "愛知の地域から探せる" },
    { value: getIssues().length.toString(), unit: "テーマ", label: "地域の争点を読み解く" },
  ];
  const facts = getFactCards().slice(0, 3);

  return (
    <div className="home-page">
      <section
        className="grid items-center gap-6 pb-8 pt-2 md:grid-cols-[1.35fr_1fr] md:gap-0 md:pb-12 md:pt-6"
        aria-labelledby="home-title"
      >
        <div>
          <p className="mb-6 flex items-center gap-2.5 text-xs font-medium tracking-[.08em] text-accent sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-signal" aria-hidden="true" />わたしと、あいちと、政治のこと。
          </p>
          <h1 id="home-title" className="font-display hero-title">
            政治を、<br />
            <span className="text-accent">もっと身近に。</span>
          </h1>
          <p className="mt-7 text-[15px] leading-loose text-muted sm:text-base">
            いつもの暮らしと、政治はつながっている。<br />
            あなたの街の代表者や、気になる話題を、<br className="hidden sm:block" />
            やさしい言葉と、確かな記録で。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#find-area" className="home-link home-link-primary">
              あなたの地域から探す <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/start/" className="home-link home-link-secondary">
              はじめての方へ <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-5 text-xs text-faint">だれかを薦めるのではなく、知るための入口です。</p>
        </div>
        <CivicIllustration />
      </section>

      <section
        id="find-area"
        className="grid scroll-mt-6 items-center gap-6 rounded-2xl bg-calm p-6 lg:grid-cols-[.85fr_1.15fr] lg:gap-12 lg:p-8"
        aria-labelledby="find-area-title"
      >
        <div>
          <p className="eyebrow text-accent">まずは、あなたの街から</p>
          <h2 id="find-area-title" className="font-display mt-2 text-2xl sm:text-[28px]">わたしの代表者って、だれ？</h2>
          <p className="mt-2 text-sm text-muted">郵便番号で、国・県・市の代表者をまとめて。</p>
        </div>
        <div>
          <ZipSearch />
          <p className="mt-3 text-xs text-muted">
            郵便番号検索は名古屋市内に対応。
            <Link href="/municipalities/" className="link-ink">愛知県の市町村一覧から探す →</Link>
          </p>
        </div>
      </section>

      <section className="home-section" aria-labelledby="themes-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3 text-accent">暮らしから、ひもとく</p>
            <h2 id="themes-heading" className="font-display section-heading">気になることから、でいい。</h2>
          </div>
          <Link href="/themes/" className="link-ink text-sm">
            すべてのテーマ <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">毎日の「これ、どうなっている？」から、議会の言葉へ。</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.slice(0, 6).map((theme) => (
            <Link
              key={theme.id}
              href={`/themes/${theme.id}/`}
              className="home-card group flex items-center gap-4 bg-sand p-5 hover:bg-calm"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-accent">
                <TopicIcon name={theme.id} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-medium">{theme.label}</h3>
                <p className="mt-1 text-xs text-muted">{theme.blurb.split('など、')[0]}</p>
              </div>
              <span aria-hidden="true" className="text-muted">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="home-section grid overflow-hidden rounded-2xl bg-citrus md:grid-cols-[1fr_auto]"
        aria-labelledby="learn-heading"
      >
        <div className="p-7 sm:p-10">
          <p className="eyebrow">知識ゼロから、少しずつ</p>
          <h2 id="learn-heading" className="font-display mt-4 text-3xl sm:text-4xl">
            「そもそも」から、<br className="sm:hidden" />
            はじめよう。</h2>
          <p className="mt-4 text-sm text-muted">
            国会と県議会は、どう違う？ 選挙って、どんなしくみ？<br className="hidden sm:block" />
            知っていることが増えると、ニュースの見え方も変わります。</p>
          <Link href="/learn/" className="home-link home-link-secondary mt-6">
            政治のきほんをまなぶ <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hidden items-center px-16 md:flex" aria-hidden="true">
          <span className="font-display text-[140px] leading-none tracking-tighter text-ink/80">？</span>
        </div>
      </section>

      <section className="home-section" aria-labelledby="layers-heading">
        <p className="eyebrow mb-3 text-accent">国・県・市、それぞれの役割</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="layers-heading" className="font-display section-heading">つながる政治、3つの入口。</h2>
          <Link href="/compare/" className="link-ink text-sm">議員の記録をくらべる ↗</Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {LAYERS.map((layer) => (
            <Link
              key={layer.n}
              href={layer.href}
              className="home-card group flex flex-col bg-subtle p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="num-display text-3xl text-accent">{layer.n}</span>
                <span className="home-arrow" aria-hidden="true">↗</span>
              </div>
              <p className="mt-8 text-xs text-muted">{layer.sub}</p>
              <h3 className="font-display mt-2 text-2xl">{layer.label}</h3>
              <p className="mt-4 text-sm text-muted">{layer.body}</p>
            </Link>
          ))}
        </div>
      </section>

      {facts.length > 0 && (
        <section className="home-section" aria-labelledby="facts-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3 text-accent">一次ソースから知る</p>
              <h2 id="facts-heading" className="font-display section-heading">記録を読むと、見えてくる。</h2>
            </div>
            <Link href="/facts/" className="link-ink text-sm">事実カードをすべて見る ↗</Link>
          </div>
          <p className="mt-4 text-sm text-muted">公開日の新しい順に掲載。元の資料とあわせて確かめられます。</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {facts.map((fact) => (
              <Link
                key={fact.id}
                href={`/facts/${fact.id}/`}
                className="home-card flex flex-col border border-line bg-surface p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <FactCardType type={fact.cardType} />
                  <span className="text-xs text-faint">{formatDate(fact.publishedAt)}</span>
                </div>
                <h3 className="font-display mt-5 text-xl leading-relaxed">{fact.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-muted">{fact.hook}</p>
                <span className="mt-auto pt-6 text-sm text-accent">
                  記録を読む <span aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="home-section rounded-2xl bg-sand p-6 sm:p-8" aria-labelledby="elections-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="elections-heading" className="font-display text-2xl">次の選挙、いつだろう。</h2>
          <Link href="/elections/" className="link-ink text-sm">選挙カレンダー ↗</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/elections/aichi-governor-2027/"
            className="home-card flex items-center justify-between gap-3 bg-white p-5"
          >
            <div>
              <p className="text-xs text-faint">2027年2月 任期満了</p>
              <h3 className="mt-1 text-base font-medium">愛知県知事選挙</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
          <Link
            href="/elections/unified-2027/"
            className="home-card flex items-center justify-between gap-3 bg-white p-5"
          >
            <div>
              <p className="text-xs text-faint">2027年4月 見込み</p>
              <h3 className="mt-1 text-base font-medium">統一地方選挙</h3>
            </div>
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="home-section" aria-labelledby="promise-heading">
        <div className="text-center">
          <p className="eyebrow text-accent">政治のトリセツの約束</p>
          <h2 id="promise-heading" className="font-display section-heading mt-4">あなたが考える、その手がかりに。</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-loose text-muted">
            特定の政党や候補者への投票・不投票を呼びかけません。<br className="hidden sm:block" />
            議員は同じ書式で、発言は出典とともに。AIの要約からも、元の記録をたどれます。</p>
          <Link href="/methodology/" className="link-ink mt-5 inline-block text-sm">データの集め方・見せ方を知る ↗</Link>
        </div>
        <dl className="mt-10 grid grid-cols-2 gap-6 rounded-2xl bg-subtle p-6 sm:grid-cols-4 sm:p-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs text-muted">{stat.label}</dt>
              <dd className="mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="num-display text-3xl sm:text-4xl">{stat.value}</span>
                <span className="text-xs text-muted">{stat.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-right text-xs text-faint">収録データの基準日：{LAST_UPDATED} · 件数は活動の評価ではありません</p>
      </section>
    </div>
  );
}
