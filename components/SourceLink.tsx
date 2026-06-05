import type { ReactNode } from "react";

// 一次ソースへの外部リンク。中立サイトとして rel を付け、原本へ誘導する統一表示。
// 既定はインク文字＋差し色の下線（.link-ink）＋外部リンク矢印。
export function SourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener nofollow" className={className ?? "link-ink"}>
      {children ?? "出典"}
      <span aria-hidden className="text-accent">
        {" "}
        ↗
      </span>
    </a>
  );
}
