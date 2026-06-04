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
      <h1 className="text-xl font-bold">争点（ローカルテーマ）</h1>
      <p className="mt-1 text-sm text-muted">
        愛知のローカル争点を、国会・愛知県議会・名古屋市会の三層を横串にして見ます。
      </p>

      {issues.length === 0 ? (
        <p className="mt-6 text-sm text-muted">争点データは準備中です。</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issues/${issue.id}/`}
              className="block rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
            >
              <h2 className="font-bold">{issue.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{issue.description}</p>
              <p className="mt-3 text-xs text-accent">
                国会の関連発言 {issue.relatedSpeechIds.length} 件 ・ 三層で見る →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
