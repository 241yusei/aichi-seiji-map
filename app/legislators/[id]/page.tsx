import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
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

// ナンバリング付きセクション見出し（エディトリアル）。
function SectionHead({ n, title, meta }: { n: string; title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-b-2 border-ink pb-2">
      <span className="font-display tnum text-sm text-faint">{n}</span>
      <h2 className="font-display text-2xl">{title}</h2>
      {meta != null && <span className="tnum text-sm text-muted">{meta}</span>}
    </div>
  );
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
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* プロフィール */}
      <header className="border-b-2 border-ink pb-6">
        <span className="inline-flex items-center border border-ink px-2 py-0.5 text-xs font-bold text-ink">
          {layerLabel}
        </span>
        <h1 className="font-display mt-3 text-[clamp(2rem,6vw,3.5rem)] leading-[1.04]">
          {legislator.name}
        </h1>
        <p className="mt-2 text-muted">
          {legislator.kana && <span className="text-faint">{legislator.kana}　</span>}
          {legislator.district}
          {legislator.party ? <span className="text-faint"> ・ {legislator.party}</span> : null}
        </p>
        <p className="mt-3 text-xs">
          <SourceLink href={legislator.sourceUrl}>公式プロフィール・出典</SourceLink>
        </p>
      </header>

      {/* 01 発言 */}
      <section>
        <SectionHead n="01" title="発言" meta={`${speeches.length}件`} />
        <div className="mt-5">
          {speeches.length > 0 ? (
            <>
              <p className="text-xs text-faint">
                出典は国会会議録。AI要約は補助情報で、必ず原文リンクを併記しています。
              </p>
              <div className="mt-4 space-y-3">
                {speeches.map((s) => (
                  <SpeechCard key={s.id} speech={s} />
                ))}
              </div>
            </>
          ) : minutesSearch ? (
            <div className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
              <p>
                本サイトは各サイトの利用規約・robots.txt に配慮し、{layerLabel}
                の発言本文は転載していません。この議員の発言は、公式の会議録検索システムでご確認いただけます。
              </p>
              <p className="mt-2">
                <SourceLink href={minutesSearch.url}>{minutesSearch.label}</SourceLink>
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">発言データは準備中です。</p>
          )}
        </div>
      </section>

      {/* 採決・政治資金（国会議員のみ） */}
      {legislator.level === "national" && (
        <>
          <section>
            <SectionHead n="02" title="採決" />
            <div className="mt-5">
              <VoteTable votes={votes} house={house} />
            </div>
          </section>

          <section>
            <SectionHead n="03" title="政治資金" meta={funding.length > 0 ? `${funding.length}団体` : undefined} />
            <div className="mt-5">
              <FundingPanel funding={funding} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
