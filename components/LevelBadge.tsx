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

// 議会の違いは文字で示し、色による優劣をつくらない。
export function LevelBadge({ level, full = false }: { level: Level; full?: boolean }) {
  return (
    <span className="inline-flex items-center rounded-full bg-subtle px-2.5 py-1 text-xs font-medium leading-5 tracking-wide text-ink">
      {full ? FULL[level] : LABEL[level]}
    </span>
  );
}
