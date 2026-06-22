import type { Metadata } from "next";
import Link from "next/link";
import { getLegislators } from "@/lib/data";
import { DataBar } from "@/components/DataBar";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED } from "@/lib/site-meta";
import type { Legislator } from "@/lib/types";

export const metadata: Metadata = {
  title: "政党・会派の勢力図｜愛知の三層",
  description:
    "国会(愛知選出)・愛知県議会・名古屋市会の会派構成を、人数の多い順に可視化。どの会派が大きいかを一次ソース付きで。中立・投票誘導なし。",
};

function tally(list: Legislator[]): { label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const l of list) {
    const k = l.party && l.party.trim() ? l.party : "無所属・不明";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function LayerSection({
  title,
  total,
  rows,
  color,
  source,
}: {
  title: string;
  total: number;
  rows: { label: string; count: number }[];
  color: string;
  source: { label: string; url: string };
}) {
  const max = rows[0]?.count ?? 1;
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
        <h2 className="font-display text-2xl">{title}</h2>
        <span className="tnum text-sm text-muted">{total}人・{rows.length}会派</span>
      </div>
      <div className="mt-4">
        {rows.map((r) => (
          <DataBar
            key={r.label}
            label={r.label}
            value={r.count}
            max={max}
            valueLabel={`${r.count}`}
            color={color}
          />
        ))}
      </div>
      <p className="chart-note mt-3">
        出典：<SourceLink href={source.url}>{source.label}</SourceLink>
        。会派の大きさは選挙結果の反映で、優劣を示すものではありません。
      </p>
    </section>
  );
}

export default function PartiesPage() {
  const all = getLegislators();
  const national = all.filter((l) => l.level === "national");
  const pref = all.filter((l) => l.level === "prefectural");
  const nagoya = all.filter((l) => l.level === "municipal" && l.govCode === "23100");
  const municipalAll = all.filter((l) => l.level === "municipal");
  const muniIndep = municipalAll.filter((l) => (l.party ?? "").includes("無所属")).length;

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Parties</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          政党・会派の勢力図
        </h1>
        <p className="measure mt-3 text-muted">
          愛知の政治を三層（国会・県議会・名古屋市会）で見たときの会派構成です。人数の多い順に並べました。
          数字はすべて公式名簿に基づきます。どの会派がいい・悪いではなく、勢力の分布を事実として示します。
        </p>
      </header>

      <LayerSection
        title="国会（愛知選出）"
        total={national.length}
        rows={tally(national)}
        color="var(--color-chart-national)"
        source={{
          label: "衆議院・参議院 議員一覧（公式）",
          url: "https://www.shugiin.go.jp/internet/itdb_annai.nsf/html/statics/syu/1giin.htm",
        }}
      />

      <LayerSection
        title="愛知県議会"
        total={pref.length}
        rows={tally(pref)}
        color="var(--color-chart-pref)"
        source={{
          label: "愛知県議会 会派別議員（公式）",
          url: "https://www.pref.aichi.jp/site/gikai/giin-kaiha.html",
        }}
      />

      <LayerSection
        title="名古屋市会"
        total={nagoya.length}
        rows={tally(nagoya)}
        color="var(--color-chart-municipal)"
        source={{
          label: "名古屋市会 会派別議員数（公式）",
          url: "https://www.city.nagoya.jp/shikai/about/1030778/1030800.html",
        }}
      />

      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">市町村議会は「無所属」が中心</h2>
        <p className="measure mt-2 text-sm text-ink">
          名古屋市以外の市町村議会（53市町村・計{municipalAll.length - nagoya.length}人）では、特定の政党に属さない「無所属」や
          地域ごとの会派が多くを占めます（全市町村議{municipalAll.length}人のうち無所属系は{muniIndep}人）。
          各市の会派や代表は、市町村ページでご確認いただけます。
        </p>
        <p className="mt-3 text-sm">
          <Link href="/municipalities" className="link-ink">
            市町村から会派を見る →
          </Link>
        </p>
      </section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。会派名は公式名簿の表記に基づきます（政党名と完全には一致しない地域会派を含む）。
        改選などで変わった場合は順次更新します。特定の政党・候補者への投票は呼びかけません。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/legislators" className="link-ink">
          議員一覧
        </Link>
        <Link href="/facts" className="hover:text-accent-deep">
          事実カード
        </Link>
        <Link href="/compare" className="hover:text-accent-deep">
          議員をくらべる
        </Link>
      </nav>
    </div>
  );
}
