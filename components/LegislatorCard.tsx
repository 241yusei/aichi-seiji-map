import Link from "next/link";
import type { LegislatorListItem } from "@/lib/types";
import { LevelBadge } from "./LevelBadge";
import { Monogram } from "./Monogram";

export function LegislatorCard({ legislator }: { legislator: LegislatorListItem }) {
  return (
    <Link
      href={`/legislators/${legislator.id}/`}
      className="group flex h-full min-w-0 flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent hover:bg-subtle/40"
    >
      <div className="flex items-center justify-between gap-2">
        <LevelBadge level={legislator.level} full />
        <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors group-hover:bg-surface group-hover:text-accent">
          →
        </span>
      </div>
      <div className="my-5 flex items-center gap-3">
        <Monogram name={legislator.name} level={legislator.level} size="sm" />
        <div className="min-w-0">
          <span className="block font-display text-xl leading-snug">{legislator.name}</span>
          <span className="mt-1 block text-xs leading-relaxed text-faint">
            {legislator.kana || "ふりがな未登録"}
          </span>
        </div>
      </div>
      <dl className="mt-auto grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t border-line pt-4 text-sm leading-relaxed">
        <dt className="text-faint">選挙区</dt>
        <dd className="min-w-0 text-ink">{legislator.district}</dd>
        <dt className="text-faint">所属</dt>
        <dd className="min-w-0 text-ink">{legislator.party || "所属情報なし"}</dd>
      </dl>
      <span className="mt-5 text-xs font-medium text-accent-deep">プロフィール・記録を見る <span aria-hidden>↗</span></span>
    </Link>
  );
}
