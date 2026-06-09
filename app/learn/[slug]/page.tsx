import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnChapter, getLearnChapters, LEARN } from "@/lib/learn";
import { Blocks } from "@/components/LearnContent";
import { DifficultyToggle } from "@/components/DifficultyToggle";
import { Figure } from "@/components/Figure";
import { SourceLink } from "@/components/SourceLink";

export function generateStaticParams() {
  return getLearnChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getLearnChapter(slug);
  if (!c) return { title: "まなぶ" };
  return { title: `${c.title}（${c.partLabel}）`, description: c.lead };
}

export default async function LearnChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getLearnChapter(slug);
  if (!c) notFound();

  const idx = LEARN.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? LEARN[idx - 1] : null;
  const next = idx < LEARN.length - 1 ? LEARN[idx + 1] : null;

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">
          {c.partLabel} ／ {c.n}
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.9rem,5.5vw,3.25rem)] leading-tight">
          {c.title}
        </h1>
        <p className="measure mt-3 text-base text-muted sm:text-lg">{c.lead}</p>
      </header>

      {c.figure && <Figure figure={c.figure} />}

      <DifficultyToggle easy={<Blocks blocks={c.easy} />} detail={<Blocks blocks={c.detail} />} />

      {c.sources && c.sources.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="eyebrow text-faint">参考</p>
          <ul className="mt-2 space-y-1 text-sm">
            {c.sources.map((s, i) => (
              <li key={i}>
                <SourceLink href={s.url}>{s.label}</SourceLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ここまで言えること */}
      <div className="border-l-2 border-accent bg-subtle px-4 py-4">
        <p className="eyebrow text-accent-deep">ここまで言えること</p>
        <ul className="measure mt-2 space-y-1.5 text-sm text-muted">
          {c.check.map((ch, i) => (
            <li key={i}>✓ {ch}</li>
          ))}
        </ul>
      </div>

      {/* 橋渡し */}
      {c.bridges.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {c.bridges.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="border border-ink px-4 py-2 text-sm font-bold transition-colors hover:bg-subtle"
            >
              {b.label} →
            </Link>
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between gap-4 border-t-2 border-ink pt-5 text-sm">
        {prev ? (
          <Link href={`/learn/${prev.slug}/`} className="link-ink">
            ← {prev.title}
          </Link>
        ) : (
          <Link href="/learn" className="link-ink">
            ← まなぶ一覧
          </Link>
        )}
        {next ? (
          <Link href={`/learn/${next.slug}/`} className="link-ink text-right">
            {next.title} →
          </Link>
        ) : (
          <Link href="/glossary" className="link-ink text-right">
            用語集 →
          </Link>
        )}
      </nav>
    </div>
  );
}
