// 使い捨てfixtureのみ。外部資料・本番へ接続しない。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FactCardView } from "../components/FactCardView";
import { factCardSchema } from "../lib/zod-schemas";
import type { FactCard } from "../lib/types";

const fixture: FactCard = {
  id: "fixture",
  title: "検証用の記録",
  hook: "日付の意味を混同しない",
  cardType: "comparison",
  body: "資料に基準日の明記がない場合は推定しません。",
  caveat: "資料を閲覧した日と、その資料の基準日は別です。",
  sources: [{ label: "検証用資料", url: "https://example.invalid/report" }],
  publishedAt: "2026-06-08",
  updatedAt: "2026-10-30",
};

test("更新日を進めても、資料確認日や集計基準日を補完しない", () => {
  const html = renderToStaticMarkup(createElement(FactCardView, { card: fixture }));
  assert.ok(html.includes('dateTime="2026-10-30"'));
  assert.ok(!html.includes("資料確認日："));
  assert.ok(!html.includes("数字の集計時点："));
});

test("公表・更新・資料確認・集計の4日付を別の意味で表示する", () => {
  const card: FactCard = { ...fixture, checkedAt: "2026-10-29", asOf: "2025-12-31" };
  const html = renderToStaticMarkup(createElement(FactCardView, { card }));
  assert.match(html, /公開.*?dateTime="2026-06-08"/);
  assert.match(html, /更新：.*?dateTime="2026-10-30"/);
  assert.match(html, /資料確認日：.*?dateTime="2026-10-29"/);
  assert.match(html, /数字の集計時点：.*?dateTime="2025-12-31"/);
  assert.ok(html.includes("資料の基準日とは異なります"));
});

test("資料確認日は実在する暦日だけを受け付け、未記録の既存カードも読める", () => {
  assert.ok(factCardSchema.safeParse(fixture).success);
  assert.ok(factCardSchema.safeParse({ ...fixture, checkedAt: "2026-10-30" }).success);
  for (const checkedAt of ["2026-02-30", "2026-13-01", "2026-10-30T00:00:00Z", ""]) {
    assert.equal(factCardSchema.safeParse({ ...fixture, checkedAt }).success, false);
  }
});
