"use client";

import { useEffect } from "react";
import { initializeUsage, recordUsage } from "@/lib/usage-browser";
import { isUsageEvent } from "@/lib/usage-events";
import { USAGE_PREFERENCE_KEY } from "@/lib/usage-journey";

/** ナビゲーション先や入力値を読まず、明示された固定イベントだけを扱う。 */
export function UsageMeasurement() {
  useEffect(() => {
    void initializeUsage();
    function click(event: MouseEvent) {
      // Next Linkのページ内移動は既定動作を防ぐため、操作の試行を数える。
      if (event.button !== 0) return;
      const target = event.target instanceof Element ? event.target.closest("[data-usage-event]") : null;
      const name = target?.getAttribute("data-usage-event");
      if (isUsageEvent(name)) recordUsage(name);
    }
    function syncPreference(event: StorageEvent) {
      if (event.key === USAGE_PREFERENCE_KEY || event.key === null) void initializeUsage();
    }
    document.addEventListener("click", click);
    window.addEventListener("storage", syncPreference);
    return () => {
      document.removeEventListener("click", click);
      window.removeEventListener("storage", syncPreference);
    };
  }, []);
  return null;
}
