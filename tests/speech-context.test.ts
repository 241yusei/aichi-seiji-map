import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { speechKeywordContext, keywordParts } from "../lib/speech-context";
import { ThemeSpeechCard } from "../components/ThemeSpeechCard";

test("冒頭ではなく一致語の前後を、直前の短い一文も残して抜粋する", () => {
  const text = "自己紹介です。".repeat(30) + "前提となる話です。物価に触れた文章です。説明が続きます。" + "続きの別の話です。".repeat(40);
  const context = speechKeywordContext(text, ["物価", "家計"]);
  assert.ok(context);
  assert.deepEqual(context.matched, ["物価"]);
  assert.ok(context.text.includes("前提となる話です。物価に触れた文章です。"));
  assert.ok(text.includes(context.text));
  assert.ok(context.before && context.after);
  assert.ok(context.text.length <= 300);
});

test("冒頭・末尾の一致、空語、一致なし、長い一文を処理する", () => {
  assert.equal(speechKeywordContext("本文", ["", "一致なし"]), null);
  const start = speechKeywordContext("物価の話です。", ["物価"]);
  assert.deepEqual(start, { matched: ["物価"], text: "物価の話です。", before: false, after: false });
  const end = speechKeywordContext("長い前置き".repeat(100) + "家計", ["家計"]);
  assert.ok(end?.text.endsWith("家計"));
  assert.equal(end?.after, false);
  const long = speechKeywordContext("前".repeat(400) + "物価" + "後".repeat(500), ["物価"]);
  assert.ok(long?.text.includes("物価"));
  assert.ok(long && long.text.length <= 300);
});

test("強調はリテラル一致で、文字列と出現順を保つ", () => {
  const text = "A+Bと物価高、物価。<test>";
  const parts = keywordParts(text, ["A+B", "物価", "物価高"]);
  assert.equal(parts.map((part) => part.text).join(""), text);
  assert.deepEqual(parts.filter((part) => part.matched).map((part) => part.text), ["A+B", "物価高", "物価"]);
});

test("発言者・会議/日付・一致語・自動抜粋・一次出典を分けて表示する", () => {
  const speech = { id: "fixture", legislatorId: "test", date: "2026-01-01", body: "テスト会議", text: "前提です。物価の話です。", sourceUrl: "https://example.org/source?a=1&b=2", aiSummary: "検証用の要約" };
  const html = renderToStaticMarkup(createElement(ThemeSpeechCard, { speech, speakerName: "検証用議員", theme: { label: "物価・くらし", keywords: ["物価"] } }));
  for (const text of ["検証用議員氏の発言", "テスト会議", "2026-01-01", "収録本文全体の一致語", "自動抜粋", "<mark", "全文・前後の発言", "AI要約", 'href="https://example.org/source?a=1&amp;b=2"']) assert.ok(html.includes(text), text);
  assert.match(html, /href="\/legislators\/test\/?"/);
  assert.ok(!html.includes("収録本文自体も抜粋"));
  const excerptHtml = renderToStaticMarkup(createElement(ThemeSpeechCard, { speech: { ...speech, isExcerpt: true }, theme: { label: "物価・くらし", keywords: ["物価"] } }));
  assert.ok(excerptHtml.includes("収録本文自体も抜粋です"));
  assert.equal(speech.text, "前提です。物価の話です。");
});
