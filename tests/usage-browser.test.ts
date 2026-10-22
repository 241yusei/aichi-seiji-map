// Each case gets a fresh ESM browser module and fake globals, restored in finally.
// Test files run in Node's separate test processes; cases here are deliberately serial.
// All storage is disposable and global fetch is replaced before the module import.
import assert from "node:assert/strict";
import test from "node:test";
import { REGION_STORAGE_KEY } from "../lib/region-preference";
import { JOURNEY_STORAGE_KEY, USAGE_PREFERENCE_KEY } from "../lib/usage-journey";

type UsageBrowser = typeof import("../lib/usage-browser");
type Call = { input: string; init: RequestInit };
let sequence = 0;

async function withBrowser(run: (fixture: {
  api: UsageBrowser;
  calls: Call[];
  reads: string[];
  local: Map<string, string>;
  session: Map<string, string>;
  privacy: { doNotTrack: string | null; globalPrivacyControl: boolean };
  timeouts: number[];
  resolveConfig: (enabled: boolean) => void;
  rejectConfig: () => void;
  failWrites: () => void;
  failPosts: () => void;
}) => Promise<void>): Promise<void> {
  const original = new Map(["window", "navigator", "fetch"].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(AbortSignal, "timeout")!;
  const calls: Call[] = [];
  const reads: string[] = [];
  const timeouts: number[] = [];
  const local = new Map<string, string>([[REGION_STORAGE_KEY, "ward:naka"]]);
  const session = new Map<string, string>();
  const privacy = { doNotTrack: null as string | null, globalPrivacyControl: false };
  let writesFail = false;
  let postsFail = false;
  const storage = (values: Map<string, string>, label: string) => ({
    getItem(key: string) { reads.push(`${label}:${key}`); return values.get(key) ?? null; },
    setItem(key: string, value: string) { if (writesFail && label === "local") throw new Error("fixture quota"); values.set(key, value); },
    removeItem(key: string) { if (writesFail && label === "local") throw new Error("fixture quota"); values.delete(key); },
  });
  let resolve!: (response: Response) => void;
  let reject!: (error: Error) => void;
  const config = new Promise<Response>((yes, no) => { resolve = yes; reject = no; });
  const fakeFetch = (input: string, init: RequestInit = {}) => {
    calls.push({ input, init });
    if (init.method === "GET") return config;
    if (init.method === "POST") return postsFail ? Promise.reject(new Error("fixture offline")) : Promise.resolve(new Response(null, { status: 204 }));
    throw new Error("Unexpected fixture request");
  };
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: storage(local, "local"), sessionStorage: storage(session, "session") } });
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: privacy });
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fakeFetch });
    Object.defineProperty(AbortSignal, "timeout", { configurable: true, value: (milliseconds: number) => { timeouts.push(milliseconds); return new AbortController().signal; } });
    const api = await import(new URL(`../lib/usage-browser.ts?fixture=${++sequence}`, import.meta.url).href) as UsageBrowser;
    assert.equal(api.usageSnapshot(), "loading", "fixture must have fresh module state");
    await run({ api, calls, reads, local, session, privacy, timeouts, resolveConfig: (enabled) => resolve(Response.json({ enabled })), rejectConfig: () => reject(new Error("fixture config unavailable")), failWrites: () => { writesFail = true; }, failPosts: () => { postsFail = true; } });
    assert.ok(!reads.some((key) => key.endsWith(`:${REGION_STORAGE_KEY}`)), "measurement never reads the saved region");
    assert.equal(local.get(REGION_STORAGE_KEY), "ward:naka", "measurement never changes the saved region");
  } finally {
    for (const [key, descriptor] of original) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    Object.defineProperty(AbortSignal, "timeout", timeoutDescriptor);
  }
}

const sent = (calls: Call[]) => calls.filter((call) => call.init.method === "POST").map((call) => JSON.parse(String(call.init.body)));
const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

// Explicit concurrency:false also documents the shared-global isolation requirement.
test("config true flushes queued stages in order with only two payload keys and private request options", { concurrency: false }, () => withBrowser(async ({ api, calls, resolveConfig, timeouts }) => {
  const ready = api.initializeUsage();
  for (const event of ["region_step_viewed", "region_selected", "representative_viewed"] as const) api.recordUsage(event);
  assert.deepEqual(sent(calls), []);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].init.signal instanceof AbortSignal);
  assert.deepEqual(timeouts, [5000]);
  resolveConfig(true);
  await ready;
  assert.equal(api.usageSnapshot(), "enabled");
  assert.deepEqual(sent(calls), ["region_step_viewed", "region_selected", "representative_viewed"].map((event) => ({ version: 1, event })));
  for (const { input, init } of calls) {
    assert.equal(input, "/api/usage");
    assert.equal(init.credentials, "omit");
    assert.equal(init.referrerPolicy, "no-referrer");
    if (init.method === "POST") {
      assert.deepEqual(Object.keys(JSON.parse(String(init.body))).sort(), ["event", "version"]);
      assert.deepEqual(init.headers, { "Content-Type": "application/json" });
    }
  }
}));

