import Link from "next/link";
import type { Legislator } from "@/lib/types";
import { LevelBadge } from "./LevelBadge";
import { Monogram } from "./Monogram";

export function LegislatorCard({ legislator }: { legislator: Legislator }) {
  return (
    <Link
      href={`/legislators/${legislator.id}/`}
      className="group flex flex-col border border-line bg-surface p-4 transition-colors hover:border-ink hover:bg-subtle"
    >
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={legislator.level} />
        <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
          →
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Monogram name={legislator.name} level={legislator.level} size="sm" />
        <span className="font-display text-lg leading-tight">{legislator.name}</span>
      </div>
      {legislator.kana && <span className="mt-0.5 text-xs text-faint">{legislator.kana}</span>}
      <p className="mt-2 text-sm text-muted">
        {legislator.district}
        {legislator.party ? <span className="text-faint"> ・ {legislator.party}</span> : null}
      </p>
    </Link>
  );
}
