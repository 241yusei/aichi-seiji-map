import type { Metadata } from "next";
import Link from "next/link";
import { getIssues, getIssueExplainer } from "@/lib/data";

export const metadata: Metadata = {
  title: "争点（ローカルテーマ）",
  description:
    "リニア・EV転換・セントレア・名古屋城・外国人労働者・アジア大会など、愛知のローカル争点を国・県・市の三層横串で見る。",
  alternates: { canonical: "/issues/" },
};

export default function IssuesPage() {
  const issues = getIssues();

  return (
    <div>
      <header className="max-w-4xl pb-10 pt-4 sm:pb-14 sm:pt-8">
        <p className="text-sm font-medium tracking-wider text-accent">愛知のこれからを知る</p>
        <h1 className="font-display mt-5 text-[clamp(2.3rem,6vw,4.5rem)] leading-[1.15]">
          ひとつの話題を、<br />いろいろな視点で。
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          リニア、ものづくり、まちの未来。愛知の争点について、
          国会・愛知県議会・市町村議会の発言や動きをたどります。
        </p>
        <Link href="/themes/" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent hover:underline">
          「物価」「子育て」など、くらしのテーマから探す <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section aria-labelledby="issues-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="issues-heading" className="text-xl font-medium sm:text-2xl">愛知の争点</h2>
          <p className="text-sm text-muted">並び順や発言件数は、重要度や賛否を示すものではありません。</p>
        </div>
        {issues.length === 0 ? (
          <p className="rounded-2xl bg-subtle p-8 text-muted">争点データは準備中です。</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => {
              const ex = getIssueExplainer(issue.id);
              return (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}/`}
                  className="group flex h-full flex-col rounded-2xl bg-subtle/60 p-6 transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-7"
                >
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-muted">国・県・市を横断</span>
                    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-paper text-accent transition-transform group-hover:translate-x-1">↗</span>
                  </div>
                  <h3 className="text-xl font-medium leading-snug sm:text-2xl">{issue.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">{issue.description}</p>
                  {ex?.youEffect && (
                    <div className="mt-5 rounded-xl bg-paper/80 p-4">
                      <p className="text-xs font-medium text-accent">くらしとのつながり</p>
                      <p className="mt-2 text-sm leading-relaxed">{ex.youEffect}</p>
                    </div>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-7 text-sm">
                    <span className="tnum text-muted">国会の関連発言 {issue.relatedSpeechIds.length.toLocaleString("ja-JP")} 件</span>
                    <span className="font-medium text-accent">詳しく見る <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
        発言や動きは、各ページの一次ソースから確認できます。議会ごとに収録範囲が異なるため、
        掲載件数だけで取り組みの多さを比較することはできません。
      </p>
    </div>
  );
}
