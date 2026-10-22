import { NAGOYA_WARDS } from "./area";
import { MUNICIPALITIES } from "./municipalities";

// 保存するのは既存の地域slugだけ。郵便番号・住所・閲覧履歴は保存しない。
export const REGION_STORAGE_KEY = "seiji:region:v1";
export interface RegionTarget {
  value: string;
  label: string;
  href: string;
}

export function resolveRegionTarget(value: string): RegionTarget | null {
  if (value.startsWith("ward:")) {
    const ward = NAGOYA_WARDS.find((w) => `ward:${w.slug}` === value);
    return ward ? { value, label: `名古屋市${ward.ward}`, href: `/area/${ward.slug}/` } : null;
  }
  const city = MUNICIPALITIES.find((m) => m.slug !== "nagoya" && `municipality:${m.slug}` === value);
  return city ? { value, label: city.city, href: `/municipalities/${city.slug}/` } : null;
}

type RegionStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readSavedRegion(storage: RegionStorage): RegionTarget | null {
  try {
    return resolveRegionTarget(storage.getItem(REGION_STORAGE_KEY) ?? "");
  } catch {
    return null;
  }
}

export function saveRegion(storage: RegionStorage, value: string): boolean {
  const target = resolveRegionTarget(value);
  if (!target) return false;
  try {
    storage.setItem(REGION_STORAGE_KEY, target.value);
    return true;
  } catch {
    return false;
  }
}

export function forgetRegion(storage: RegionStorage): boolean {
  try {
    storage.removeItem(REGION_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
