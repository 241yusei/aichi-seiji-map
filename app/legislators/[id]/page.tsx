import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getFunding,
  getLegislator,
  getLegislators,
  getSpeechesByLegislator,
  getVotes,
} from "@/lib/data";
import { SpeechCard } from "@/components/SpeechCard";
import { SourceLink } from "@/components/SourceLink";
import { VoteTable } from "@/components/VoteTable";
import { FundingPanel } from "@/components/FundingPanel";
import { minutesFor } from "@/lib/sources/linkout";
import { municipalityByGov } from "@/lib/municipalities";

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
  const minutesSearch = minutesFor(legislator);
  const house: "衆議院" | "参議院" = legislator.district.includes("選挙区") ? "参議院" : "衆議院";
  const layerLabel =
    legislator.level === "national"
      ? "国会（愛知選出）"
      : legislator.level === "prefectural"
        ? "愛知県議会"
        : (municipalityByGov(legislator.govCode)?.council ?? "市議会");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: legislator.name,
    jobTitle: layerLabel,
    ...(legislator.party ? { affiliation: legislator.party } : {}),
    homeLocation: { "@type": "AdministrativeArea", name: legislator.district },
    url: legislator.sourceUrl,
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* プロフィール */}
      <header className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded bg-accent-weak px-2 py-0.5 text-xs font-medium text-accent">
            {layerLabel}
          </span>
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
        {speeches.length > 0 ? (
          <>
            <p className="mt-1 text-xs text-muted">
              出典は国会会議録。AI要約は補助情報で、必ず原文リンクを併記しています。
            </p>
            <div className="mt-4 space-y-3">
              {speeches.map((s) => (
                <SpeechCard key={s.id} speech={s} />
              ))}
            </div>
          </>
        ) : minutesSearch ? (
          <div className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm text-muted">
            <p>
              本サイトは各サイトの利用規約・robots.txt に配慮し、
              {layerLabel}の発言本文は転載していません。
              この議員の発言は、公式の会議録検索システムでご確認いただけます。
            </p>
            <p className="mt-2">
              <SourceLink href={minutesSearch.url}>{minutesSearch.label} ↗</SourceLink>
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">発言データは準備中です。</p>
        )}
      </section>

      {/* 採決・政治資金（国会議員のみ） */}
      {legislator.level === "national" && (
        <>
          <section>
            <h2 className="text-lg font-bold">採決</h2>
            <div className="mt-2">
              <VoteTable votes={votes} house={house} />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold">政治資金</h2>
            <div className="mt-2">
              <FundingPanel funding={funding} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
