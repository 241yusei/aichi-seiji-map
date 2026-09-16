import type { Metadata } from "next";
import Link from "next/link";
import { getSpeeches } from "@/lib/data";
import { THEMES, matchThemeSpeeches } from "@/lib/themes";

export const metadata: Metadata = {
  title: "テーマから探す（生活の言葉で）",
  description:
    "物価・子育て・医療・働き方・防災・交通など、生活の言葉から愛知選出議員の国会発言（一次ソース付き）を逆引きできます。",
  alternates: { canonical: "/themes/" },
};

export default function ThemesPage() {
  const speeches = getSpeeches();
  // 定義順を保ち、発言件数をテーマの表示順位や面積に反映しない。
  const rows = THEMES.map((t) => ({ t, count: matchThemeSpeeches(t, speeches).length }));

  return (
    <div>
      <header className="max-w-4xl pb-10 pt-4 sm:pb-14 sm:pt-8">
        <p className="text-sm font-medium tracking-wider text-accent">くらしから、政治へ</p>
        <h1 className="font-display mt-5 text-[clamp(2.3rem,6vw,4.5rem)] leading-[1.15]">
          気になることから、<br />見てみよう。
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          物価、子育て、働き方。いつもの生活の言葉から、
          愛知選出議員が国会で何を話しているかを探せます。
        </p>
      </header>

      <section aria-labelledby="themes-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="themes-heading" className="text-xl font-medium sm:text-2xl">テーマから探す</h2>
          <p className="text-sm text-muted">並び順は、重要度や支持の多さを示すものではありません。</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ t, count }) => (
            <Link
              key={t.id}
              href={`/themes/${t.id}/`}
              className="group flex h-full flex-col rounded-2xl bg-subtle/60 p-6 transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-medium leading-snug sm:text-2xl">{t.label}</h3>
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-accent transition-transform group-hover:translate-x-1">↗</span>
              </div>
              <p className="mb-7 mt-4 text-sm leading-relaxed text-muted">{t.blurb}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="tnum text-muted">収録発言 {count.toLocaleString("ja-JP")} 件</span>
                <span className="font-medium text-accent">発言を読む <span aria-hidden="true">→</span></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <aside className="mt-10 rounded-2xl border border-line p-6 sm:mt-12 sm:p-8" aria-labelledby="theme-method-heading">
        <h2 id="theme-method-heading" className="text-base font-medium">件数の見方と、情報の確かめ方</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          件数は、本サイトに収録した愛知選出議員の国会発言をキーワードで機械的に集計したものです。
          テーマや議員の評価ではありません。発言には、原文を確認できる会議録のリンクを添えています。
        </p>
        <Link href="/issues/" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">
          愛知の争点を、国・県・市の三層で見る <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </div>
  );
}
