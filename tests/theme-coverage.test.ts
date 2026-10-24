// 使い捨ての表示用fixtureのみ。出典URLへは接続しない。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SpeechCoverage } from "../components/DataCoverage";
import { ThemeEmptyState } from "../components/ThemeEmptyState";

test("発言日・成功日・直近の照会対象期間を分け、失敗時にも前回の収録を残して示す", () => {
  const html = renderToStaticMarkup(createElement(SpeechCoverage, {
    speeches: [{ date: "2021-04-13" }, { date: "2026-10-08" }],
    status: { sourceUrl: "https://example.org/api", lastSuccessfulCheck: "2026-10-18", from: "2026-07-22", until: "2026-10-20", targetCount: 2, succeededCount: 1, failedIds: ["fixture-2"] },
  }));
  for (const text of ["2021-04-13〜2026-10-08", "全対象への照会成功日：2026-10-18", "直近の照会対象期間：2026-07-22〜2026-10-20", "全件の網羅を示すものではありません", "2人中1人成功・1人失敗", "取得済みの記録を保持しています"]) assert.ok(html.includes(text), text);
});

test("収録・照会履歴がない場合に現在日や成功日を補わない", () => {
  const html = renderToStaticMarkup(createElement(SpeechCoverage, { speeches: [], status: null }));
  assert.ok(html.includes("収録期間：未収録"));
  assert.ok(html.includes("全対象への照会成功日：未記録"));
  assert.ok(!html.includes("直近の照会対象期間"));
});

test("テーマ0件を実際の発言ゼロと断定せず、公式検索と別テーマへ進める", () => {
  const html = renderToStaticMarkup(createElement(ThemeEmptyState));
  assert.ok(html.includes("発言が0件の状態"));
  assert.ok(html.includes("実際に発言がなかったことを示すものではありません"));
  assert.match(html, /href="https:\/\/kokkai\.ndl\.go\.jp\/"[^>]*target="_blank"/);
  assert.match(html, /href="\/themes\/?"/);
  assert.ok(html.includes("国立国会図書館・別タブ"));
});
