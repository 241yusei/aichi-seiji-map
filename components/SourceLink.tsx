import type { ReactNode } from "react";
import type { UsageEventName } from "@/lib/types";

// 一次ソースへの外部リンク。中立サイトとして rel を付け、原本へ誘導する統一表示。
// 既定はインク文字＋差し色の下線（.link-ink）＋外部リンク矢印。
export function SourceLink({
  href,
  children,
  className,
  usageEvent,
}: {
  href: string;
  children?: ReactNode;
  className?: string;
  usageEvent?: Extract<UsageEventName, "source_external_opened">;
}) {
  return (
    <a href={href} data-usage-event={usageEvent} target="_blank" rel="noopener nofollow" className={className ?? "link-ink"}>
      {children ?? "出典"}
      <span aria-hidden className="text-accent">
        {" "}
        ↗
      </span>
    </a>
  );
}
