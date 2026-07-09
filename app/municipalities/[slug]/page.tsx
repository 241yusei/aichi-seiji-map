import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExecutiveByGov, getLegislators } from "@/lib/data";
import { MUNICIPALITIES, municipalityBySlug } from "@/lib/municipalities";
import { regionOf } from "@/lib/regions";
import { LegislatorCard } from "@/components/LegislatorCard";
import { SourceLink } from "@/components/SourceLink";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return MUNICIPALITIES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = municipalityBySlug(slug);
  if (!m) return { title: "市町村" };
  // 「○○市 市長選 いつ」「○○市 市長 任期」系の検索クエリに任期満了データで答える。
  const exec = getExecutiveByGov(m.govCode);
  if (exec?.termEnd) {
    return {
      title: `${m.city}の議員一覧と${exec.title}｜次の${exec.title}選はいつ`,
      description: `${m.city}の${exec.title}・${exec.name}の任期満了は${formatDate(exec.termEnd)}（次の${exec.title}選の時期の目安）。${m.council}の議員一覧と会議録への導線を、一次ソース付きで。`,
      alternates: { canonical: `/municipalities/${slug}/` },
    };
  }
  return {
    title: `${m.city}（${m.council}・首長）`,
    description: `${m.city}の${m.council}の議員と首長を、一次ソース付きで。会議録検索への導線も。`,
    alternates: { canonical: `/municipalities/${slug}/` },
  };
}

export default async function MunicipalityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = municipalityBySlug(slug);
  if (!m) notFound();

  const exec = getExecutiveByGov(m.govCode);
  const members = getLegislators()
    .filter((l) => l.level === "municipal" && l.govCode === m.govCode)
    .sort((a, b) => a.kana.localeCompare(b.kana, "ja"));
  const region = regionOf(m.govCode);

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">
          {region ? `${region.name}地域` : "愛知県"} ／ Municipality
        </p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">{m.city}</h1>
        <p className="mt-2 text-muted">
          {m.council}・議員 {members.length}名{exec ? `／${exec.title} ${exec.name}` : ""}
        </p>
      </header>

      {/* 首長 */}
      <section>
        <h2 className="eyebrow text-accent-deep">首長</h2>
        {exec ? (
          <div className="mt-3 border-t border-line pt-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-base">
                <span className="font-bold">{exec.name}</span>
                {exec.kana && <span className="ml-2 text-xs text-faint">{exec.kana}</span>}
                <span className="ml-2 text-sm text-muted">{exec.title}</span>
              </p>
              <span className="text-xs">
                <SourceLink href={exec.sourceUrl}>公式プロフィール</SourceLink>
              </span>
            </div>
            {exec.termEnd && (
              <p className="tnum mt-2 text-sm text-muted">
                任期満了：<span className="font-bold text-ink">{formatDate(exec.termEnd)}</span>
                <span className="ml-2 text-xs text-faint">
                  （次の{exec.title}選はこのころまでに行われます
                  {exec.termSourceUrl ? "・" : "）"}
                </span>
                {exec.termSourceUrl && (
                  <span className="text-xs">
                    <SourceLink href={exec.termSourceUrl}>出典</SourceLink>
                    <span className="text-faint">）</span>
                  </span>
                )}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">首長データは準備中です。</p>
        )}
      </section>

      {/* 議員 */}
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
          <h2 className="font-display text-2xl">{m.council}</h2>
          <span className="tnum text-sm text-muted">{members.length}名</span>
        </div>
        {members.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((l) => (
              <LegislatorCard key={l.id} legislator={l} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">議員データは準備中です。</p>
        )}
      </section>

      {/* 会議録 */}
      <section className="border-t border-line pt-5">
        <h2 className="eyebrow text-faint">発言・会議録</h2>
        <p className="measure mt-2 text-sm text-muted">
          本サイトは各サイトの規約・robots.txt に配慮し、{m.council}
          の発言本文は転載していません。発言は公式の会議録検索でご確認ください。
        </p>
        {m.minutesUrl ? (
          <p className="mt-2 text-sm">
            <SourceLink href={m.minutesUrl}>{m.minutesLabel}</SourceLink>
          </p>
        ) : (
          <p className="mt-2 text-xs text-faint">
            {m.city}は外部の会議録検索システムがなく、公式サイトのPDF等でご確認ください。
          </p>
        )}
      </section>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/municipalities" className="link-ink">
          ← 市町村一覧
        </Link>
        <Link href="/executives" className="hover:text-accent-deep">
          首長一覧
        </Link>
        <Link href="/area" className="hover:text-accent-deep">
          郵便番号で探す
        </Link>
      </nav>
    </div>
  );
}
