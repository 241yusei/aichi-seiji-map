import Link from "next/link";
import type { Legislator } from "@/lib/types";
import { LevelBadge } from "./LevelBadge";

export function LegislatorCard({ legislator }: { legislator: Legislator }) {
  return (
    <Link
      href={`/legislators/${legislator.id}/`}
      className="block rounded-xl border border-line bg-surface p-4 transition hover:border-accent"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <LevelBadge level={legislator.level} />
        <span className="font-bold">{legislator.name}</span>
        <span className="text-xs text-muted">{legislator.kana}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {legislator.district}
        {legislator.party ? ` ・ ${legislator.party}` : ""}
      </p>
    </Link>
  );
}
