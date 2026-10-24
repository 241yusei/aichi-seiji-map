import type { SearchEntry } from "./search-index";

export const SEARCH_KINDS = ["議員", "首長", "争点", "事実カード", "ページ"] as const;
export const SUGGESTION_LIMIT = 6;

export function filterSearchEntries(index: SearchEntry[], query: string, kind: string): SearchEntry[] {
  const normalized = query.trim().toLowerCase().normalize("NFKC");
  const terms = normalized ? normalized.split(/\s+/) : [];
  return index.filter((entry) => (!kind || entry.k === kind) && terms.every((term) => entry.q.includes(term)));
}

// 候補は既存の検索条件と索引順を使い、推測や別のランキングを加えない。
export function searchSuggestions(results: SearchEntry[], query: string): SearchEntry[] {
  return query.trim() ? results.slice(0, SUGGESTION_LIMIT) : [];
}

export function searchStateFromUrl(url: URL): { query: string; kind: string } {
  const kind = url.searchParams.get("kind") ?? "";
  return { query: url.searchParams.get("q") ?? "", kind: SEARCH_KINDS.some((value) => value === kind) ? kind : "" };
}

export function searchUrl(url: URL, query: string, kind: string): string {
  const next = new URL(url);
  for (const [key, value] of [["q", query], ["kind", kind]]) {
    if (value) next.searchParams.set(key, value);
    else next.searchParams.delete(key);
  }
  return `${next.pathname}${next.search}${next.hash}`;
}
