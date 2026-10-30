"use client";

import { useEffect, useRef } from "react";
import type { UsageEventName } from "@/lib/types";
import { initializeUsage, recordUsage, subscribeUsage, usageSnapshot } from "@/lib/usage-browser";

/** 描画済みの段階だけを観測。プリフェッチや非表示のページは数えない。 */
export function JourneyMilestone({ event }: { event: UsageEventName }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) return;
    let visible = false;
    const observe = () => {
      if (visible && document.visibilityState === "visible" && (usageSnapshot() === "enabled" || usageSnapshot() === "loading")) recordUsage(event);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; observe(); }, { threshold: 0 });
    observer.observe(node);
    const unsubscribe = subscribeUsage(observe);
    document.addEventListener("visibilitychange", observe);
    void initializeUsage();
    return () => { observer.disconnect(); unsubscribe(); document.removeEventListener("visibilitychange", observe); };
  }, [event]);
  return <span ref={ref} aria-hidden="true" className="block h-px w-px" />;
}
