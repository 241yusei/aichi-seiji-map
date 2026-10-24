import { isUsagePayload } from "./usage-events";

/** Infrastructure-only shape: no request or visitor metadata reaches this binding. */
export interface UsageAnalyticsBinding {
  writeDataPoint(point: { indexes: string[]; blobs: string[]; doubles: number[] }): void;
}

export interface UsageServerEnv {
  USAGE_ENABLED?: string;
  USAGE_SITE_ORIGIN?: string;
  USAGE_ANALYTICS?: UsageAnalyticsBinding;
}

const MAX_BODY_BYTES = 256;
const RESPONSE_HEADERS = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" };

function empty(status = 204): Response {
  return new Response(null, { status, headers: RESPONSE_HEADERS });
}

function enabled(env: UsageServerEnv, origin: string): boolean {
  return env.USAGE_ENABLED === "true" && !!env.USAGE_ANALYTICS && env.USAGE_SITE_ORIGIN === origin;
}

/** Limit actual streamed bytes too; Content-Length is untrusted and can be absent. */
async function readSmallBody(request: Request): Promise<string | null> {
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

/** Same-origin, allowlisted event counts. Never log requests, errors, headers, or payloads. */
export async function handleUsageRequest(request: Request, env: UsageServerEnv): Promise<Response> {
  const url = new URL(request.url);
  if (url.search || url.href.includes("?")) return empty(400);
  if (url.pathname !== "/api/usage" && url.pathname !== "/api/usage/") return empty(404);
  const origin = request.headers.get("origin");
  const sameOrigin = url.origin === env.USAGE_SITE_ORIGIN && (origin === null || origin === env.USAGE_SITE_ORIGIN);
  if (request.method === "GET") {
    return Response.json({ enabled: sameOrigin && enabled(env, url.origin) }, { headers: RESPONSE_HEADERS });
  }
  if (request.method !== "POST") return empty(405);
  if (!env.USAGE_SITE_ORIGIN) return empty();
  if (!sameOrigin || origin !== env.USAGE_SITE_ORIGIN) return empty(403);
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return empty(415);
  const body = await readSmallBody(request);
  if (body === null) return empty(413);
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return empty(400); }
  if (!isUsagePayload(payload)) return empty(400);
  if (!enabled(env, url.origin)) return empty();
  try {
    env.USAGE_ANALYTICS!.writeDataPoint({ indexes: ["journey-v1"], blobs: [payload.event], doubles: [1] });
  } catch {
    // Measurement is best effort and must not affect the site's main interaction.
  }
  return empty();
}
