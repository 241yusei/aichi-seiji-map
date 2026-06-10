import type { Metadata } from "next";
import Link from "next/link";
import { getSpeeches } from "@/lib/data";
import { THEMES, matchThemeSpeeches } from "@/lib/themes";

export const metadata: Metadata = {
  title: "テーマから探す（生活の言葉で）",
  description:
    "物価・子育て・医療・働き方・防災・交通など、生活の言葉から愛知選出議員の国会発言（一次ソース付き）を逆引きできます。",
};

export default function ThemesPage() {
  const speeches = getSpeeches();
  const rows = THEMES.map((t) => ({ t, count: matchThemeSpeeches(t, speeches).length }));

  return (
    <div>
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Themes</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          テーマから探す
        </h1>
        <p className="measure mt-3 text-muted">
          「物価」「子育て」など生活の言葉から、愛知選出議員の国会発言を逆引きします。
          すべて会議録の一次ソース付き。タグ付けはキーワード一致による機械的なもので、評価はしません。
        </p>
      </header>

      <div className="mt-4">
        {rows.map(({ t, count }, i) => (
          <Link
            key={t.id}
            href={`/themes/${t.id}/`}
            className="group grid grid-cols-[2.5rem_1fr_auto_auto] items-baseline gap-4 border-t border-line py-5 transition-colors last:border-b hover:bg-subtle"
          >
            <span className="num-display tnum text-faint">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <span className="font-display block text-lg sm:text-xl">{t.label}</span>
              <span className="measure mt-0.5 block text-sm text-muted">{t.blurb}</span>
            </span>
            <span className="tnum whitespace-nowrap text-sm text-muted">
              <span className="font-bold text-ink">{count}</span> 件
            </span>
            <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
              →
            </span>
          </Link>
        ))}
      </div>

      <p className="measure mt-8 text-xs text-faint">
        対象は本サイト収録の国会発言（愛知選出議員）。県・市町村議会の発言は、各争点ページから公式の会議録検索でご確認いただけます。
      </p>
    </div>
  );
}
