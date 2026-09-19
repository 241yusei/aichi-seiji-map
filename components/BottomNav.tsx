"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

// デスクトップナビが隠れる幅では、主要6導線を固定表示する。
// 写真/塗りアイコンは使わず currentColor の単線SVG（依存ゼロ・中立）。
function Icon({ d }: { d: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}

const ITEMS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/start", label: "はじめに", icon: <Icon d={<><path d="M12 3v18" /><path d="M12 4h7l-2 3 2 3h-7" /></>} /> },
  { href: "/area", label: "地域", icon: <Icon d={<><path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>} /> },
  { href: "/legislators", label: "議員", icon: <Icon d={<><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 6.5a3 3 0 0 1 0 6" /><path d="M16.5 19a5.5 5.5 0 0 0-2.5-4.6" /></>} /> },
  { href: "/issues", label: "争点", icon: <Icon d={<><path d="M4 5h16v10H9l-4 4V5Z" /></>} /> },
  { href: "/learn", label: "まなぶ", icon: <Icon d={<><path d="M3 5.5A2 2 0 0 1 5 4h6v15H5a2 2 0 0 0-2 1.5V5.5Z" /><path d="M21 5.5A2 2 0 0 0 19 4h-6v15h6a2 2 0 0 1 2 1.5V5.5Z" /></>} /> },
  // 6番目に追記（既存5導線の並び順・タップ位置は変更しない＝移動によるムスクルメモリ喪失を避ける）。
  // 320px幅でも 320/6≈53px とタップ領域48pxを確保できるため、既存タブの削除は不要と判断。
  { href: "/search", label: "検索", icon: <Icon d={<><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.3-4.3" /></>} /> },
];

export function BottomNav() {
  const path = usePathname() ?? "";
  // まなぶの読了数を localStorage（read:*）から集計し、ドットで前進感を集約表示。
  const [readCount, setReadCount] = useState(0);
  useEffect(() => {
    try {
      let c = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("read:") && localStorage.getItem(k) === "1") c++;
      }
      // localStorage からの集計（マウント後・意図的）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReadCount(c);
    } catch {
      /* localStorage 不可でも無視 */
    }
  }, [path]);

  return (
    <nav
      aria-label="下部ナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-xl grid-cols-6 gap-0.5 px-1 py-2 sm:gap-2 sm:px-4">
        {ITEMS.map((it) => {
          const active = path === it.href || path.startsWith(`${it.href}/`);
          return (
            <li key={it.href} className="relative">
              <Link
                href={`${it.href}/`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-2xl py-2 text-[10px] leading-none transition-colors hover:bg-subtle sm:text-xs ${
                  active ? "bg-subtle font-medium text-accent-deep" : "text-muted"
                }`}
              >
                <span className="relative">
                  {it.icon}
                  {it.href === "/learn" && readCount > 0 && (
                    <span
                      aria-hidden
                      className="absolute -right-2 -top-1 min-w-[14px] rounded-full bg-accent px-1 text-center text-[9px] font-bold leading-[14px] text-on-accent"
                    >
                      {readCount}
                    </span>
                  )}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
