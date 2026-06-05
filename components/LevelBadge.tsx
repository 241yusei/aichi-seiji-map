import type { Level } from "@/lib/types";

const LABEL: Record<Level, string> = {
  national: "国",
  prefectural: "県",
  municipal: "市",
};

const FULL: Record<Level, string> = {
  national: "国会（愛知選出）",
  prefectural: "愛知県議会",
  municipal: "市町村議会",
};

// 政党色を避け、インクの枠線ラベル（mono chip）で層を区別する。
export function LevelBadge({ level, full = false }: { level: Level; full?: boolean }) {
  return (
    <span className="inline-flex items-center border border-ink px-1.5 text-[0.7rem] font-bold leading-5 tracking-wide text-ink">
      {full ? FULL[level] : LABEL[level]}
    </span>
  );
}
