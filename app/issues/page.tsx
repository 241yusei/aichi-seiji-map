import type { Metadata } from "next";
import Link from "next/link";
import { getIssues } from "@/lib/data";

export const metadata: Metadata = {
  title: "争点（ローカルテーマ）",
  description:
    "リニア・EV転換・セントレア・名古屋城・外国人労働者・アジア大会など、愛知のローカル争点を国・県・市の三層横串で見る。",
};

export default function IssuesPage() {
  const issues = getIssues();

  return (
    <div>
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Issues</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">争点</h1>
        <p className="measure mt-3 text-muted">
          愛知のローカル争点を、国会・愛知県議会・市町村議会の三層を横串にして見ます。
        </p>
      </header>

      {issues.length === 0 ? (
        <p className="mt-6 text-sm text-muted">争点データは準備中です。</p>
      ) : (
        <div className="mt-4">
          {issues.map((issue, i) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}/`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-line py-6 transition-colors last:border-b hover:bg-subtle"
            >
              <span className="font-display tnum text-faint">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl">{issue.title}</h2>
                <p className="measure mt-1 line-clamp-2 text-sm text-muted">{issue.description}</p>
                <p className="eyebrow mt-2 text-accent-deep">
                  国会の関連発言 {issue.relatedSpeechIds.length}件 · 三層で見る
                </p>
              </div>
              <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
