// 出典リンクの生存チェック（網羅・低依存）。
// data/*.json 内の全URLを抽出し、HTTPで生存確認する。公式サイトはURLを変えるため、
// 定期実行（npm run check:links / 月次GitHub Action）で「リンク切れ＝信頼の劣化」を早期検知する。
//   実行: npm run check:links
//   全URL（会議録1600件含む）も確認: CHECK_ALL=1 npm run check:links
// 仕様:
//   - 会議録(kokkai.ndl.go.jp)はAPI永続リンクのため既定ではサンプル抽出（KOKKAI_SAMPLE件）。
//   - x.com/twitter.com はbot遮断で403が正常に出るため「警告」止まり（失敗にしない）。
//   - 404/410/000(到達不能) を「不備」として exit 1。CI で赤くなる。

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
const KOKKAI_SAMPLE = Number(process.env.KOKKAI_SAMPLE ?? "40");
const CHECK_ALL = process.env.CHECK_ALL === "1";
const CONCURRENCY = Number(process.env.LINK_CONCURRENCY ?? "8");
const TIMEOUT_MS = 20000;

function walk(node: unknown, urls: Set<string>): void {
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node)) urls.add(node);
  } else if (Array.isArray(node)) {
    for (const x of node) walk(x, urls);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) walk(v, urls);
  }
}

function collectUrls(): string[] {
  const urls = new Set<string>();
  for (const f of readdirSync(DATA_DIR)) {
    if (!f.endsWith(".json")) continue;
    try {
      walk(JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8")), urls);
    } catch {
      // 壊れたJSONは validate 側で検出される。ここでは無視。
    }
  }
  return [...urls];
}

type Status = { url: string; code: number; kind: "ok" | "warn" | "fail" };

async function fetchOnce(url: string): Promise<number> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (PolitorisetsuLinkCheck)" },
    });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

async function check(url: string): Promise<Status> {
  const isX = /^https?:\/\/(x\.com|twitter\.com)\//.test(url);
  // ネットワーク例外（タイムアウト・接続リセット）は一時的なことが多いので最大2回試す。
  // HTTPステータスが返ればそれを採用（404等は確実な死なのでリトライ不要）。
  let code = 0;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      code = await fetchOnce(url);
      break;
    } catch {
      code = 0; // 次の試行へ
    }
  }
  // X は bot 遮断（403/429）が正常に起きるため警告止まり。
  if (isX && (code === 403 || code === 429)) return { url, code, kind: "warn" };
  if (code >= 200 && code < 400) return { url, code, kind: "ok" };
  // 一部サーバは GET を弾く→ 403/429 は警告、404/410/0(到達不能) は不備。
  if (code === 403 || code === 429) return { url, code, kind: "warn" };
  return { url, code, kind: "fail" };
}

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<Status>): Promise<Status[]> {
  const out: Status[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out.push(await fn(items[idx]));
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const all = collectUrls();
  const kokkai = all.filter((u) => u.includes("kokkai.ndl.go.jp"));
  const rest = all.filter((u) => !u.includes("kokkai.ndl.go.jp"));
  const sampledKokkai = CHECK_ALL
    ? kokkai
    : kokkai.filter((_, idx) => idx % Math.max(1, Math.ceil(kokkai.length / KOKKAI_SAMPLE)) === 0);

  const target = [...rest, ...sampledKokkai];
  console.log(
    `URL総数 ${all.length}（会議録 ${kokkai.length} / その他 ${rest.length}）。` +
      `今回チェック ${target.length} 件（会議録は${CHECK_ALL ? "全数" : `サンプル${sampledKokkai.length}`}）。`,
  );

  const results = await pool(target, CONCURRENCY, check);
  const fails = results.filter((r) => r.kind === "fail");
  const warns = results.filter((r) => r.kind === "warn");

  if (warns.length) {
    console.log(`\n⚠ 警告 ${warns.length} 件（bot遮断等・要目視）:`);
    for (const w of warns) console.log(`  ${w.code}  ${w.url}`);
  }
  if (fails.length) {
    console.log(`\n✗ リンク切れ ${fails.length} 件:`);
    for (const f of fails) console.log(`  ${f.code}  ${f.url}`);
    console.error(`\n不備 ${fails.length} 件を検出しました。出典URLの更新が必要です。`);
    process.exit(1);
  }
  console.log(`\n✓ リンク切れなし（OK ${results.filter((r) => r.kind === "ok").length} / 警告 ${warns.length}）。`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
