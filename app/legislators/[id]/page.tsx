import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  getFunding,
  getLegislator,
  getLegislatorProfile,
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
import { LAST_UPDATED } from "@/lib/site-meta";

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
  const profile = getLegislatorProfile(id);
  const voteTally = votes.reduce(
    (acc, v) => {
      acc[v.result] = (acc[v.result] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
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
        <p className="mt-1 text-xs text-faint">
          情報の基準日：{LAST_UPDATED}（所属・役職は改選や異動で変わります）
        </p>
      </header>

      {/* プロフィール（当選回数・役職・委員会）。出典つき・公開情報。 */}
      {profile &&
        (profile.electionCount > 0 ||
          profile.positions.length > 0 ||
          profile.committees.length > 0) && (
          <section className="border-l-2 border-line bg-subtle px-4 py-4">
            <div className="space-y-2 text-sm">
              {profile.electionCount > 0 && (
                <p>
                  <span className="eyebrow text-faint">当選</span>{" "}
                  <span className="font-display tnum text-lg">{profile.electionCount}</span> 回
                </p>
              )}
              {profile.positions.length > 0 && (
                <p className="measure">
                  <span className="eyebrow text-faint">主な役職</span>{" "}
                  {profile.positions.join("・")}
                </p>
              )}
              {profile.committees.length > 0 && (
                <p className="measure">
                  <span className="eyebrow text-faint">所属委員会</span>{" "}
                  {profile.committees.join("・")}
                </p>
              )}
            </div>
            <p className="mt-3 text-xs">
              <SourceLink href={profile.sourceUrl}>プロフィール出典</SourceLink>
            </p>
          </section>
        )}

      {/* 言×行（言ったこと＝発言／やったこと＝採決）の並置。国会議員で両方の記録があるとき。 */}
      {legislator.level === "national" && (
        <section className="grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-5">
            <p className="eyebrow text-faint">言ったこと（発言）</p>
            <p className="font-display tnum mt-2 text-3xl">
              {speeches.length}
              <span className="ml-1 text-base font-normal text-muted">件</span>
            </p>
            <p className="mt-1 text-xs text-muted">国会会議録より（各発言に出典）</p>
          </div>
          <div className="bg-surface p-5">
            <p className="eyebrow text-faint">やったこと（採決）</p>
            <p className="font-display tnum mt-2 text-3xl">
              {votes.length}
              <span className="ml-1 text-base font-normal text-muted">件</span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {votes.length > 0
                ? `●賛成${voteTally.yea ?? 0}・✕反対${voteTally.nay ?? 0}${
                    (voteTally.absent ?? 0) > 0 ? `・—欠席${voteTally.absent}` : ""
                  }（記名投票のみ個別公開）`
                : house === "衆議院"
                  ? "衆院は起立採決が多く、個別の賛否は原則非公開（記名投票のときのみ公開）"
                  : "記名投票の個別賛否はデータ整備中"}
            </p>
          </div>
        </section>
      )}

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
