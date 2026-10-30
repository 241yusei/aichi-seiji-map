import type { UsageEventName, UsagePayload } from "./types";
import { isUsageEvent } from "./usage-events";

export const JOURNEY_STORAGE_KEY = "torisetsu:journey:v1";
export const USAGE_PREFERENCE_KEY = "torisetsu:usage:off";
type JourneyStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const REQUIRED_STEP: Partial<Record<UsageEventName, UsageEventName>> = {
  region_selected: "region_step_viewed",
  representative_viewed: "region_selected",
  living_topic_viewed: "representative_viewed",
  source_reference_opened: "living_topic_viewed",
  source_external_opened: "living_topic_viewed",
};

export function privacySignalStopsUsage(signal: { doNotTrack?: string | null; globalPrivacyControl?: boolean }): boolean {
  return signal.doNotTrack === "1" || signal.doNotTrack === "yes" || signal.globalPrivacyControl === true;
}

/** タブ内の段階フラグだけ保持する。識別子は作らず、送信にも含めない。 */
export function createJourneyTracker(storage: JourneyStorage | null, send: (payload: UsagePayload) => void) {
  let completed = new Set<UsageEventName>();
  try {
    const stored: unknown = JSON.parse(storage?.getItem(JOURNEY_STORAGE_KEY) ?? "[]");
    if (Array.isArray(stored)) {
      // 壊れた・将来版の状態から順序を飛ばさないよう、前段も検証する。
      for (const event of stored) {
        if (!isUsageEvent(event)) continue;
        const previous = REQUIRED_STEP[event];
        if (!previous || completed.has(previous)) completed.add(event);
      }
    }
  } catch { /* 保存不可・破損時はメモリ内から開始する。 */ }
  return {
    record(event: UsageEventName): boolean {
      const previous = REQUIRED_STEP[event];
      if (completed.has(event) || (previous && !completed.has(previous))) return false;
      completed.add(event);
      try { storage?.setItem(JOURNEY_STORAGE_KEY, JSON.stringify([...completed])); } catch { /* メモリ内で継続 */ }
      // 計測失敗はナビゲーションを妨げず、同じイベントを自動再送しない。
      try { send({ version: 1, event }); } catch { /* ベストエフォート */ }
      return true;
    },
    reset() {
      completed = new Set();
      try { storage?.removeItem(JOURNEY_STORAGE_KEY); } catch { /* メモリ内は解除済み */ }
    },
  };
}
