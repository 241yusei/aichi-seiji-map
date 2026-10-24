"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadSearchIndex, type SearchEntry } from "@/lib/search-index";

type LoadState =
  | { status: "loading" | "error" }
  | { status: "ready"; entries: SearchEntry[] };

const KINDS = ["議員", "首長", "争点", "事実カード", "ページ"] as const;

export function SearchClient() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string>("");
  const index = load.status === "ready" ? load.entries : null;

  useEffect(() => {
    const controller = new AbortController();
    loadSearchIndex(controller.signal)
      .then((entries) => {
        if (!controller.signal.aborted) setLoad({ status: "ready", entries });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoad({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

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
        {load.status === "error"
          ? ""
          : index === null
          ? "読み込み中…"
          : query.trim() === "" && kind === ""
            ? `${index.length}件から検索`
            : `${results.length}件${results.length > shown.length ? `（上位${shown.length}件を表示）` : ""}`}
      </p>

      {load.status === "error" && (
        <div className="mt-4 border-l-2 border-accent bg-subtle p-4">
          <p role="alert" className="text-sm text-ink">
            検索データを読み込めませんでした。通信状況を確認して、もう一度お試しください。
          </p>
          <button
            type="button"
            onClick={() => {
              setLoad({ status: "loading" });
              setAttempt((current) => current + 1);
            }}
            className="mt-3 min-h-11 border border-ink px-4 py-2 text-sm font-bold hover:bg-surface"
          >
            もう一度読み込む
          </button>
          <p className="mt-3 text-sm text-muted">
            一覧からも探せます：<Link href="/legislators/" className="link-ink">議員一覧</Link>
            {" ／ "}<Link href="/municipalities/" className="link-ink">市町村一覧</Link>
          </p>
        </div>
      )}

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
      aria-pressed={active}
      className={`min-h-11 border px-3 py-2 text-sm transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
