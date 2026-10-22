"use client";

import type { UsageEventName } from "./types";
import { createJourneyTracker, JOURNEY_STORAGE_KEY, privacySignalStopsUsage, USAGE_PREFERENCE_KEY } from "./usage-journey";

type UsageStatus = "loading" | "enabled" | "disabled" | "privacy" | "unavailable";
let status: UsageStatus = "loading";
let optedOut = false;
let memoryPreference: boolean | undefined;
let configPromise: Promise<boolean> | undefined;
let tracker: ReturnType<typeof createJourneyTracker> | undefined;
// config応答前の速い操作だけを、識別情報のないメモリ内キューで待つ。
let pendingEvents: UsageEventName[] = [];
const listeners = new Set<() => void>();

function privacyStopped() {
  return privacySignalStopsUsage(navigator as Navigator & { globalPrivacyControl?: boolean });
}
function preferenceStopped() {
  if (memoryPreference !== undefined) return memoryPreference;
  try { optedOut = window.localStorage.getItem(USAGE_PREFERENCE_KEY) === "1"; } catch { /* メモリ内設定を使う */ }
  return optedOut;
}
function publish(next: UsageStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}
function resetJourney() {
  pendingEvents = [];
  tracker?.reset();
  try { window.sessionStorage.removeItem(JOURNEY_STORAGE_KEY); } catch { /* 保存不可 */ }
}

export function subscribeUsage(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function usageSnapshot() { return status; }
export function usageServerSnapshot(): UsageStatus { return "loading"; }
export function usageIsOptedOut() { return optedOut; }

export async function initializeUsage(): Promise<void> {
  if (privacyStopped()) { resetJourney(); publish("privacy"); return; }
  if (preferenceStopped()) { resetJourney(); publish("disabled"); return; }
  configPromise ??= fetch("/api/usage", {
    signal: AbortSignal.timeout(5000),
    method: "GET", credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store",
  }).then(async (response) => response.ok && (await response.json() as { enabled?: unknown }).enabled === true).catch(() => false);
  const configured = await configPromise;
  // 応答待ちに設定を変えた場合も停止を優先する。
  if (privacyStopped()) { resetJourney(); publish("privacy"); return; }
  if (preferenceStopped()) { resetJourney(); publish("disabled"); return; }
  if (!configured) { pendingEvents = []; publish("unavailable"); return; }
  if (!tracker) {
    let storage: Storage | null = null;
    try { storage = window.sessionStorage; } catch { /* メモリ内フラグで継続 */ }
    tracker = createJourneyTracker(storage, (payload) => {
      void fetch("/api/usage", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        credentials: "omit", referrerPolicy: "no-referrer", keepalive: true,
      }).catch(() => { /* 遷移を妨げず、再試行しない。 */ });
    });
  }
  const waiting = pendingEvents;
  pendingEvents = [];
  waiting.forEach((event) => tracker!.record(event));
  publish("enabled");
}

export function recordUsage(event: UsageEventName): void {
  if (status !== "enabled" && status !== "loading") return;
  // ブラウザ設定・別タブでの停止を各送信前にも確認する。
  if (privacyStopped() || preferenceStopped()) { void initializeUsage(); return; }
  if (status === "loading") {
    if (pendingEvents.length < 32) pendingEvents.push(event);
    return;
  }
  tracker?.record(event);
}

export function setUsageOptOut(value: boolean): void {
  optedOut = value;
  try {
    if (value) window.localStorage.setItem(USAGE_PREFERENCE_KEY, "1");
    else window.localStorage.removeItem(USAGE_PREFERENCE_KEY);
    memoryPreference = undefined;
  } catch { memoryPreference = value; }
  if (value) { resetJourney(); publish("disabled"); }
  else { publish("loading"); void initializeUsage(); }
}
