// 使い捨ての制度fixtureを使用。外部API・実ユーザー・計測送信への接続なし。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JourneyGuide } from "../components/JourneyGuide";
import { LivingTopicBrief } from "../components/LivingTopicBrief";
import type { LivingTopicBriefData } from "../lib/types";

const fixture: LivingTopicBriefData = {
  issueId: "transit", title: "テスト用の話題", summary: "テスト用の説明", caseTitle: "使い捨ての計画", confirmedAt: "2026-10-22",
  pageTitle: "架空地域の計画", region: {text: "架空地域", sourceIds: ["official"]}, period: {text: "2026年度", sourceIds: ["official"]},
  status: { text: "資料の公表を確認", sourceIds: ["official"] }, decisions: [], affected: [], responsibilities: [], costs: [], unknowns: [], nextChecks: [],
  sources: [{ id: "official", label: "テスト用の公式資料", url: "https://example.org/original?test=1&format=html" }],
};

test("地域結果から名前一覧へ案内し、読む順番を示す", () => {
  const html = renderToStaticMarkup(createElement(JourneyGuide, { stage: "representative" }));
  assert.ok(html.includes("代表者の名前を選ぶ"));
  assert.ok(html.includes('href="#representatives"'));
  const ordered = ["地域", "代表者", "暮らし", "一次資料"].map((word) => html.indexOf(`${word}</li>`));
  assert.ok(ordered.every((position, index) => position >= 0 && (index === 0 || position > ordered[index - 1])));
});

test("個人の記録とは別の3テーマを同条件で案内し、担当や賛否と誤認させない", () => {
  const html = renderToStaticMarkup(createElement(JourneyGuide, { stage: "topic" }));
  for (const id of ["kosodate", "transit", "bousai"]) assert.ok(html.includes(`href="/issues/${id}#living-topic"`));
  assert.equal((html.match(/<a /g) ?? []).length, 3);
  assert.ok(html.includes("この議員の担当・賛否を示すものではありません"));
  assert.ok(html.includes("対象地域はテーマごとに異なります"));
  assert.ok(!html.includes("/legislators/"));
});

test("初回は地域選択へ進め、ログインや個人情報を要求しない", () => {
  const html = renderToStaticMarkup(createElement(JourneyGuide, { stage: "start" }));
  assert.ok(html.includes('href="/area#region-picker"'));
  assert.ok(!html.includes("<input"));
});

test("資料一覧ショートカットと原本リンクを分け、出典・確認日を保持する", () => {
  const html = renderToStaticMarkup(createElement(LivingTopicBrief, { topic: structuredClone(fixture) }));
  assert.ok(html.includes('href="#living-sources"'));
  assert.ok(html.includes('id="living-sources"'));
  assert.ok(html.includes('id="living-source-transit-official"'));
  assert.ok(html.includes('href="https://example.org/original?test=1&amp;format=html"'));
  assert.ok(html.includes("公式サイトを別タブで開きます"));
  assert.match(html, /datetime="2026-10-22"/i);
  assert.match(html, /tabindex="-1"/i);
  assert.ok(html.includes('data-usage-event="source_reference_opened"'));
  assert.ok(html.includes('data-usage-event="source_external_opened"'));
});
