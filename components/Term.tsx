import type { ReactNode } from "react";
import Link from "next/link";
import { glossaryTerm } from "@/lib/glossary";

// 文脈内・用語ツールチップ。初出語のみ・1段落1〜2語が上限（本文を下線だらけにしない）。
// CSSのみ（group-hover/focus-within）で静的エクスポートに対応。タップ時は /glossary へ。
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const t = glossaryTerm(id);
  if (!t) return <>{children}</>;
  return (
    <span className="group relative inline-block">
      <Link
        href={`/glossary#${id}`}
        className="cursor-help border-b border-dotted border-accent text-ink hover:text-accent-deep"
        aria-describedby={`tt-${id}`}
      >
        {children ?? t.term}
      </Link>
      <span
        role="tooltip"
        id={`tt-${id}`}
        className="invisible absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 border border-ink bg-surface p-3 text-left text-xs font-normal leading-relaxed text-muted opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <span className="font-bold text-ink">{t.term}</span>
        {t.yomi && <span className="text-faint">（{t.yomi}）</span>}
        <br />
        {t.short}
      </span>
    </span>
  );
}
