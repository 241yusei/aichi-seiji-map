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
    title: `${t.label}の発言記録｜テーマから探す`,
    description: `${t.blurb} 愛知選出議員の国会発言を一次ソース付きで。`,
    alternates: { canonical: `/themes/${tag}/` },
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

      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium tracking-wider text-accent">暮らしのテーマから、議会の言葉を読む</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          {theme.label}の発言記録
        </h1>
        <p className="measure mt-3 text-muted">{theme.blurb}</p>
        <p className="measure mt-2 text-sm text-muted">どの議員が、いつ、どの会議で触れたかをたどれます。</p>
        <p className="tnum mt-3 text-sm text-muted">
          キーワードに一致した収録発言：<span className="font-bold text-ink">{matched.length}件</span>
        </p>
        <div className="measure mt-4 border-l-2 border-line pl-3 text-xs leading-relaxed text-muted">
          <p>本文中の語の一致で抽出しています。発言全体の主題がこのテーマとは限りません。</p>
          <p className="mt-1">対象語：{theme.keywords.join("・")}</p>
        </div>
      </header>

      {matched.length === 0 ? (
        <p className="tnum border-y border-line py-3 text-sm text-muted">
          このテーマの取得済み発言：<span className="font-bold text-ink">0件</span>
          （本サイトの収録範囲で一致した発言がない状態です。実際の発言の有無は公式会議録でご確認ください）
        </p>
      ) : (
        <section aria-labelledby="matched-speeches-heading">
          <h2 id="matched-speeches-heading" className="font-display text-2xl">一致した言葉と、発言の該当箇所</h2>
          <p className="measure mt-3 text-sm text-muted">
            新しい順に、発言者・会議・日付と、一致語の前後の原文を表示します。
            文脈は公式会議録の全文から確認できます。AI要約がある場合は、原文とは別の補助情報として表示します。
          </p>
          <div className="mt-4">
            <SpeechList
              speeches={matched}
              theme={{ label: theme.label, keywords: theme.keywords }}
              speakerNames={Object.fromEntries(matched.map((s) => [s.legislatorId, legById.get(s.legislatorId) ?? ""]))}
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
