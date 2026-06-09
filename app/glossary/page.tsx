import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY, glossaryTerm } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "用語集｜政治のことば、やさしく",
  description:
    "衆議院・参議院・比例代表・採決・記名投票・政治資金・会派・首長・政令指定都市・二元代表制など、政治のことばを初心者向けにやさしく解説。",
};

export default function GlossaryPage() {
  const terms = [...GLOSSARY].sort((a, b) => (a.yomi ?? a.term).localeCompare(b.yomi ?? b.term, "ja"));

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Glossary</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">用語集</h1>
        <p className="measure mt-3 text-muted">
          政治のことばを、はじめての人向けにやさしく。本文中で
          <span className="border-b border-dotted border-accent">点線</span>
          のことばにふれると、その場で意味が出ます。
        </p>
      </header>

      <nav aria-label="用語索引" className="flex flex-wrap gap-2 border-b border-line pb-5">
        {terms.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="eyebrow border border-line px-2 py-1 text-ink transition-colors hover:border-ink hover:bg-subtle"
          >
            {t.term}
          </a>
        ))}
      </nav>

      <dl className="space-y-0">
        {terms.map((t) => (
          <div key={t.id} id={t.id} className="scroll-mt-24 border-t border-line py-5">
            <dt className="flex items-baseline gap-2">
              <span className="font-display text-xl">{t.term}</span>
              {t.yomi && <span className="text-xs text-faint">{t.yomi}</span>}
            </dt>
            <dd className="measure mt-2 text-sm text-muted">
              {t.short}
              {t.long && <span className="mt-1 block text-faint">{t.long}</span>}
              {t.seeAlso && t.seeAlso.length > 0 && (
                <span className="mt-2 block text-xs">
                  関連：
                  {t.seeAlso.map((sid, i) => {
                    const s = glossaryTerm(sid);
                    if (!s) return null;
                    return (
                      <span key={sid}>
                        {i > 0 && "・"}
                        <Link href={`/glossary#${sid}`} className="link-ink">
                          {s.term}
                        </Link>
                      </span>
                    );
                  })}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <nav className="border-t-2 border-ink pt-5 text-sm">
        <Link href="/learn" className="link-ink">
          ← まなぶ（基礎から）
        </Link>
      </nav>
    </div>
  );
}
