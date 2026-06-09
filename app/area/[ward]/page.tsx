import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NAGOYA_WARDS, wardBySlug, type LegBrief } from "@/lib/area";
import {
  getLegislators,
  getLegislatorProfile,
  getFunding,
  getSpeechesByLegislator,
  getIssueExplainer,
  getFactCards,
  getExecutiveByGov,
} from "@/lib/data";
import type { Legislator } from "@/lib/types";
import { SourceLink } from "@/components/SourceLink";
import { ShareButton } from "@/components/ShareButton";
import { FactCardType } from "@/components/FactCardView";
import { formatYen } from "@/lib/format";
import { LAST_UPDATED } from "@/lib/site-meta";

export function generateStaticParams() {
  return NAGOYA_WARDS.map((w) => ({ ward: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ward: string }>;
}): Promise<Metadata> {
  const { ward } = await params;
  const w = wardBySlug(ward);
  if (!w) return { title: "地域" };
  return {
    title: `名古屋市${w.ward}の代表者`,
    description: `名古屋市${w.ward}を代表する国会・愛知県議会・名古屋市会の議員と首長を、一次ソース付きでまとめて確認できます。`,
  };
}

// 「事実の一行」＝既存データから1点（略歴→政治資金規模→直近発言の順）。国会議員のみ厚い。
function factLine(l: Legislator): string | undefined {
  if (l.level !== "national") return undefined;
  const p = getLegislatorProfile(l.id);
  if (p?.summary) return p.summary;
  const f = getFunding(l.id);
  const inc = f.reduce((s, x) => s + (x.totalIncome ?? 0), 0);
  if (inc > 0) return `政治資金：約${formatYen(inc)}規模（${f[0].year}年・出典あり）`;
  const sp = getSpeechesByLegislator(l.id);
  if (sp.length) return `直近の発言：「${sp[0].body}」ほか計${sp.length}件（出典あり）`;
  return undefined;
}

function brief(l: Legislator): LegBrief {
  return { id: l.id, name: l.name, district: l.district, party: l.party, fact: factLine(l) };
}

function Group({ title, items, note }: { title: string; items: LegBrief[]; note?: string }) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="eyebrow text-faint">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted">該当なし（欠員など）</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((l) => (
            <li key={l.id} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
              <Link href={`/legislators/${l.id}/`} className="link-ink font-bold">
                {l.name}
              </Link>
              <span className="ml-1 text-xs text-faint">
                {l.district}
                {l.party ? `・${l.party}` : ""}
              </span>
              {l.fact && <p className="measure mt-1 text-xs text-muted">{l.fact}</p>}
            </li>
          ))}
        </ul>
      )}
      {note && <p className="mt-2 text-xs text-faint">{note}</p>}
    </div>
  );
}

// この地域で話題になりやすい争点（名古屋市政・愛知に効くもの）。
const WARD_ISSUE_IDS = ["nagoya-castle", "linear", "asian-games-2026", "transit", "kosodate"];

