"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAGOYA_WARDS } from "@/lib/area";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { REGIONS } from "@/lib/regions";
import { forgetRegion, readSavedRegion, resolveRegionTarget, saveRegion, type RegionTarget } from "@/lib/region-preference";
import { ZipSearch } from "./ZipSearch";
import { JourneyMilestone } from "./JourneyMilestone";
import { recordUsage } from "@/lib/usage-browser";

const CITY_GROUPS = REGIONS.filter((r) => r.name !== "名古屋").map((region) => ({
  label: region.name,
  cities: MUNICIPALITIES.filter((city) => region.govCodes.includes(city.govCode)).sort((a, b) => a.city.localeCompare(b.city, "ja")),
}));

export function RegionPicker() {
  const id = useId();
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [remember, setRemember] = useState(false);
  const [saved, setSaved] = useState<RegionTarget | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // ブラウザに明示保存された地域だけを、ハイドレーション後に読み込む。
    try {
      const region = readSavedRegion(window.localStorage);
      if (region) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSaved(region);
        setSelected(region.value);
      }
    } catch {
      // 保存不可の環境でも地域選択を使える。
    }
  }, []);

  function rememberRegion(value: string) {
    if (!remember) return;
    try {
      saveRegion(window.localStorage, value);
    } catch {
      // 保存できなくても地域ページへの移動を妨げない。
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const target = resolveRegionTarget(selected);
    if (!target) {
      setError("お住まいの市町村・区を選んでください。");
      return;
    }
    rememberRegion(target.value);
    recordUsage("region_selected");
    router.push(target.href);
  }

  function clearSavedRegion() {
    try {
      if (!forgetRegion(window.localStorage)) {
        setNotice("保存を解除できませんでした。ブラウザの設定をご確認ください。");
        return;
      }
      setSaved(null);
      setRemember(false);
      setNotice("保存した地域を解除しました。");
    } catch {
      setNotice("保存を解除できませんでした。ブラウザの設定をご確認ください。");
    }
  }

  return (
    <div id="region-picker" className="scroll-mt-6">
      <JourneyMilestone event="region_step_viewed" />
      {saved && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 rounded-xl bg-white px-3 py-1.5 text-sm">
          <Link href={saved.href} onClick={() => recordUsage("region_selected")} className="link-ink inline-flex min-h-11 items-center">保存した地域：{saved.label} →</Link>
          <button type="button" onClick={clearSavedRegion} className="tap text-sm text-muted underline underline-offset-4">保存を解除</button>
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <label htmlFor={`${id}-region`} className="mb-2 block text-sm font-medium">市町村・区を選ぶ</label>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <select id={`${id}-region`} value={selected} onChange={(e) => { setSelected(e.target.value); setError(""); }} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className="min-w-0 rounded-xl border border-field bg-white px-3 py-2.5 text-base">
            <option value="">地域を選択</option>
            <optgroup label="名古屋市（区を選ぶ）">
              {NAGOYA_WARDS.map((ward) => <option key={ward.slug} value={`ward:${ward.slug}`}>名古屋市{ward.ward}</option>)}
            </optgroup>
            {CITY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.cities.map((city) => <option key={city.slug} value={`municipality:${city.slug}`}>{city.city}</option>)}
              </optgroup>
            ))}
          </select>
          <button type="submit" className="tap whitespace-nowrap rounded-xl bg-ink px-3 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent-deep">地域を見る</button>
        </div>
        {error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-accent-deep">{error}</p>}
      </form>
      <div className="mt-4 border-t border-line pt-4">
        <ZipSearch onResolved={(ward) => { rememberRegion(`ward:${ward.slug}`); recordUsage("region_selected"); }} />
      </div>
      <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2.5 text-xs leading-relaxed text-muted">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-5 min-h-5 w-5 shrink-0 accent-accent" />
        <span>この端末に地域を保存する<br />（郵便番号は保存しません）</span>
      </label>
      <p role="status" className="text-sm text-muted">{notice}</p>
    </div>
  );
}
