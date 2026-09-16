import type { Level } from "@/lib/types";

// 写真の有無や所属にかかわらず、全員を同じ色・サイズの識別子で扱う。

export function Monogram({
  name,
  size = "md",
}: {
  name: string;
  level: Level;
  size?: "sm" | "md";
}) {
  const chars = name.replace(/\s/g, "").slice(0, 2);
  const dim = size === "sm" ? "h-11 w-11 text-sm" : "h-14 w-14 text-lg";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-subtle font-display font-medium leading-none text-ink ${dim}`}
    >
      {chars}
    </span>
  );
}