export default async function WardDashboardPage({
  params,
}: {
  params: Promise<{ ward: string }>;
}) {
  const { ward } = await params;
  const w = wardBySlug(ward);
  if (!w) notFound();

  const legs = getLegislators();
  const national = legs.filter((l) => l.level === "national");
  const pref = legs.filter((l) => l.level === "prefectural");
  const muni = legs.filter((l) => l.level === "municipal");

  const shugiin = national.filter((l) => l.district === w.shugiin).map(brief);
  const sangiin = national.filter((l) => l.district === "愛知県選挙区").map(brief);
  const kengikai = pref.filter((l) => l.district === w.prefDistrict).map(brief);
  const shikai = muni.filter((l) => l.district === w.prefDistrict).map(brief);

  const governor = getExecutiveByGov("23000"); // 愛知県知事
  const mayor = getExecutiveByGov("23100"); // 名古屋市長
  const execs = [governor, mayor].filter(Boolean);

  const issues = WARD_ISSUE_IDS.map((id) => getIssueExplainer(id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );
  const cards = getFactCards().slice(0, 2);

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">
          <Link href="/area/" className="link-ink">
            ← 地域から探す
          </Link>
        </p>
        <h1 className="font-display mt-3 text-[clamp(1.9rem,6vw,3.2rem)] leading-tight">
          名古屋市{w.ward}の代表者
        </h1>
        <p className="measure mt-3 text-muted">
          あなたの暮らしを決めている、国・県・市の代表者と首長です。氏名から発言・採決・政治資金（出典つき）に進めます。
        </p>
        <p className="mt-2 text-xs text-faint">情報の基準日：{LAST_UPDATED}（改選・異動で変わります）</p>
      </header>

      {/* 首長（決める人のトップ） */}
      {execs.length > 0 && (
        <section>
          <h2 className="eyebrow text-accent-deep">首長（行政のトップ）</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {execs.map((e) => (
              <div key={e!.id} className="border border-line bg-surface p-4">
                <p className="eyebrow text-faint">{e!.area}</p>
                <p className="mt-1 font-bold">
                  {e!.title}：{e!.name}
                  {e!.party ? <span className="text-xs text-faint"> ・{e!.party}</span> : null}
                </p>
                <p className="mt-2 text-xs">
                  <SourceLink href={e!.sourceUrl}>公式・出典</SourceLink>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 三層の議員（事実の一行つき） */}
      <section>
        <h2 className="eyebrow text-accent-deep">あなたの議員（国・県・市）</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Group title="衆議院（小選挙区）" items={shugiin} />
          <Group title="参議院（愛知県選挙区）" items={sangiin} />
          <Group
            title="愛知県議会"
            items={kengikai}
            note="発言は公式会議録でご確認いただけます（各議員ページにリンク）。"
          />
          <Group
            title="名古屋市会"
            items={shikai}
            note="発言は公式会議録でご確認いただけます（各議員ページにリンク）。"
          />
        </div>
      </section>

      {/* この地域に効く争点 */}
      {issues.length > 0 && (
        <section>
          <h2 className="eyebrow text-accent-deep">この地域に効く争点</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {issues.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/issues/${ex.id}/`}
                  className="group block py-3 transition-colors hover:bg-subtle"
                >
                  <span className="font-bold group-hover:text-accent-deep">{ex.oneLine}</span>
                  {ex.youEffect && (
                    <span className="measure mt-1 block text-xs text-muted">
                      あなたに効く：{ex.youEffect}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <Link href="/issues/" className="link-ink">
              すべての争点を見る →
            </Link>
            <Link href="/decisions/" className="link-ink">
              議会の議決（県・市の主要議案）→
            </Link>
          </p>
        </section>
      )}

      {/* 次の選挙（予定）＝「知ってから、選ぶ」の“選ぶ機会”を示す。日程の事実のみ。 */}
      <section className="zone-calm p-5">
        <p className="eyebrow text-accent-deep">次の選挙（予定）</p>
        <p className="measure mt-2 text-sm text-muted">
          知事選 <span className="tnum font-bold text-ink">2027年2月ごろ</span>
          ／県議・名古屋市議 <span className="tnum font-bold text-ink">2027年4月ごろ（統一地方選）</span>。
          時期は任期満了に基づく見込みで、告示で確定します。
        </p>
        <p className="mt-2 text-sm">
          <Link href="/vote-guide/" className="link-ink">
            投票ガイド（日程一覧・投票の基本）→
          </Link>
        </p>
      </section>

      {/* 注目の事実カード */}
      {cards.length > 0 && (
        <section>
          <h2 className="eyebrow text-accent-deep">記録から見える事実</h2>
          <div className="mt-3 grid gap-px border border-line bg-line sm:grid-cols-2">
            {cards.map((c) => (
              <Link
                key={c.id}
                href={`/facts/${c.id}/`}
                className="group flex flex-col bg-surface p-5 transition-colors hover:bg-subtle"
              >
                <FactCardType type={c.cardType} />
                <h3 className="font-display mt-2 text-lg leading-snug">{c.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{c.hook}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 共有 */}
      <section className="border-t border-line pt-6">
        <ShareButton title={`名古屋市${w.ward}の代表者｜政治のトリセツ あいち・なごや`} />
      </section>
    </div>
  );
}
