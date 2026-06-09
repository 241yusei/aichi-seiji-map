import type { Metadata } from "next";
import { getCouncilDecisions } from "@/lib/data";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED } from "@/lib/site-meta";
import type { CouncilDecision } from "@/lib/types";

export const metadata: Metadata = {
  title: "議会の議決（会期×主要議案）",
  description:
    "名古屋市会・愛知県議会が会期ごとに何を可決・否決したか（主要議案）を、公式の審議結果に出典リンク付きで。会派別の賛否は出典資料で、個々の議員の賛否は原則非公開。",
};

// 会派別賛否（出典あり）への案内。県は公式の結果概要へ linkout。
const FACTION_SOURCES: { council: string; label: string; url: string }[] = [
  {
    council: "名古屋市会",
    label: "名古屋市会：議案の審議経過・結果（公式）",
    url: "https://www.city.nagoya.jp/shikai/category/335-0-0-0-0-0-0-0-0-0.html",
  },
  {
    council: "愛知県議会",
    label: "愛知県議会：定例議会・臨時議会 結果概要（公式）",
    url: "https://www.pref.aichi.jp/site/gikai/kekka-gaiyo.html",
  },
];

function ResultBadge({ result }: { result: string }) {
  const tone = result.includes("否決") ? "border-nay text-nay" : "border-ink text-ink";
  return (
    <span className={`inline-block whitespace-nowrap border px-2 py-0.5 text-xs font-bold ${tone}`}>
      {result}
    </span>
  );
}

export default function DecisionsPage() {
  const decisions = getCouncilDecisions();

  // 議会｜会期 でグループ化（新しい会期が上に来るよう、ひとまず登録順を尊重）。
  const groups = new Map<string, CouncilDecision[]>();
  for (const d of decisions) {
    const key = `${d.council}｜${d.session}`;
    const arr = groups.get(key) ?? [];
    arr.push(d);
    groups.set(key, arr);
  }

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Council Decisions</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">議会の議決</h1>
        <p className="measure mt-3 text-muted">
          名古屋市会・愛知県議会が会期ごとに何を可決・否決したか（主要議案）を、公式の審議結果に出典リンク付きでまとめます。
        </p>
        <p className="mt-2 text-xs text-faint">情報の基準日：{LAST_UPDATED}</p>
      </header>

      {/* 読み方の注意（中立・粒度の明示） */}
      <div className="zone-calm card-soft p-5">
        <p className="eyebrow text-accent-deep">読み方の注意</p>
        <ul className="measure mt-2 space-y-1.5 text-sm text-muted">
          <li>各議案の議決結果（可決/否決/修正可決など）は、公式の審議結果ページに基づきます。</li>
          <li>
            <span className="font-bold text-ink">会派ごとの賛否</span>
            は、各議会の公式資料（下記リンク）で確認できます。
          </li>
          <li>
            <span className="font-bold text-ink">個々の議員の賛否は原則非公開</span>
            です（多くは会派単位での公表）。本サイトは評価をせず、記録と出典のみを示します。
          </li>
        </ul>
      </div>

      {decisions.length === 0 ? (
        <p className="text-sm text-muted">議決データは準備中です。</p>
      ) : (
        [...groups.entries()].map(([key, items]) => {
          const [council, session] = key.split("｜");
          return (
            <section key={key}>
              <h2 className="font-display border-b-2 border-ink pb-2 text-xl sm:text-2xl">
                {council}
                <span className="ml-2 text-sm font-normal text-muted">{session}</span>
              </h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {items.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                    {d.billNumber && (
                      <span className="tnum text-xs font-bold text-faint">{d.billNumber}</span>
                    )}
                    <span className="grow text-sm font-bold text-ink">{d.billTitle}</span>
                    {d.category && <span className="eyebrow text-faint">{d.category}</span>}
                    <ResultBadge result={d.result} />
                    <SourceLink href={d.sourceUrl}>出典</SourceLink>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {/* 会派別賛否・他会期は公式へ */}
      <section className="border-t border-line pt-6">
        <p className="eyebrow text-faint">会派別の賛否・他の会期（公式）</p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {FACTION_SOURCES.map((s) => (
            <li key={s.url}>
              <SourceLink href={s.url}>{s.label}</SourceLink>
            </li>
          ))}
        </ul>
        <p className="measure mt-3 text-xs text-faint">
          本サイトは主要議案を抜粋して掲載しています。すべての議案・会派別の賛否は、上記の公式資料でご確認ください。
        </p>
      </section>
    </div>
  );
}
