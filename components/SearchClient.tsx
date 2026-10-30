"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchSkeleton } from "@/components/IndexSkeleton";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SEARCH_KINDS, filterSearchEntries, searchSuggestions, searchStateFromUrl, searchUrl } from "@/lib/search-results";
import { loadSearchIndex, type SearchEntry } from "@/lib/search-index";

type LoadState =
  | { status: "loading" | "error" }
  | { status: "ready"; entries: SearchEntry[] };

export function SearchClient() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string>("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef(true);
  const retryFocusRef = useRef(false);
  const index = load.status === "ready" ? load.entries : null;

  useEffect(() => {
    const controller = new AbortController();
    loadSearchIndex(controller.signal)
      .then((entries) => {
        if (!controller.signal.aborted) { pendingRef.current = false; setLoad({ status: "ready", entries }); }
      })
      .catch(() => {
        if (!controller.signal.aborted) { pendingRef.current = false; setLoad({ status: "error" }); }
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    function syncFromUrl() {
      const state = searchStateFromUrl(new URL(window.location.href));
      setQuery(state.query);
      setKind(state.kind);
    }
    // 閲覧URLはマウント後に復元し、戻る・進むでも同じ条件にする。
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    if (load.status === "loading" || !retryFocusRef.current) return;
    if (document.activeElement === statusRef.current || document.activeElement === document.body) {
      (load.status === "ready" ? inputRef.current : retryRef.current)?.focus({ preventScroll: true });
    }
    retryFocusRef.current = false;
  }, [load.status]);

  function updateConditions(nextQuery: string, nextKind: string) {
    setQuery(nextQuery);
    setKind(nextKind);
    window.history.replaceState(window.history.state, "", searchUrl(new URL(window.location.href), nextQuery, nextKind));
  }

  const results = useMemo(() => index ? filterSearchEntries(index, query, kind) : [], [index, query, kind]);
  const suggestions = searchSuggestions(results, query);
  const shown = results.slice(0, 200);

  return (
    <div>
      <SearchAutocomplete
        query={query}
        onChange={(value) => updateConditions(value, kind)}
        suggestions={suggestions}
        onChoose={(entry) => router.push(entry.u)}
        inputRef={inputRef}
      >

        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip label="すべて" active={kind === ""} onClick={() => updateConditions(query, "")} />
          {SEARCH_KINDS.map((k) => (
            <FilterChip key={k} label={k} active={kind === k} onClick={() => updateConditions(query, k)} />
          ))}
        </div>

        <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-2">
        <p ref={statusRef} tabIndex={-1} className="eyebrow text-faint" role="status" aria-live="polite">
          {load.status === "error"
            ? ""
            : index === null
            ? "読み込み中…"
            : query.trim() === "" && kind === ""
              ? `${index.length}件から検索`
              : `${results.length}件${results.length > shown.length ? `（上位${shown.length}件を表示）` : ""}`}
        </p>
        {(query !== "" || kind !== "") && (
          <button type="button" onClick={() => { updateConditions("", ""); inputRef.current?.focus(); }} className="interaction-button min-h-11 border border-line px-3 py-2 text-sm hover:bg-subtle">条件をリセット</button>
        )}
        </div>

      </SearchAutocomplete>

      <div aria-busy={load.status === "loading"} className="async-results mt-2">
      {load.status === "loading" && <SearchSkeleton />}
      {load.status === "error" && (
        <div className="mt-4 border-l-2 border-accent bg-subtle p-4">
          <p role="alert" className="text-sm text-ink">
            検索データを読み込めませんでした。通信状況を確認して、もう一度お試しください。
          </p>
          <button
            ref={retryRef}
            type="button"
            onClick={() => {
              if (pendingRef.current) return;
              pendingRef.current = true;
              retryFocusRef.current = true;
              statusRef.current?.focus({ preventScroll: true });
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

      <div key={load.status} className={load.status === "ready" ? "ui-reveal" : undefined}>
        {shown.map((e, i) => (
          <Link
            key={`${e.u}-${i}`}
            href={e.u}
            className="group grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-t border-line py-3 transition-colors last:border-b hover:bg-subtle"
          >
            <span className="eyebrow border border-ink px-1.5 py-0.5 text-center text-ink">
              {e.k}
            </span>
            <span className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
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
      className={`interaction-button min-h-11 border px-3 py-2 text-sm transition-colors ${
        active ? "border-ink bg-ink text-paper" : "border-line text-muted hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
