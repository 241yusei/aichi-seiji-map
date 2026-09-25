"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const NAV: { href: string; label: string; also?: string[] }[] = [
  { href: "/area", label: "地域から探す" },
  { href: "/legislators", label: "議員を知る" },
  { href: "/issues", label: "愛知の争点" },
  { href: "/learn", label: "まなぶ" },
  { href: "/vote-guide", label: "選挙と投票", also: ["/elections"] },
];

const MORE_NAV = [
  { href: "/start", label: "はじめての方へ" },
  ...NAV,
  { href: "/facts", label: "事実カード" },
  { href: "/municipalities", label: "市町村から探す" },
  { href: "/about", label: "このサイトについて" },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "";
  const menuRef = useRef<HTMLDetailsElement>(null);
  const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isActive = (href: string) =>
    matches(href) || (NAV.find((n) => n.href === href)?.also ?? []).some(matches);

  return (
    <header className="relative z-30 px-3 pt-4 sm:px-6 sm:pt-6">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 rounded-full bg-paper px-3 py-3 shadow-[0_2px_20px_rgba(54,8,2,0.04)] ring-1 ring-line/60 sm:gap-3 sm:px-6">
        <Link href="/" className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl sm:gap-2.5" aria-label="政治のトリセツ あいち・なごや ホーム">
          <svg aria-hidden="true" viewBox="0 0 40 40" fill="none" className="h-8 w-8 shrink-0 text-signal sm:h-10 sm:w-10">
            <rect x="3" y="4" width="25" height="29" rx="8" fill="currentColor" />
            <path d="M18 10h11a8 8 0 0 1 8 8v11a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8Z" stroke="currentColor" strokeWidth="2.5" />
            <path d="M10 14h11M10 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="flex flex-col gap-0.5">
            <span className="font-display whitespace-nowrap text-base leading-tight tracking-tight min-[380px]:text-lg sm:text-xl">政治のトリセツ</span>
            <span className="text-[10px] leading-snug tracking-[0.14em] text-muted sm:text-[11px]">あいち・なごや</span>
          </span>
        </Link>

        <nav aria-label="メインナビゲーション" className="hidden items-center gap-1 lg:flex">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm transition-colors ${isActive(href) ? "bg-subtle font-medium text-accent" : "text-muted hover:bg-subtle hover:text-ink"}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/search" aria-label="サイト内を検索" aria-current={isActive("/search") ? "page" : undefined}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-subtle ${isActive("/search") ? "bg-subtle text-accent" : "text-ink"}`}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.7-4.7" />
            </svg>
          </Link>
          <Link href="/start" aria-current={isActive("/start") ? "page" : undefined}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm text-on-accent transition-colors hover:bg-accent-deep lg:inline-flex">
            はじめての方へ <span aria-hidden="true">↗</span>
          </Link>

          <details ref={menuRef} className="group lg:hidden" onKeyDown={(event) => {
            if (event.key === "Escape" && menuRef.current?.open) {
              menuRef.current.open = false;
              menuRef.current.querySelector("summary")?.focus();
            }
          }}>
            <summary aria-label="メニュー" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full bg-subtle text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <path d="M5 8h14M5 16h14" className="group-open:hidden" />
                <path d="m6 6 12 12M6 18 18 6" className="hidden group-open:block" />
              </svg>
            </summary>
            <nav aria-label="メニュー内ナビゲーション" className="absolute inset-x-4 top-full mt-3 max-h-[65dvh] overflow-y-auto rounded-3xl border border-line bg-paper p-3 shadow-[0_8px_24px_rgba(54,8,2,0.08)] sm:inset-x-6">
              {MORE_NAV.map(({ href, label }) => (
                <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}
                  onClick={() => { if (menuRef.current) menuRef.current.open = false; }}
                  className={`flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors ${isActive(href) ? "bg-subtle font-medium text-accent" : "text-ink hover:bg-subtle"}`}>
                  {label}<span aria-hidden="true">↗</span>
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
