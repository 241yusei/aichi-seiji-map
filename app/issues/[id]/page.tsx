import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getIssue,
  getIssueExplainer,
  getIssues,
  getLegislators,
  getSpeechesByIds,
} from "@/lib/data";
import { CrossLayerView, type CrossLayerItem } from "@/components/CrossLayerView";
import { IssueExplainerCard } from "@/components/IssueExplainerCard";

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
    ? {
        title: issue.title,
        description: issue.description,
        alternates: { canonical: `/issues/${id}/` },
      }
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
  const explainer = getIssueExplainer(id);

  const speeches = getSpeechesByIds(issue.relatedSpeechIds).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const legById = new Map(getLegislators().map((l) => [l.id, l]));
  const items: CrossLayerItem[] = speeches.map((speech) => ({
    speech,
    legislator: legById.get(speech.legislatorId),
  }));

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/issues" className="link-ink">
          ← 争点一覧
        </Link>
      </p>

      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Issue · 三層横串</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-[1.05]">
          {issue.title}
        </h1>
        <p className="measure mt-3 text-muted">{issue.description}</p>
      </header>

      {/* 01 解説（ガイド層）⇄ 02 記録（データ層）の振り子構造。往復リンクで“意味↔事実”を行き来できる。 */}
      <section id="explainer" className="scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 border-b-[3px] border-ink pb-2">
          <div className="flex items-baseline gap-3">
            <span className="num-display tnum text-sm text-faint">01</span>
            <h2 className="font-display text-2xl">解説</h2>
          </div>
          <a href="#records" className="link-ink text-sm">
            記録を見る ↓
          </a>
        </div>
        <div className="mt-5">{explainer && <IssueExplainerCard ex={explainer} />}</div>
      </section>

      <section id="records" className="scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 border-b-[3px] border-ink pb-2">
          <div className="flex items-baseline gap-3">
            <span className="num-display tnum text-sm text-faint">02</span>
            <h2 className="font-display text-2xl">記録（一次ソース）</h2>
          </div>
          <a href="#explainer" className="link-ink text-sm">
            解説にもどる ↑
          </a>
        </div>
        <p className="mt-3 text-xs text-faint">
          同じ争点について、国・県・市の発言や動きを並べています。国会の発言は会議録から取得した一次ソース付き、
          県・市は公式の会議録検索への導線です。賛否は等量・等デザインで提示します。
          AI要約は自動生成の補助情報のため、判断の際は各発言の原文リンクをご確認ください。
        </p>
        <div className="mt-4">
          <CrossLayerView items={items} keywords={issue.keywords ?? []} />
        </div>
      </section>
    </div>
  );
}
