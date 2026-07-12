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

/**
 * 千円単位の金額（予算資料の表記単位）を「3兆2,224億円」「6,901億円」表記に丸める。
 * 1億円未満は「約0.5億円」のように小数1桁で示す。
 */
export function formatOkuYen(thousandYen: number): string {
  const oku = thousandYen / 100_000; // 千円 → 億円
  if (Math.abs(oku) < 1) return `約${oku.toFixed(1)}億円`;
  const rounded = Math.round(oku);
  const cho = Math.floor(rounded / 10_000);
  const rest = rounded % 10_000;
  if (cho > 0) return rest === 0 ? `${cho}兆円` : `${cho}兆${rest.toLocaleString("ja-JP")}億円`;
  return `${rounded.toLocaleString("ja-JP")}億円`;
}
