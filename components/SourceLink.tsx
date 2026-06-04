import type { ReactNode } from "react";

// 一次ソースへの外部リンク。中立サイトとして rel を付け、原本へ誘導する統一表示。
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
    <a
      href={href}
      target="_blank"
      rel="noopener nofollow"
      className={className ?? "text-accent underline underline-offset-2 hover:opacity-80"}
    >
      {children ?? "出典"}
    </a>
  );
}
