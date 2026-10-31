// 使い捨ての照合記録のみ使用。実名簿・外部API・本番計測に接続しない。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import type { Legislator } from "../lib/types";
import { AreaRosterVerification } from "../components/AreaRosterVerification";

const fixture: Legislator = {
  id: "fixture-national",
  name: "架空の議員",
  kana: "かくうのぎいん",
  level: "national",
  district: "架空選挙区",
  sourceUrl: "https://example.org/profile-only",
  verification: {
    membership: {
      status: "verified", checkedAt: "2026-10-23", sourceAsOf: "2026-09-28",
      sourceUrls: ["https://example.org/membership"],
    },
    affiliation: {
      status: "unconfirmed", checkedAt: "2026-10-20",
      sourceUrls: ["https://example.org/affiliation"], note: "所属は確認不十分です。",
    },
  },
};

test("項目ごとの資料確認日と資料基準日を維持し、ページ更新日で補完しない", () => {
  const html = renderToStaticMarkup(createElement(AreaRosterVerification, { legislators: [structuredClone(fixture)] }));
  const $ = load(html);
  const summary = $("section > dl > div");
  assert.match(summary.eq(0).text(), /現職・氏名・選挙区[\s\S]*公式資料と照合 1名[\s\S]*2026-10-23/);
  assert.match(summary.eq(1).text(), /所属（国会は政党／県・市は会派）[\s\S]*現状は未確認 1名[\s\S]*2026-10-20/);
  assert.match($("details").text(), /資料の基準日：2026-09-28（資料確認日とは異なります）/);
  assert.match($("section").text(), /サイト更新日や資料の基準日とは異なります/);
  assert.ok(!html.includes("2026-10-31"));
  assert.deepEqual(new Set($("time").map((_, node) => $(node).attr("datetime")).get()), new Set(["2026-10-23", "2026-09-28", "2026-10-20"]));
});

test("掲載なし・未確認・確認記録なしを分け、所属がないとは推測しない", () => {
  const listed: Legislator = {
    ...structuredClone(fixture), id: "fixture-pref", level: "prefectural",
    verification: {
      membership: { status: "not_listed", checkedAt: "2026-10-21", sourceUrls: [], note: "確認した名簿に掲載がありません。" },
      affiliation: { status: "verified", checkedAt: "2026-10-22", sourceUrls: [] },
    },
  };
  const missing: Legislator = { ...fixture, id: "fixture-municipal", level: "municipal", verification: undefined };
  const $ = load(renderToStaticMarkup(createElement(AreaRosterVerification, { legislators: [fixture, listed, missing] })));
  const summary = $("section > dl > div");
  assert.match(summary.eq(0).text(), /公式資料と照合 1名 ／ 公式資料に掲載なし 1名 ／ 確認記録なし 1名/);
  assert.match(summary.eq(1).text(), /公式資料と照合 1名 ／ 現状は未確認 1名 ／ 確認記録なし 1名/);
  assert.ok($("details").text().includes("就任・所属がないことを示すものではありません"));
  assert.ok(!$("section").text().includes("無所属"));
  assert.equal($("details dt").filter((_, node) => $(node).text() === "所属政党").length, 1);
  assert.equal($("details dt").filter((_, node) => $(node).text() === "所属会派").length, 2);
});

test("公式出典は該当の照合記録から出力し、未照合のプロフィールURLを根拠に加えない", () => {
  const $ = load(renderToStaticMarkup(createElement(AreaRosterVerification, { legislators: [fixture] })));
  const sources = $("details a[target='_blank']").map((_, node) => $(node).attr("href")).get();
  assert.deepEqual(sources, ["https://example.org/membership", "https://example.org/affiliation"]);
  assert.ok(!sources.includes(fixture.sourceUrl));
  assert.equal($("details").attr("open"), undefined);
  assert.equal($("details a[href^='/legislators/']").length, 1);
});

test("対象者が未収録なら、空の照合結果を表示しない", () => {
  assert.equal(renderToStaticMarkup(createElement(AreaRosterVerification, { legislators: [] })), "");
});
