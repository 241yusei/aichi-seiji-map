export interface CompareSelection {
  aId: string | null;
  bId: string | null;
}

export function readCompareSelection(search: string): CompareSelection {
  const params = new URLSearchParams(search);
  return { aId: params.get("a") || null, bId: params.get("b") || null };
}

/** 比較の選択だけを変更し、他のクエリとページ内リンクは保持する。 */
export function compareSelectionUrl(href: string, selection: CompareSelection): string {
  const url = new URL(href);
  for (const [key, value] of [["a", selection.aId], ["b", selection.bId]] as const) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
