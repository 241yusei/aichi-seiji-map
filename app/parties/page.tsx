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
  alternates: { canonical: "/parties/" },
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

      {/* 国政の政権枠組み（事実のみ・評価語なし）。一次ソース（首相官邸・衆議院・自民党・立憲民主党公式）で確認できた範囲に限定。
          与野党ラベルは「政権参加の有無」という事実のみを示し、優劣は含めない。 */}
      <div className="border-l-2 border-accent bg-subtle px-4 py-3">
        <p className="eyebrow text-accent-deep">国会の政権枠組み（事実）</p>
        <p className="measure mt-1 text-sm text-muted">
          2026年2月8日の第51回衆議院議員総選挙後、2026年2月18日に第2次高市内閣（第105代・内閣総理大臣：高市早苗）が発足しました。
          自由民主党・日本維新の会（日本維新の会は閣外協力）による連立です。
          中道改革連合（立憲民主党・公明党出身議員により2026年1月16日結党）は衆議院で最大野党の会派です。
          上のグラフは愛知選出議員の会派別人数で、政権参加の有無とは別の集計です。
        </p>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <SourceLink href="https://www.kantei.go.jp/jp/rekidainaikaku/105.html">
            首相官邸「第105代 高市早苗」
          </SourceLink>
          <SourceLink href="https://www.shugiin.go.jp/internet/itdb_annai.nsf/html/statics/shiryo/kaiha_m.htm">
            衆議院「会派名及び会派別所属議員数」
          </SourceLink>
          <SourceLink href="https://www.jimin.jp/news/press/211624.html">
            自由民主党「自民党・日本維新の会共同会見」
          </SourceLink>
          <SourceLink href="https://cdp-japan.jp/news/20260116_0071">
            立憲民主党「中道改革連合 結党について」
          </SourceLink>
        </p>
      </div>

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
