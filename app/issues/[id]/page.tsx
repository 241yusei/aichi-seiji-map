import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getIssue, getIssues, getLegislators, getSpeechesByIds } from "@/lib/data";
import { CrossLayerView, type CrossLayerItem } from "@/components/CrossLayerView";

export function generateStaticParams() {
  return getIssues().map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const issue = getIssue(id);
  return issue
    ? { title: issue.title, description: issue.description }
    : { title: "争点" };
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = getIssue(id);
  if (!issue) notFound();

  const speeches = getSpeechesByIds(issue.relatedSpeechIds).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const legById = new Map(getLegislators().map((l) => [l.id, l]));
  const items: CrossLayerItem[] = speeches.map((speech) => ({
    speech,
    legislator: legById.get(speech.legislatorId),
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link href="/issues" className="text-accent hover:underline">
          ← 争点一覧
        </Link>
      </p>

      <header className="rounded-xl border border-line bg-surface p-5">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <p className="mt-2 text-sm text-muted">{issue.description}</p>
      </header>

      <p className="text-xs text-muted">
        同じ争点について、国・県・市の発言や動きを並べています。国会の発言は会議録から取得した一次ソース付き、
        県・市は公式の会議録検索への導線です。
      </p>

      <CrossLayerView items={items} keywords={issue.keywords ?? []} />
    </div>
  );
}
