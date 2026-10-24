export interface SearchEntry {
  t: string;
  s: string;
  u: string;
  k: string;
  q: string;
}

function isSearchEntry(value: unknown): value is SearchEntry {
  if (!value || typeof value !== "object") return false;
  return ["t", "s", "u", "k", "q"].every(
    (key) => key in value && typeof (value as Record<string, unknown>)[key] === "string",
  );
}

/** 通信・配信内容の不備を、検索結果0件として扱わない。 */
export async function loadSearchIndex(signal?: AbortSignal): Promise<SearchEntry[]> {
  const response = await fetch("/search-index.json", { signal, cache: "no-cache" });
  if (!response.ok) throw new Error(`検索データの取得に失敗しました（${response.status}）`);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isSearchEntry)) {
    throw new Error("検索データの形式が正しくありません");
  }
  return data;
}
