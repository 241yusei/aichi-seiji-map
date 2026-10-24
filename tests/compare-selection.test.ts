// URL文字列のみの検証。ブラウザ履歴・外部API・本番データへの書込みなし。
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareSelectionUrl, readCompareSelection } from "../lib/compare-selection";

test("共有URLのA/B、未選択、空欄を読み取る", () => {
  assert.deepEqual(readCompareSelection("?a=fixture-a&b=fixture-b"), { aId: "fixture-a", bId: "fixture-b" });
  assert.deepEqual(readCompareSelection("?b=fixture-b&source=test"), { aId: null, bId: "fixture-b" });
  assert.deepEqual(readCompareSelection("?a=&b="), { aId: null, bId: null });
  assert.deepEqual(readCompareSelection(""), { aId: null, bId: null });
});

test("選択の変更・解除でも別のクエリとhashを保持する", () => {
  const source = "https://example.invalid/compare/?source=fixture&a=old-a&b=old-b#comparison";
  const selected = compareSelectionUrl(source, { aId: "new-a", bId: "old-b" });
  assert.equal(selected, "/compare/?source=fixture&a=new-a&b=old-b#comparison");
  assert.equal(compareSelectionUrl(source, { aId: null, bId: "old-b" }), "/compare/?source=fixture&b=old-b#comparison");
  assert.equal(compareSelectionUrl(source, { aId: null, bId: null }), "/compare/?source=fixture#comparison");
  assert.equal(compareSelectionUrl("https://example.invalid/compare/?a=old", { aId: null, bId: null }), "/compare/");
});

test("URL値のエンコードと履歴からの読み直しで選択を復元できる", () => {
  const selected = { aId: "fixture & a", bId: "fixture/日本語" };
  const href = compareSelectionUrl("https://example.invalid/compare/?source=fixture#table", selected);
  const restored = new URL(href, "https://example.invalid");
  assert.deepEqual(readCompareSelection(restored.search), selected);
  assert.equal(restored.searchParams.get("source"), "fixture");
  assert.equal(restored.hash, "#table");
  const previous = compareSelectionUrl(restored.href, { aId: "previous", bId: null });
  assert.deepEqual(readCompareSelection(new URL(previous, restored).search), { aId: "previous", bId: null });
  assert.deepEqual(readCompareSelection(restored.search), selected);
});
