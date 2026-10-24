export interface CompareEntry {
  id: string;
  t: string;
  layer: string;
  sub: string;
  party: string;
  sp: number;
  vy: number;
  vn: number;
  vo: number;
  fund: number | null;
  fundYear: number | null;
  ec: number;
  pos: string[];
  q: string;
}

function isCompareEntry(value: unknown): value is CompareEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return ["id", "t", "layer", "sub", "party", "q"].every((key) => typeof entry[key] === "string")
    && ["sp", "vy", "vn", "vo", "ec"].every((key) => typeof entry[key] === "number" && Number.isFinite(entry[key]))
    && ["fund", "fundYear"].every((key) => entry[key] === null || (typeof entry[key] === "number" && Number.isFinite(entry[key])))
    && Array.isArray(entry.pos) && entry.pos.every((position) => typeof position === "string");
}

/** 通信・配信内容の不備を、未選択や比較対象0件として扱わない。 */
export async function loadCompareIndex(signal?: AbortSignal): Promise<CompareEntry[]> {
  const response = await fetch("/compare-index.json", { signal, cache: "no-cache" });
  if (!response.ok) throw new Error(`比較データの取得に失敗しました（${response.status}）`);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isCompareEntry)) {
    throw new Error("比較データの形式が正しくありません");
  }
  return data;
}
