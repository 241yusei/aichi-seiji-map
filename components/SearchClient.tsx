"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Entry {
  t: string;
  s: string;
  u: string;
  k: string;
  q: string;
}

const KINDS = ["議員", "首長", "争点", "事実カード", "ページ"] as const;

export function SearchClient() {
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string>("");

  useEffect(() => {
    fetch("/search-index.json")
      .then((r) => r.json())
      .then((d: Entry[]) => setIndex(d))
      .catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    if (!index) return [];
    const qq = query.trim().toLowerCase().normalize("NFKC");
    const terms = qq ? qq.split(/\s+/) : [];
    return index
      .filter((e) => (kind ? e.k === kind : true))
      .filter((e) => terms.every((t) => e.q.includes(t)));
  }, [index, query, kind]);

  const shown = results.slice(0, 200);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="議員名・地域・政党・争点で検索（例：河村 / 名古屋 / リニア）"
        aria-label="検索"
        autoFocus
        className="w-full border border-ink bg-surface px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <FilterChip label="すべて" active={kind === ""} onClick={() => setKind("")} />
        {KINDS.map((k) => (
          <FilterChip key={k} label={k} active={kind === k} onClick={() => setKind(k)} />
        ))}
      </div>

      <p className="eyebrow mt-4 text-faint" role="status" aria-live="polite">
        {index === null
          ? "読み込み中…"
          : query.trim() === "" && kind === ""
            ? `${index.length}件から検索`
            : `${results.length}件${results.length > shown.length ? `（上位${shown.length}件を表示）` : ""}`}
      </p>

      <div className="mt-2">
        {shown.map((e, i) => (
          <Link
            key={`${e.u}-${i}`}
            href={e.u}
            className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-t border-line py-3 transition-colors last:border-b hover:bg-subtle"
          >
            <span className="eyebrow border border-ink px-1.5 py-0.5 text-center text-ink">
              {e.k}
            </span>
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-bold">{e.t}</span>
              <span className="text-xs text-muted">{e.s}</span>
            </span>
          </Link>
        ))}
        {index !== null && (query.trim() !== "" || kind !== "") && results.length === 0 && (
          <p className="mt-4 text-sm text-muted">該当なし。別の語（氏名・地域・政党・争点）でお試しください。</p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1 text-sm transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
