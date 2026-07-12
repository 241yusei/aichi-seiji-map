import type { Metadata } from "next";
import Link from "next/link";
import { getSpeeches } from "@/lib/data";
import { THEMES, matchThemeSpeeches } from "@/lib/themes";
import { DataBar } from "@/components/DataBar";

export const metadata: Metadata = {
  title: "テーマから探す（生活の言葉で）",
  description:
    "物価・子育て・医療・働き方・防災・交通など、生活の言葉から愛知選出議員の国会発言（一次ソース付き）を逆引きできます。",
  alternates: { canonical: "/themes/" },
};

export default function ThemesPage() {
  const speeches = getSpeeches();
  // 件数の多い順に並べた横棒ランキング（機械集計・評価ではない）。同数はテーマ順で安定ソート。
  const rows = THEMES.map((t) => ({ t, count: matchThemeSpeeches(t, speeches).length })).sort(
    (a, b) => b.count - a.count || a.t.label.localeCompare(b.t.label, "ja"),
  );
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div>
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Themes</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          テーマから探す
        </h1>
        <p className="measure mt-3 text-muted">
          「物価」「子育て」など生活の言葉から、愛知選出議員の国会発言を逆引きします。
          すべて会議録の一次ソース付き。タグ付けはキーワード一致による機械的なもので、評価はしません。
        </p>
      </header>

      {/* テーマ別件数の横棒ランキング（既存 DataBar を再利用） */}
      <div className="mt-4">
        {rows.map(({ t, count }, i) => (
          <Link
            key={t.id}
            href={`/themes/${t.id}/`}
            className="group block border-t border-line py-4 transition-colors last:border-b hover:bg-subtle"
          >
            <div className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4">
              <span className="num-display tnum text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <DataBar
                  label={t.label}
                  value={count}
                  max={max}
                  valueLabel={`${count} 件`}
                  color="var(--color-chart-national)"
                />
                <p className="measure mt-1 text-sm text-muted">{t.blurb}</p>
              </div>
              <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="measure mt-8 text-xs text-faint">
        件数はキーワード一致の機械集計です。テーマの重要度や優先順位を示すものではありません。
        対象は本サイト収録の国会発言（愛知選出議員）。県・市町村議会の発言は、各争点ページから公式の会議録検索でご確認いただけます。
      </p>
    </div>
  );
}
