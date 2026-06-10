import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegislators, getSpeeches } from "@/lib/data";
import { THEMES, matchThemeSpeeches, themeById } from "@/lib/themes";
import { SpeechList } from "@/components/SpeechList";

export function generateStaticParams() {
  return THEMES.map((t) => ({ tag: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const t = themeById(tag);
  if (!t) return { title: "テーマ" };
  return {
    title: `${t.label}｜テーマから探す`,
    description: `${t.blurb} 愛知選出議員の国会発言を一次ソース付きで。`,
  };
}

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const theme = themeById(tag);
  if (!theme) notFound();

  const matched = matchThemeSpeeches(theme, getSpeeches());
  const legById = new Map(getLegislators().map((l) => [l.id, l.name]));

  return (
    <div className="space-y-8">
      <p className="text-sm">
        <Link href="/themes/" className="link-ink">
          ← テーマ一覧
        </Link>
      </p>

      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Theme</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          {theme.label}
        </h1>
        <p className="measure mt-3 text-muted">{theme.blurb}</p>
        <p className="tnum mt-3 text-sm text-muted">
          取得済みの関連発言：<span className="font-bold text-ink">{matched.length}件</span>
          （キーワード：{theme.keywords.join("・")}）
        </p>
      </header>

      {matched.length === 0 ? (
        <p className="tnum border-y border-line py-3 text-sm text-muted">
          このテーマの取得済み発言：<span className="font-bold text-ink">0件</span>
          （関連発言が会議録に記録され次第、追加します）
        </p>
      ) : (
        <section>
          <p className="text-xs text-faint">
            新しい順。発言者名から議員ページ（発言・採決・政治資金）へ進めます。
            AI要約は自動生成の補助情報のため、判断の際は各発言の原文リンクをご確認ください。
          </p>
          <div className="mt-4">
            <SpeechList
              speeches={matched.map((s) => ({
                ...s,
                body: `${legById.get(s.legislatorId) ?? ""}｜${s.body}`,
              }))}
            />
          </div>
        </section>
      )}

      <nav className="flex flex-wrap gap-x-5 gap-y-1 rule-thick pt-5 text-sm">
        <Link href="/issues/" className="link-ink">
          争点（三層横串）→
        </Link>
        <Link href="/search/" className="link-ink">
          横断検索 →
        </Link>
      </nav>
    </div>
  );
}
