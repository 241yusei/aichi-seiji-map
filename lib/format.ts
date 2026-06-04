// 表示用の純関数ユーティリティ。

/** "2025-12-04" → "2025年12月4日" */
export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

/** 金額を「1,234,567円」表記に。 */
export function formatYen(n: number): string {
  return `${n.toLocaleString("ja-JP")}円`;
}