test("loading queue caps at 32 and does not retain later stages beyond the cap", { concurrency: false }, () => withBrowser(async ({ api, calls, resolveConfig }) => {
  const ready = api.initializeUsage();
  for (let index = 0; index < 32; index++) api.recordUsage("region_step_viewed");
  api.recordUsage("region_selected");
  resolveConfig(true); await ready;
  assert.deepEqual(sent(calls), [{ version: 1, event: "region_step_viewed" }]);
  api.recordUsage("representative_viewed");
  assert.equal(sent(calls).length, 1, "dropped selection cannot satisfy a later stage");
  api.recordUsage("region_selected");
  api.recordUsage("representative_viewed");
  assert.equal(sent(calls).length, 3);
}));

test("config false or rejected discards pending stages with no POST", { concurrency: false }, async () => {
  for (const rejected of [false, true]) await withBrowser(async ({ api, calls, resolveConfig, rejectConfig }) => {
    const ready = api.initializeUsage();
    api.recordUsage("region_step_viewed"); api.recordUsage("region_selected");
    if (rejected) rejectConfig(); else resolveConfig(false);
    await ready;
    assert.equal(api.usageSnapshot(), "unavailable");
    api.recordUsage("representative_viewed");
    await api.initializeUsage();
    assert.equal(calls.length, 1, "failed config is not automatically retried");
    assert.deepEqual(sent(calls), []);
  });
});

test("stop during config wait discards queue; allow starts a fresh journey", { concurrency: false }, () => withBrowser(async ({ api, calls, resolveConfig, local, session }) => {
  const ready = api.initializeUsage();
  api.recordUsage("region_step_viewed"); api.recordUsage("region_selected");
  api.setUsageOptOut(true);
  assert.equal(local.get(USAGE_PREFERENCE_KEY), "1");
  assert.equal(api.usageSnapshot(), "disabled");
  resolveConfig(true); await ready;
  assert.deepEqual(sent(calls), []);
  assert.equal(session.has(JOURNEY_STORAGE_KEY), false);
  api.setUsageOptOut(false); await flush();
  assert.equal(api.usageSnapshot(), "enabled");
  assert.equal(local.has(USAGE_PREFERENCE_KEY), false);
  api.recordUsage("representative_viewed");
  assert.deepEqual(sent(calls), []);
  api.recordUsage("region_step_viewed"); api.recordUsage("region_selected"); api.recordUsage("representative_viewed");
  assert.equal(sent(calls).length, 3);
}));

test("DNT and GPC prevent GET and POST even after allow", { concurrency: false }, async () => {
  for (const signal of ["dnt", "gpc"] as const) await withBrowser(async ({ api, calls, privacy }) => {
    if (signal === "dnt") privacy.doNotTrack = "1"; else privacy.globalPrivacyControl = true;
    await api.initializeUsage();
    api.recordUsage("region_step_viewed");
    api.setUsageOptOut(false); await flush();
    assert.equal(api.usageSnapshot(), "privacy");
    assert.deepEqual(calls, []);
  });
});

test("privacy enabled during pending config prevents queued POST", { concurrency: false }, () => withBrowser(async ({ api, calls, privacy, resolveConfig }) => {
  const ready = api.initializeUsage(); api.recordUsage("region_step_viewed");
  privacy.globalPrivacyControl = true;
  resolveConfig(true); await ready;
  assert.equal(api.usageSnapshot(), "privacy");
  assert.deepEqual(sent(calls), []);
}));

test("failed localStorage writes retain memory stop and allow can resume", { concurrency: false }, () => withBrowser(async ({ api, calls, failWrites, resolveConfig }) => {
  failWrites();
  api.setUsageOptOut(true);
  await api.initializeUsage();
  api.recordUsage("region_step_viewed");
  assert.equal(api.usageIsOptedOut(), true);
  assert.equal(api.usageSnapshot(), "disabled");
  assert.deepEqual(calls, []);
  api.setUsageOptOut(false);
  resolveConfig(true); await flush();
  assert.equal(api.usageSnapshot(), "enabled");
  api.recordUsage("region_step_viewed");
  assert.equal(sent(calls).length, 1);
}));

test("failed POST does not throw, block later stages, or retry a completed event", { concurrency: false }, () => withBrowser(async ({ api, calls, resolveConfig, failPosts }) => {
  const ready = api.initializeUsage(); resolveConfig(true); await ready;
  failPosts();
  assert.doesNotThrow(() => api.recordUsage("region_step_viewed"));
  api.recordUsage("region_step_viewed");
  api.recordUsage("region_selected");
  await flush();
  await api.initializeUsage();
  api.recordUsage("region_step_viewed");
  assert.equal(api.usageSnapshot(), "enabled");
  assert.deepEqual(sent(calls).map((payload) => payload.event), ["region_step_viewed", "region_selected"]);
}));
