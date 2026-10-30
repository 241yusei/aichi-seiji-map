import type { UsageEventName, UsagePayload } from "./types";

export const USAGE_EVENTS = [
  "region_step_viewed",
  "region_selected",
  "representative_viewed",
  "living_topic_viewed",
  "source_reference_opened",
  "source_external_opened",
] as const satisfies readonly UsageEventName[];

export function isUsageEvent(value: unknown): value is UsageEventName {
  return typeof value === "string" && (USAGE_EVENTS as readonly string[]).includes(value);
}

export function isUsagePayload(value: unknown): value is UsagePayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.keys(record).length === 2 && Object.hasOwn(record, "version") &&
    Object.hasOwn(record, "event") && record.version === 1 && isUsageEvent(record.event);
}
