import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  bukka: <><path d="M4 8h16v12H4zM7 8V5h10v3" /><path d="M4 12h16M14 15h3" /></>,
  kosodate: <><path d="M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2ZM12 6v15" /></>,
  iryo: <><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" /></>,
  hataraku: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V3h8v4M3 12c5 3 13 3 18 0M10 14h4" /></>,
  zeikin: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 4 16 4 16 0V6M4 12v6c0 4 16 4 16 0v-6" /></>,
  bosai: <><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6zM8 12l3 3 5-6" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
};

export function TopicIcon({ name, className = "" }: { name: string; className?: string }) {
  return <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.kosodate}</svg>;
}
