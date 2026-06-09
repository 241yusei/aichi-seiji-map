import type { Level } from "@/lib/types";

// 活字モノグラム＝写真不使用での識別子（装飾的補助）。姓の先頭1〜2字を角丸タイルに。
// 政党色は使わず、層(国/県/市)を彩度ゼロの三段グレーで塗り分け、枠線に teal の細線。
const LEVEL_BG: Record<Level, string> = {
  national: "bg-ink",
  prefectural: "bg-muted",
  municipal: "bg-faint",
};

export function Monogram({
  name,
  level,
  size = "md",
}: {
  name: string;
  level: Level;
  size?: "sm" | "md";
}) {
  const chars = name.replace(/\s/g, "").slice(0, 2);
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-base";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded border border-accent font-display leading-none text-on-accent ${LEVEL_BG[level]} ${dim}`}
    >
      {chars}
    </span>
  );
}
