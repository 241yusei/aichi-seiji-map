// Pure Request/Response fixtures and an in-memory binding. No network or real dataset.
import assert from "node:assert/strict";
import test from "node:test";
import { handleUsageRequest, type UsageServerEnv } from "../lib/usage-server";
import { USAGE_EVENTS } from "../lib/usage-events";

const SITE = "https://example.test";
function fixture() {
  const points: unknown[] = [];
  const env: UsageServerEnv = { USAGE_ENABLED: "true", USAGE_SITE_ORIGIN: SITE, USAGE_ANALYTICS: { writeDataPoint: (point) => { points.push(point); } } };
  return { points, env };
}
function post(body: string = JSON.stringify({ version: 1, event: "region_selected" }), headers: Record<string, string> = {}, path = "/api/usage") {
  return new Request(`${SITE}${path}`, { method: "POST", headers: { origin: SITE, "content-type": "application/json", ...headers }, body });
}

test("all allowlisted events save only fixed index, event name and count", async () => {
  const { env, points } = fixture();
  for (const event of USAGE_EVENTS) {
    const response = await handleUsageRequest(post(JSON.stringify({ version: 1, event }), { "user-agent": "private-agent", referer: `${SITE}/private`, "cf-connecting-ip": "192.0.2.1" }), env);
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.deepEqual(points, USAGE_EVENTS.map((event) => ({ indexes: ["journey-v1"], blobs: [event], doubles: [1] })));
});

test("strict payload rejects extra fields, unknown event, wrong version and JSON shape", async () => {
  const { env, points } = fixture();
  for (const value of [{ version: 1, event: "region_selected", postcode: "4600008" }, { version: 2, event: "region_selected" }, { version: "1", event: "region_selected" }, { version: 1, event: "private-topic" }, { event: "region_selected" }, null, [], "region_selected"]) {
    assert.equal((await handleUsageRequest(post(JSON.stringify(value)), env)).status, 400);
  }
  assert.equal((await handleUsageRequest(post("{"), env)).status, 400);
  assert.deepEqual(points, []);
});

test("cross-origin, absent Origin, query and wrong media type never write", async () => {
  const { env, points } = fixture();
  assert.equal((await handleUsageRequest(post(undefined, { origin: "https://other.test" }), env)).status, 403);
  const absent = post(); absent.headers.delete("origin");
  assert.equal((await handleUsageRequest(absent, env)).status, 403);
  for (const path of ["/api/usage?topic=private", "/api/usage?"]) assert.equal((await handleUsageRequest(post(undefined, {}, path), env)).status, 400);
  assert.equal((await handleUsageRequest(post(undefined, { "content-type": "text/plain" }), env)).status, 415);
  assert.equal((await handleUsageRequest(new Request(`${SITE}/api/usage`, { method: "PUT" }), env)).status, 405);
  assert.deepEqual(points, []);
});

test("size cap checks actual UTF-8 stream bytes without trusting Content-Length", async () => {
  const { env, points } = fixture();
  assert.equal((await handleUsageRequest(post(" ".repeat(257), { "content-length": "1" }), env)).status, 413);
  assert.equal((await handleUsageRequest(post("界".repeat(86)), env)).status, 413);
  assert.equal((await handleUsageRequest(post(undefined, { "content-length": "257" }), env)).status, 413);
  assert.equal((await handleUsageRequest(post(JSON.stringify({ version: 1, event: "region_selected" }).padEnd(256)), env)).status, 204);
  assert.equal(points.length, 1);
});

test("unconfigured, preview, disabled and missing binding discard without errors", async () => {
  const { env, points } = fixture();
  for (const inactive of [{}, { ...env, USAGE_ENABLED: "false" }, { ...env, USAGE_ANALYTICS: undefined }, { USAGE_ENABLED: "false", USAGE_SITE_ORIGIN: "" }]) {
    assert.equal((await handleUsageRequest(post(), inactive)).status, 204);
    assert.deepEqual(await (await handleUsageRequest(new Request(`${SITE}/api/usage`), inactive)).json(), { enabled: false });
  }
  assert.deepEqual(points, []);
  env.USAGE_ANALYTICS = { writeDataPoint: () => { throw new Error("offline"); } };
  assert.equal((await handleUsageRequest(post(), env)).status, 204);
});

test("GET capability reveals only boolean and requires exact configured destination origin", async () => {
  const { env, points } = fixture();
  const response = await handleUsageRequest(new Request(`${SITE}/api/usage`), env);
  assert.deepEqual(await response.json(), { enabled: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await (await handleUsageRequest(new Request(`${SITE}/api/usage`, { headers: { origin: "https://other.test" } }), env)).json(), { enabled: false });
  assert.deepEqual(await (await handleUsageRequest(new Request("https://preview.test/api/usage"), env)).json(), { enabled: false });
  assert.deepEqual(points, []);
});

test("chunked bodies are bounded while reading and stream errors never write", async () => {
  const { env, points } = fixture();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) { controller.enqueue(new Uint8Array(128).fill(32)); },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  const init: RequestInit & { duplex: "half" } = { method: "POST", headers: { origin: SITE, "content-type": "application/json" }, body: stream, duplex: "half" };
  assert.equal((await handleUsageRequest(new Request(`${SITE}/api/usage`, init), env)).status, 413);
  assert.equal(cancelled, true);
  const broken = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("disconnected")); } });
  assert.equal((await handleUsageRequest(new Request(`${SITE}/api/usage`, { ...init, body: broken }), env)).status, 413);
  assert.deepEqual(points, []);
});
