// ブラウザ・本番・外部接続を使わず、使い捨ての保存領域と送信関数で検証する。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createJourneyTracker, JOURNEY_STORAGE_KEY, privacySignalStopsUsage } from "../lib/usage-journey";
import { isUsagePayload, USAGE_EVENTS } from "../lib/usage-events";
import type { UsagePayload } from "../lib/types";

function fixture(initial?: string) {
  const values = new Map<string, string>(initial ? [[JOURNEY_STORAGE_KEY, initial]] : []);
  const sent: UsagePayload[] = [];
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  return { values, sent, storage, tracker: createJourneyTracker(storage, (payload) => sent.push(payload)) };
}

test("直接テーマ/代表者に入った操作は地域開始の導線に混ぜない", () => {
  const f = fixture();
  for (const event of USAGE_EVENTS.slice(1)) assert.equal(f.tracker.record(event), false);
  assert.deepEqual(f.sent, []);
  assert.equal(f.values.size, 0);
});

test("前段を通ったイベントだけをタブ内一度送り、記録に識別情報を持たない", () => {
  const f = fixture();
  for (const event of USAGE_EVENTS) {
    assert.equal(f.tracker.record(event), true);
    assert.equal(f.tracker.record(event), false);
  }
  assert.deepEqual(f.sent, USAGE_EVENTS.map((event) => ({ version: 1, event })));
  assert.deepEqual(JSON.parse(f.values.get(JOURNEY_STORAGE_KEY)!), USAGE_EVENTS);
  assert.equal(f.values.size, 1);
  const afterReload = createJourneyTracker(f.storage, (payload) => f.sent.push(payload));
  for (const event of USAGE_EVENTS) assert.equal(afterReload.record(event), false);
  assert.equal(f.sent.length, 6);
});

test("出典一覧クリックは外部原本クリックの必須前段にしない", () => {
  const f = fixture();
  for (const event of USAGE_EVENTS.slice(0, 4)) f.tracker.record(event);
  assert.equal(f.tracker.record("source_external_opened"), true);
  assert.equal(f.sent.some((payload) => payload.event === "source_reference_opened"), false);
});

test("壊れた保存値で前段を飛ばさず、停止時に段階フラグを消す", () => {
  for (const initial of ["not-json", "{}", '["person-123","living_topic_viewed","representative_viewed"]']) {
    const f = fixture(initial);
    assert.equal(f.tracker.record("source_external_opened"), false);
    assert.equal(f.tracker.record("region_step_viewed"), true);
    f.tracker.reset();
    assert.equal(f.values.has(JOURNEY_STORAGE_KEY), false);
    assert.equal(f.tracker.record("region_selected"), false);
  }
});

test("保存不能・送信失敗でも操作を妨げず、自動再送しない", () => {
  const broken = { getItem() { throw Error("storage denied"); }, setItem() { throw Error("storage denied"); }, removeItem() { throw Error("storage denied"); } };
  let attempts = 0;
  const tracker = createJourneyTracker(broken, () => { attempts++; throw Error("network unavailable"); });
  assert.equal(tracker.record("region_step_viewed"), true);
  assert.equal(tracker.record("region_step_viewed"), false);
  assert.equal(tracker.record("region_selected"), true);
  assert.equal(attempts, 2);
  assert.doesNotThrow(() => tracker.reset());
});

test("DNTとGPCの停止信号を尊重する", () => {
  assert.equal(privacySignalStopsUsage({ doNotTrack: "1" }), true);
  assert.equal(privacySignalStopsUsage({ doNotTrack: "yes" }), true);
  assert.equal(privacySignalStopsUsage({ globalPrivacyControl: true }), true);
  assert.equal(privacySignalStopsUsage({ doNotTrack: "0", globalPrivacyControl: false }), false);
});

test("イベント形式はversionと許可eventの2項目だけ", () => {
  for (const event of USAGE_EVENTS) assert.equal(isUsagePayload({ version: 1, event }), true);
  for (const value of [null, [], "region_selected", { event: "region_selected" }, { version: 2, event: "region_selected" }, { version: 1, event: "ward:naka" }, { version: 1, event: "region_selected", url: "/area/naka/" }]) assert.equal(isUsagePayload(value), false);
});
