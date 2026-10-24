import assert from "node:assert/strict";
import { test } from "node:test";
import { filterSearchEntries, searchSuggestions, searchStateFromUrl, searchUrl } from "../lib/search-results";

const entries = Array.from({ length: 12 }, (_, i) => ({
  t: `架空${i}`, s: "テスト用", u: `/fixture/${i}/`, k: i % 2 ? "首長" : "議員", q: `名古屋 test ${i}`,
}));

test("既存のAND検索・全半角/大文字小文字・種別を候補にも適用する", () => {
  const result = filterSearchEntries(entries, " 名古屋　ＴＥＳＴ ", "議員");
  assert.deepEqual(result.map((entry) => entry.t), ["架空0", "架空2", "架空4", "架空6", "架空8", "架空10"]);
  assert.deepEqual(filterSearchEntries(entries, "名古屋 ない語", ""), []);
  assert.deepEqual(filterSearchEntries(entries, "", ""), entries);
});

test("候補は空入力では出さず、既存の索引順で最大6件にする", () => {
  assert.deepEqual(searchSuggestions(entries, "  "), []);
  assert.deepEqual(searchSuggestions(entries, "名古屋"), entries.slice(0, 6));
  assert.deepEqual(searchSuggestions([], "名古屋"), []);
});

test("検索URLは条件を復元し、他のquery・hashを保つ", () => {
  const current = new URL("https://example.org/search/?other=keep#main");
  const target = searchUrl(current, "名古屋 TEST", "議員");
  const next = new URL(target, current);
  assert.deepEqual(searchStateFromUrl(next), { query: "名古屋 TEST", kind: "議員" });
  assert.equal(next.searchParams.get("other"), "keep");
  assert.equal(next.hash, "#main");
  assert.equal(searchUrl(next, "", ""), "/search/?other=keep#main");
  assert.deepEqual(searchStateFromUrl(new URL("https://example.org/search/?q=test&kind=unknown")), { query: "test", kind: "" });
});
