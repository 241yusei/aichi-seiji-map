"use client";

import { useEffect, useSyncExternalStore } from "react";
import { initializeUsage, setUsageOptOut, subscribeUsage, usageIsOptedOut, usageServerSnapshot, usageSnapshot } from "@/lib/usage-browser";

const MESSAGES = {
  loading: "設定を確認しています。",
  enabled: "この端末では、各段階への到達件数を送信します。",
  disabled: "この端末では、到達件数の送信を停止しています。",
  privacy: "ブラウザの追跡拒否設定（DNT / GPC）に合わせ、送信を停止しています。",
  unavailable: "現在、この環境の計測は稼働していません。",
} as const;

export function UsagePreferences() {
  const status = useSyncExternalStore(subscribeUsage, usageSnapshot, usageServerSnapshot);
  useEffect(() => { void initializeUsage(); }, []);
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p role="status" className="text-sm leading-relaxed">{MESSAGES[status]}</p>
      {status !== "loading" && status !== "privacy" && (
        <button type="button" onClick={() => setUsageOptOut(!usageIsOptedOut())} className="tap mt-3 rounded-xl border border-field bg-white px-4 py-2 text-sm font-medium">
          {usageIsOptedOut() ? "この端末で計測を許可する" : "この端末で計測を停止する"}
        </button>
      )}
      <p className="mt-3 text-xs leading-relaxed text-muted">停止設定だけをこのブラウザに保存します。保存できない場合は、このタブを開いている間に適用します。サイトの機能は引き続き使えます。</p>
    </div>
  );
}
