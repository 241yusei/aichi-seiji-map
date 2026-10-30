// 環境変数だけを差し替えるfixture。外部通信・データ収集・公開は行わない。
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const moduleUrl = new URL("../lib/site-meta.ts", import.meta.url).href;

function readSiteUrl(value?: string): string {
  const env = { ...process.env };
  delete env.NEXT_PUBLIC_SITE_URL;
  if (value !== undefined) env.NEXT_PUBLIC_SITE_URL = value;
  return execFileSync(process.execPath, [
    "--import", "tsx", "--input-type=module", "-e",
    `const { SITE_URL } = await import(${JSON.stringify(moduleUrl)}); process.stdout.write(SITE_URL);`,
  ], { env, encoding: "utf8" });
}

test("本番URL未設定でもCloudflareの正規URLを使う", () => {
  assert.equal(readSiteUrl(), "https://seiji-torisetsu.pages.dev");
});

test("末尾スラッシュのある設定からも重複スラッシュなしでページURLを組み立てられる", () => {
  const base = readSiteUrl("https://seiji-torisetsu.pages.dev///");
  assert.equal(`${base}/themes/bukka/`, "https://seiji-torisetsu.pages.dev/themes/bukka/");
});

test("明示した別環境の正規URLは保持する", () => {
  assert.equal(readSiteUrl("https://preview.example.test/"), "https://preview.example.test");
});

test("恒久転送の設定は旧本番ホストだけを対象にし、パスを渡す", () => {
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(config.buildCommand, "NEXT_PUBLIC_SITE_URL=https://seiji-torisetsu.pages.dev npm run build");
  assert.equal(config.redirects.length, 1);
  const rule = config.redirects[0];
  assert.equal(rule.source, "/:path(.*)");
  assert.equal(rule.destination, "https://seiji-torisetsu.pages.dev/:path*");
  assert.equal(rule.permanent, true);
  assert.equal(rule.has.length, 1);
  assert.equal(rule.has[0].type, "host");
  const host = new RegExp(rule.has[0].value);
  assert.ok(host.test("aichi-seiji-map.vercel.app"));
  for (const other of [
    "seiji-torisetsu.pages.dev",
    "aichi-seiji-avuuwnr98-y1007usei-5506s-projects.vercel.app",
    "preview-aichi-seiji-map.vercel.app",
    "aichi-seiji-map.vercel.app.example.test",
    "aichi-seiji-mapXvercelYapp",
  ]) assert.equal(host.test(other), false, other);
});

test("Vercel向け変換後もトップ・末尾スラッシュ付き詳細パスを対応先へ渡す", async () => {
  const moduleName = "next/dist/compiled/@vercel/routing-utils/superstatic.js";
  const routing = await import(moduleName);
  const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const compiled = routing.convertRedirects(config.redirects)[0];
  const matcher = new RegExp(compiled.src);
  assert.equal(compiled.status, 308);
  for (const path of ["/", "/start", "/start/", "/themes/bukka/", "/municipalities/oharu/", "/robots.txt", "/search/"]) {
    assert.ok(matcher.test(path), path);
    assert.equal(path.replace(matcher, compiled.headers.Location), `https://seiji-torisetsu.pages.dev${path}`);
  }
});
