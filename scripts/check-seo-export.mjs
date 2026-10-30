// 生成済みoutと収録JSONの読取のみ。通信・書込・収集は行わない。
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { load } from "cheerio";
import { getLegislators } from "../lib/data.ts";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, "out");
const xml = load(await readFile(resolve(out, "sitemap.xml"), "utf8"), { xmlMode: true });
const urls = xml("loc").map((_, el) => xml(el).text()).get();
assert.equal(new Set(urls).size, urls.length, "sitemap URLの重複");
assert.equal(xml("lastmod").length, 0, "確認できないlastmodを付けない");
const base = new URL(urls[0]).origin;
const pages = new Map();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith(".html")) {
      const $ = load(await readFile(file, "utf8"));
      if (/noindex/.test($("meta[name=robots]").attr("content") ?? "")) continue;
      const rel = relative(out, file);
      const route = rel === "index.html" ? "/" : `/${dirname(rel)}/`;
      assert.equal($("link[rel=canonical]").length, 1, route);
      assert.equal($("link[rel=canonical]").attr("href"), base + route, route);
      assert.ok($("title").text(), route);
      assert.ok($("meta[name=description]").attr("content"), route);
      pages.set(route, $);
    }
  }
}
await walk(out);
assert.deepEqual(new Set(urls), new Set([...pages.keys()].map((p) => base + p)));
const reached = new Set(["/"]);
const queue = ["/"];
while (queue.length) {
  const from = queue.shift();
  const $ = pages.get(from);
  for (const href of $("a[href]").map((_, el) => $(el).attr("href")).get()) {
    const u = new URL(href, base + from);
    const path = u.pathname.endsWith("/") ? u.pathname : `${u.pathname}/`;
    if (u.origin === base && pages.has(path) && !reached.has(path)) {
      reached.add(path);
      queue.push(path);
    }
  }
}
assert.deepEqual([...pages.keys()].filter((p) => !reached.has(p)), [], "HTMLリンクから到達できないページ");
const roster = getLegislators();
let local = 0;
for (const l of roster) {
  if (l.level === "national") continue;
  const $ = pages.get(`/legislators/${l.id}/`);
  assert.ok($, l.id);
  assert.match($("meta[name=description]").attr("content"), /未収録/, l.id);
  local++;
}
console.log(JSON.stringify({ sitemapUrls: urls.length, canonicalChecked: pages.size, htmlReachable: reached.size, localDescriptionsChecked: local, lastmod: "omitted" }, null, 2));
