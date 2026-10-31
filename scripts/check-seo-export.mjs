// 生成済みoutと収録JSONの読取のみ。通信・書込・収集は行わない。
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { load } from "cheerio";
import { getLivingTopics, getLegislators } from "../lib/data.ts";
import { livingTopicMetadata } from "../lib/living-topic-meta.ts";
import { NAGOYA_WARDS } from "../lib/area.ts";

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
const topics = getLivingTopics();
for (const topic of topics) {
  const $ = pages.get(`/issues/${topic.issueId}/`);
  assert.ok($, topic.issueId);
  const expected = livingTopicMetadata(topic);
  assert.equal($("h1").text(), expected.title);
  assert.equal($("meta[name=description]").attr("content"), expected.description);
  assert.equal($('meta[property="og:description"]').attr("content"), expected.description);
  assert.ok($("#living-topic").text().includes(topic.region.text));
  assert.ok($("#living-topic").text().includes(topic.period.text));
  assert.ok($(`time[datetime="${topic.confirmedAt}"]`).length);
  for (const source of topic.sources) {
    const node = $(`#living-source-${topic.issueId}-${source.id}`);
    assert.equal(node.find("a").attr("href"), source.url);
    if (source.checkedAt) {
      assert.ok(node.find(`time[datetime="${source.checkedAt}"]`).length);
      assert.ok(node.text().includes(source.checkNote));
    }
  }
}
for (const ward of NAGOYA_WARDS) {
  const $ = pages.get(`/area/${ward.slug}/`);
  assert.ok($, ward.slug);
  assert.ok($("h1").text().includes(`名古屋市${ward.ward}`));
  assert.ok($("#area-roster-verification-heading").length);
  assert.ok($("main").text().includes("資料確認日"));
  assert.ok($("main").text().includes("公式出典"));
  for (const topic of topics) {
    assert.ok($("a[href]").toArray().some((a) => new URL($(a).attr("href"), base).pathname.replace(/\/$/, "") === `/issues/${topic.issueId}`));
  }
}
console.log(JSON.stringify({ wardsChecked: NAGOYA_WARDS.length, livingTopicsChecked: topics.length, sitemapUrls: urls.length, canonicalChecked: pages.size, htmlReachable: reached.size, localDescriptionsChecked: local, lastmod: "omitted" }, null, 2));
