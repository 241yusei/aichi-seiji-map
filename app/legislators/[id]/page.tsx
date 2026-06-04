import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFunding,
  getLegislator,
  getLegislators,
  getSpeechesByLegislator,
  getVotes,
} from "@/lib/data";
import { LevelBadge } from "@/components/LevelBadge";
import { SpeechCard } from "@/components/SpeechCard";
import { SourceLink } from "@/components/SourceLink";

export function generateStaticParams() {
  return getLegislators().map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = getLegislator(id);
  if (!l) return { title: "議員" };
  return {
    title: `${l.name}（${l.district}）`,
    description: `${l.name}（${l.district}${l.party ? `・${l.party}` : ""}）の発言・採決・政治資金を一次ソース付きで。`,
  };
}

export default async function LegislatorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const legislator = getLegislator(id);
  if (!legislator) notFound();

  const speeches = getSpeechesByLegislator(id);
  const votes = getVotes(id);
  const funding = getFunding(id);

  return (
    <div className="space-y-8">
      {/* プロフィール */}
      <header className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={legislator.level} full />
          <h1 className="text-2xl font-bold">{legislator.name}</h1>
          <span className="text-sm text-muted">{legislator.kana}</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          {legislator.district}
          {legislator.party ? ` ・ ${legislator.party}` : ""}
        </p>
        <p className="mt-3 text-xs">
          <SourceLink href={legislator.sourceUrl}>公式プロフィール・出典 ↗</SourceLink>
        </p>
      </header>

      {/* 発言 */}
      <section>
        <h2 className="text-lg font-bold">
          発言 <span className="text-sm font-normal text-muted">（{speeches.length} 件）</span>
        </h2>
        <p className="mt-1 text-xs text-muted">
          出典は国会会議録。AI要約は補助情報で、必ず原文リンクを併記しています。
        </p>
        {speeches.length === 0 ? (
          <p className="mt-4 text-sm text-muted">発言データは準備中です。</p>
        ) : (
          <div className="mt-4 space-y-3">
            {speeches.map((s) => (
              <SpeechCard key={s.id} speech={s} />
            ))}
          </div>
        )}
      </section>

      {/* 採決（M4 で本実装） */}
      <section>
        <h2 className="text-lg font-bold">採決</h2>
        {votes.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            採決データは順次追加します。記名投票でない採決は「個人の賛否は非公開」と明示します。
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {votes.map((v, i) => (
              <li key={i}>
                {v.billTitle}：{v.result}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 政治資金（M4 で本実装） */}
      <section>
        <h2 className="text-lg font-bold">政治資金</h2>
        {funding.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            政治資金は総務省の収支報告書を出典に、主要項目のみを順次追加します。
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {funding.map((f, i) => (
              <li key={i}>
                {f.year}年 <SourceLink href={f.sourceUrl}>出典</SourceLink>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
