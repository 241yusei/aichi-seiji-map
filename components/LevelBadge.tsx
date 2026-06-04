import type { Level } from "@/lib/types";

const LABEL: Record<Level, string> = {
  national: "国",
  prefectural: "県",
  municipal: "市",
};

const FULL: Record<Level, string> = {
  national: "国会（愛知選出）",
  prefectural: "愛知県議会",
  municipal: "名古屋市会",
};

// 政党色を避け、ラベル＋淡いアクセント面で層を区別する。
export function LevelBadge({ level, full = false }: { level: Level; full?: boolean }) {
  return (
    <span className="inline-flex items-center rounded bg-accent-weak px-1.5 py-0.5 text-xs font-medium text-accent">
      {full ? FULL[level] : LABEL[level]}
    </span>
  );
}
