import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getFactCards,
  getIssue,
  getIssueExplainer,
  getIssues,
  getLegislators,
  getSpeechesByIds,
} from "@/lib/data";
import { CrossLayerView, type CrossLayerItem } from "@/components/CrossLayerView";
import { IssueExplainerCard } from "@/components/IssueExplainerCard";
import { FactCardType } from "@/components/FactCardView";
import { getRelatedFactCardsForIssue } from "@/lib/related";
import { getLivingTopicByIssue } from "@/lib/living-topics";
import { livingTopicMetadata } from "@/lib/living-topic-meta";
import { LivingTopicBrief } from "@/components/LivingTopicBrief";

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
  const topic = getLivingTopicByIssue(id);
  return issue
    ? {
        ...(topic ? livingTopicMetadata(topic) : { title: issue.title, description: issue.description }),
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
  const livingTopic = getLivingTopicByIssue(id);

  const speeches = getSpeechesByIds(issue.relatedSpeechIds).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const legById = new Map(getLegislators().map((l) => [l.id, l]));
  const items: CrossLayerItem[] = speeches.map((speech) => ({
    speech,
    legislator: legById.get(speech.legislatorId),
  }));

  const relatedFactCards = getRelatedFactCardsForIssue(issue, getFactCards());

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/issues" className="link-ink">
          ← 争点一覧
        </Link>
      </p>

      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium tracking-wider text-accent">愛知の争点（国・県・市）</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-[1.05]">
          {livingTopic?.pageTitle ?? issue.title}
        </h1>
        <p className="measure mt-3 text-muted">{livingTopic?.summary ?? issue.description}</p>
        {livingTopic && <p className="mt-3 text-xs text-muted">「{issue.title}」の具体的な制度・計画を読むページです。背景解説と関連記録は下に掲載しています。</p>}
      </header>

      {livingTopic && <LivingTopicBrief topic={livingTopic} />}

      {/* 01 解説（ガイド層）⇄ 02 記録（データ層）の振り子構造。往復リンクで“意味↔事実”を行き来できる。 */}
      <section id="explainer" className="scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <div className="flex items-baseline gap-3">
            <span className="num-display tnum text-sm text-faint">01</span>
            <h2 className="font-display text-2xl">解説</h2>
          </div>
          <a href="#records" className="link-ink text-sm">
            記録を見る ↓
          </a>
        </div>
        <div className="mt-5">{explainer && (livingTopic ? <details className="rounded-2xl border border-line p-4">
            <summary className="cursor-pointer text-sm font-medium">背景解説を読む（制度・計画の現況は上の確認日付き資料をご覧ください）</summary>
            <p className="my-3 text-xs text-muted">以前の説明を背景資料として掲載しています。確認日が未記録の説明・数値を現在値として扱わないでください。</p>
            <IssueExplainerCard ex={explainer} />
          </details> : <IssueExplainerCard ex={explainer} />)}</div>
      </section>

      <section id="records" className="scroll-mt-24">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
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

      {relatedFactCards.length > 0 && (
        <section id="related-facts" className="scroll-mt-24 border-t border-line pt-6">
          <p className="eyebrow text-faint">関連する事実カード</p>
          <div className="mt-3">
            {relatedFactCards.map((card) => (
              <Link
                key={card.id}
                href={`/facts/${card.id}/`}
                className="group grid grid-cols-[auto_1fr] items-baseline gap-3 border-t border-line py-4 transition-colors last:border-b hover:bg-subtle"
              >
                <FactCardType type={card.cardType} />
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-bold">{card.title}</span>
                  <span
                    aria-hidden
                    className="text-faint transition-colors group-hover:text-accent"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
