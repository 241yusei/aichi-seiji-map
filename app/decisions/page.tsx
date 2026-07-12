import type { Metadata } from "next";
import { getCouncilDecisions, getLegislator } from "@/lib/data";
import Link from "next/link";
import { SourceLink } from "@/components/SourceLink";
import { getDivergences, MIN_FACTION_SIZE } from "@/lib/faction-divergence";
import { formatDate } from "@/lib/format";
import { LAST_UPDATED } from "@/lib/site-meta";
import type { CouncilDecision } from "@/lib/types";

export const metadata: Metadata = {
  title: "議会の議決（会期×主要議案）",
  description:
    "名古屋市会・愛知県議会が会期ごとに何を可決・否決したか（主要議案）を、公式の審議結果に出典リンク付きで。会派別の賛否は出典資料で、個々の議員の賛否は原則非公開。",
  alternates: { canonical: "/decisions/" },
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
  {
    council: "愛知県議会",
    label: "愛知県議会：令和8年2月定例議会 議案等に対する各会派の態度（公式PDF）",
    url: "https://www.pref.aichi.jp/uploaded/attachment/608408.pdf",
  },
];

// 会派の態度チップ（賛成=緑○・反対=朱✕・分裂=ink。色だけに頼らず必ず記号＋ラベル）。
function FactionStance({ name, stance }: { name: string; stance: string }) {
  const tone =
    stance === "賛成" ? "text-yea" : stance === "反対" ? "text-nay" : "text-ink";
  const mark = stance === "賛成" ? "○" : stance === "反対" ? "✕" : "";
  return (
    <span className="whitespace-nowrap text-xs">
      <span className="text-faint">{name}</span>{" "}
      <span className={`font-bold ${tone}`}>
        {mark}
        {stance}
      </span>
    </span>
  );
}

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
  const divergence = getDivergences();

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
      <header className="border-b-[3px] border-ink pb-6">
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
            は、公式の会派態度資料がある会期について各議案の下に表示しています（○=賛成・✕=反対。
            会派の略称・正式名称は出典資料の凡例に基づきます）。資料が無い会期は下記の公式リンクへ。
          </li>
          <li>
            <span className="font-bold text-ink">個々の議員の賛否は原則非公開</span>
            です（多くは会派単位での公表）。本サイトは評価をせず、記録と出典のみを示します。
          </li>
          <li>
            「修正可決」「附帯決議」などのことばは{" "}
            <Link href="/glossary/" className="link-ink">
              用語集
            </Link>
            でやさしく説明しています。
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
              <h2 className="font-display border-b-[3px] border-ink pb-2 text-xl sm:text-2xl">
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
                    {d.factions && d.factions.length > 0 && (
                      <span className="flex w-full flex-wrap gap-x-4 gap-y-1 pt-1">
                        {d.factions.map((f) => (
                          <FactionStance key={f.name} name={f.name} stance={f.stance} />
                        ))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {/* 会派内で判断が分かれた採決（国会・参院記名投票からの機械検出） */}
      <section className="border-t border-line pt-6">
        <h2 className="font-display border-b-[3px] border-ink pb-2 text-xl sm:text-2xl">
          会派内で判断が分かれた採決
          <span className="ml-2 text-sm font-normal text-muted">国会（参議院・記名投票）</span>
        </h2>
        <p className="measure mt-3 text-sm text-muted">
          参議院の記名投票（押しボタン式）は個人ごとの賛否が公開されます。同じ採決で
          <span className="font-bold text-ink">同会派（愛知選出）の多数と異なる賛否</span>
          だった票を機械的に検出し、事実としてここに表示します。会派の正式な賛否指示は非公開のため、
          同会派メンバーの多数を近似として用いています。良し悪しの評価ではありません（
          <Link href="/methodology/" className="link-ink">
            検出方法と限界の開示
          </Link>
          ）。
        </p>

        <div className="mt-4 border border-line bg-surface p-4">
          <p className="eyebrow text-faint">現在の検出状況</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              対象とした記名投票：<span className="tnum font-bold">{divergence.billsAnalyzed}</span> 件
            </li>
            <li>
              {MIN_FACTION_SIZE}人以上の会派があり多数を算出できた採決：{" "}
              <span className="tnum font-bold">{divergence.billsEligible}</span> 件
            </li>
            <li>
              検出された「会派多数と異なる投票」：{" "}
              <span className="tnum font-bold">{divergence.divergenceCount}</span> 件
            </li>
          </ul>
          {divergence.divergenceCount === 0 && (
            <p className="measure mt-2 text-xs text-muted">
              現在のデータでは、多くの採決で各会派の愛知選出議員が {MIN_FACTION_SIZE}{" "}
              人に満たず、会派多数と異なる投票は検出されていません。検出0件は「造反が無かった」
              という断定ではなく、この範囲・この方法では検出されなかったという事実です。
              データが増えると検出される場合があります。
            </p>
          )}
        </div>

        {divergence.records.length > 0 && (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {divergence.records.map((r) => {
              const leg = getLegislator(r.legislatorId);
              return (
                <li key={`${r.legislatorId}|${r.date}|${r.billTitle}`} className="py-3 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="tnum whitespace-nowrap text-xs text-faint">
                      {formatDate(r.date)}
                    </span>
                    <Link href={`/legislators/${r.legislatorId}/`} className="link-ink font-bold">
                      {leg?.name ?? r.legislatorId}
                    </Link>
                    <span className="text-xs text-faint">
                      {r.faction}（同採決に投票した同会派 {r.factionSize} 人）
                    </span>
                  </div>
                  <p className="mt-1">
                    <SourceLink href={r.sourceUrl}>{r.billTitle}</SourceLink>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    本人：
                    <span className={`font-bold ${r.result === "yea" ? "text-yea" : "text-nay"}`}>
                      {r.result === "yea" ? "○賛成" : "✕反対"}
                    </span>
                    ｜同会派（愛知選出）の多数：
                    {r.factionMajority === "yea" ? "賛成" : "反対"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 予算の中身への導線（財政ページ） */}
      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">議決された予算の中身を見る</h2>
        <p className="measure mt-2 text-sm text-ink">
          令和8年度の愛知県・名古屋市の一般会計予算（県3兆2,224億円・市1兆6,961億円）が、
          何から集められ、何に使われるのか。歳入・歳出・税収の内訳を公式資料に基づいて可視化しています。
        </p>
        <p className="mt-3 text-sm">
          <Link href="/finance/" className="link-ink">
            財政：県と名古屋市の予算 →
          </Link>
        </p>
      </section>

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
