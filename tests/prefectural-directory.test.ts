// 使い捨ての名簿fixtureのみ使用。実データ・外部API・計測送信への接続なし。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { PrefecturalDirectory } from "../components/PrefecturalDirectory";
import type { LegislatorListItem } from "../lib/types";

const prefectural: LegislatorListItem[] = Array.from({ length: 97 }, (_, index) => ({
  id: `pref-fixture-${index}`,
  name: `架空議員${index}`,
  kana: `かくうぎいん${String(index).padStart(2, "0")}`,
  level: "prefectural",
  district: `架空選挙区${index % 7}`,
}));

test("閉じた一覧の初期HTMLにも県議97名全員への通常リンクがあり、他の層を含まない", () => {
  const fixture = [
    ...prefectural,
    { ...prefectural[0], id: "national-fixture", level: "national" as const },
    { ...prefectural[0], id: "municipal-fixture", level: "municipal" as const },
  ];
  const $ = load(renderToStaticMarkup(createElement(PrefecturalDirectory, { legislators: fixture })));
  assert.equal($("details").attr("open"), undefined);
  assert.match($("summary").text(), /本サイト収録97名/);
  const paths = $("a[href]").map((_, node) => new URL($(node).attr("href")!, "https://example.org").pathname.replace(/\/$/, "")).get();
  assert.equal(paths.length, 97);
  assert.deepEqual(new Set(paths), new Set(prefectural.map((legislator) => `/legislators/${legislator.id}`)));
  assert.equal($("h3").length, 7);
  assert.equal($("button").length, 0);
});

test("公式名簿の選挙区表記を保ち、区内の氏名リンクをふりがな順にそろえる", () => {
  const fixture = [
    { ...prefectural[0], id: "yuki", name: "架空ゆき", kana: "かくうゆき", district: "架空市・架空郡選挙区" },
    { ...prefectural[1], id: "aki", name: "架空あき", kana: "かくうあき", district: "架空市・架空郡選挙区" },
  ];
  const $ = load(renderToStaticMarkup(createElement(PrefecturalDirectory, { legislators: fixture })));
  assert.equal($("h3").text(), "架空市・架空郡選挙区");
  assert.deepEqual($("a").map((_, node) => $(node).text()).get(), ["架空あき", "架空ゆき"]);
  assert.match($("details").text(), /本サイト収録2名/);
});

test("県議が未収録の場合は、空の名簿への操作を案内しない", () => {
  const html = renderToStaticMarkup(createElement(PrefecturalDirectory, { legislators: [] }));
  assert.equal(html, "");
});
