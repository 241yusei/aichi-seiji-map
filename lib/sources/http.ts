// 規約・robots を尊重する取得層。
// - 直列・低頻度（既定3秒間隔）
// - 連絡先入り User-Agent
// - ローカルキャッシュ（data/raw/<namespace>/）で再取得を最小化
// - robots.txt を尊重し、Disallow 先への取得は例外を投げて拒否（法令遵守をコードで担保）
//
// 注意: Node スクリプト（tsx）からのみ使う。ブラウザでは動かない。

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const CACHE_ROOT = join(process.cwd(), "data", "raw");
const CONTACT = process.env.SCRAPER_CONTACT_EMAIL ?? "contact@example.com";
export const USER_AGENT = `AichiSeijiMapBot/0.1 (+https://aichi-seiji.example.jp; ${CONTACT})`;

const DEFAULT_DELAY_MS = 3000;
let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 直前のリクエストから delayMs 以上空くまで待つ（直列・低頻度を担保）。 */
async function throttle(delayMs: number): Promise<void> {
  const wait = lastRequestAt + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
}

function cachePath(namespace: string, url: string, ext: string): string {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  return join(CACHE_ROOT, namespace, `${hash}.${ext}`);
}

function readCache(path: string): string | null {
  return existsSync(path) ? readFileSync(path, "utf-8") : null;
}

function writeCache(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

// --- robots.txt ---

interface RobotsRules {
  allow: string[];
  disallow: string[];
}

const robotsCache = new Map<string, RobotsRules>();

function parseRobots(text: string): RobotsRules {
  const rules: RobotsRules = { allow: [], disallow: [] };
  let appliesToAll = false;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === "user-agent") {
      appliesToAll = value === "*";
    } else if (appliesToAll && key === "disallow" && value) {
      rules.disallow.push(value);
    } else if (appliesToAll && key === "allow" && value) {
      rules.allow.push(value);
    }
  }
  return rules;
}

/** robots のパターン（* と末尾 $ の簡易対応）が pathname に一致するか。 */
function robotsMatch(pattern: string, pathname: string): boolean {
  const hasEnd = pattern.endsWith("$");
  const pat = hasEnd ? pattern.slice(0, -1) : pattern;
  const escaped = pat
    .split("*")
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp("^" + escaped + (hasEnd ? "$" : "")).test(pathname);
}

/** robots 準拠の可否判定。最長一致が優先、同長なら Allow を優先（標準的な解釈）。 */
function pathAllowed(rules: RobotsRules, pathname: string): boolean {
  const longest = (patterns: string[]): number => {
    let best = -1;
    for (const p of patterns) {
      if (robotsMatch(p, pathname) && p.length > best) best = p.length;
    }
    return best;
  };
  const dis = longest(rules.disallow);
  if (dis < 0) return true;
  return longest(rules.allow) >= dis;
}

async function loadRobots(origin: string): Promise<RobotsRules> {
  const cached = robotsCache.get(origin);
  if (cached) return cached;
  let rules: RobotsRules = { allow: [], disallow: [] };
  try {
    await throttle(1000);
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (res.ok) rules = parseRobots(await res.text());
  } catch {
    // robots 取得に失敗した場合は空ルール（取得側の判断に委ねる）
  }
  robotsCache.set(origin, rules);
  return rules;
}

// --- public API ---

interface FetchOpts {
  namespace: string;
  delayMs?: number;
  force?: boolean;
}

/** JSON を取得（API 用）。スロットル＋キャッシュ。robots は見ない（公開APIを想定）。 */
export async function getJson<T = unknown>(url: string, opts: FetchOpts): Promise<T> {
  const path = cachePath(opts.namespace, url, "json");
  if (!opts.force) {
    const cached = readCache(path);
    if (cached !== null) return JSON.parse(cached) as T;
  }
  await throttle(opts.delayMs ?? DEFAULT_DELAY_MS);
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  const text = await res.text();
  writeCache(path, text);
  return JSON.parse(text) as T;
}

/** HTML を取得（スクレイピング用）。robots を尊重し、Disallow なら例外を投げる。 */
export async function getHtml(
  url: string,
  opts: FetchOpts & { respectRobots?: boolean },
): Promise<string> {
  const u = new URL(url);
  if (opts.respectRobots !== false) {
    const rules = await loadRobots(u.origin);
    if (!pathAllowed(rules, u.pathname)) {
      throw new Error(`robots.txt により取得が許可されていません: ${url}`);
    }
  }
  const path = cachePath(opts.namespace, url, "html");
  if (!opts.force) {
    const cached = readCache(path);
    if (cached !== null) return cached;
  }
  await throttle(opts.delayMs ?? DEFAULT_DELAY_MS);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  const text = await res.text();
  writeCache(path, text);
  return text;
}

/** robots 可否のみを確認する（取得はしない）。テスト・linkout の安全確認に使う。 */
export async function isFetchAllowed(url: string): Promise<boolean> {
  const u = new URL(url);
  const rules = await loadRobots(u.origin);
  return pathAllowed(rules, u.pathname);
}
