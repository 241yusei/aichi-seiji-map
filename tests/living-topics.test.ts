// 外部接続・本番への書込みなし。案件データはテストごとに使い捨てfixtureを生成する。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LivingTopicBrief } from "../components/LivingTopicBrief";
import type { LivingTopicBriefData } from "../lib/types";
import { livingTopicSchema, livingTopicsSchema } from "../lib/zod-schemas";
import { livingTopicMetadata } from "../lib/living-topic-meta";

function fixture(issueId = "kosodate"): LivingTopicBriefData {
  const sourced = (text: string) => ({ text, sourceIds: ["official"] });
  return {
    issueId,
    title: "暮らしの案件 <fixture>",
    summary: "確認した計画と、未確認の費用を分けて説明します。",
    caseTitle: "テスト用の具体的計画",
    pageTitle: "架空地域の計画：対象と公式資料",
    region: sourced("架空地域"),
    period: sourced("2026年度の計画"),
    confirmedAt: "2026-10-22",
    status: sourced("計画の公表を確認しました。"),
    decisions: [sourced("計画期間が示されています。")],
    affected: [sourced("対象者が示されています。")],
    responsibilities: [
      { ...sourced("制度の枠組みを示します。"), level: "national", label: "国" },
      { ...sourced("広域調整を行います。"), level: "prefectural", label: "県" },
      { ...sourced("地域の案内を行います。"), level: "municipal", label: "市町村" },
    ],
    costs: [{ text: "個別の費用は未確認です。", sourceIds: [] }],
    unknowns: [{ text: "今後の実施状況は未確認です。", sourceIds: [] }],
    nextChecks: [sourced("次に年次報告を確認します。")],
    sources: [{ id: "official", label: "確認に使った公式資料", url: "https://example.org/policy?year=2026&edition=1" }],
  };
}

test("暮らしの3テーマを、確認日と具体案件を持つ別々のデータとして受け付ける", () => {
  const topics = [fixture("kosodate"), fixture("transit"), fixture("bousai")];
  assert.equal(livingTopicsSchema.safeParse(topics).success, true);
  assert.equal(livingTopicsSchema.safeParse([topics[0], topics[0], topics[2]]).success, false);
  assert.equal(livingTopicsSchema.safeParse(topics.slice(0, 2)).success, false);
});

test("各記述が存在する出典IDを参照し、出典IDの重複を許さない", () => {
  const unknown = fixture();
  unknown.decisions[0].sourceIds = ["unknown-source"];
  assert.equal(livingTopicSchema.safeParse(unknown).success, false);

  const duplicate = fixture();
  duplicate.sources.push({ ...duplicate.sources[0] });
  assert.equal(livingTopicSchema.safeParse(duplicate).success, false);
});

test("空の出典参照は未確認と明示する記述に限り許可する", () => {
  const topic = fixture();
  assert.equal(livingTopicSchema.safeParse(topic).success, true);
  for (const text of ["全員無料です。", "費用の記載がありません。", "次の発表日は未公表です。"]) {
    const unsupported = fixture();
    unsupported.costs[0] = { text, sourceIds: [] };
    assert.equal(livingTopicSchema.safeParse(unsupported).success, false, text);
  }
});

test("案件の確認状況には、未確認と書いた場合でも根拠資料を必須にする", () => {
  const topic = fixture();
  topic.status = { text: "現在の状況は未確認です。", sourceIds: [] };
  assert.equal(livingTopicSchema.safeParse(topic).success, false);
});

test("具体案件・7つの説明欄・確認日・未確認の費用を実レンダリングする", () => {
  for (const issueId of ["kosodate", "transit", "bousai"]) {
    const topic = fixture(issueId);
    const html = renderToStaticMarkup(createElement(LivingTopicBrief, { topic }));
    for (const heading of ["何が決まった？", "誰の暮らしに関わる？", "国・県・市町村の担当", "いくらかかる？", "まだ分からないこと", "次に確認すること", "確認に使った一次資料"]) {
      assert.ok(html.includes(heading), `${issueId}: ${heading}`);
    }
    assert.ok(html.includes(topic.caseTitle));
    assert.match(html, /datetime="2026-10-22"/i);
    assert.ok(html.includes("個別の費用は未確認です。"));
    assert.ok(html.includes("&lt;fixture&gt;"));
    assert.ok(!html.includes("<fixture>"));
  }
});

test("記述の出典リンクと資料一覧のアンカーをテーマごとに対応させる", () => {
  const topic = fixture("transit");
  const html = renderToStaticMarkup(createElement(LivingTopicBrief, { topic }));
  assert.ok(html.includes('href="#living-source-transit-official"'));
  assert.ok(html.includes('id="living-source-transit-official"'));
  assert.ok(html.includes('href="https://example.org/policy?year=2026&amp;edition=1"'));
  assert.ok(html.includes('aria-label="出典1を確認"'));
  assert.ok(!html.includes("出典0"));
});

test("対象地域・計画の版も必ず存在する資料に結び付ける", () => {
  for (const key of ["region", "period"] as const) {
    const noSource = fixture();
    noSource[key].sourceIds = [];
    assert.equal(livingTopicSchema.safeParse(noSource).success, false);
    const wrongSource = fixture();
    wrongSource[key].sourceIds = ["unknown"];
    assert.equal(livingTopicSchema.safeParse(wrongSource).success, false);
  }
});

test("検索説明と本文で地域・資料の時点・確認日を一致させ、現在日に置き換えない", () => {
  const topic = fixture();
  const metadata = livingTopicMetadata(topic);
  assert.equal(metadata.title, topic.pageTitle);
  const html = renderToStaticMarkup(createElement(LivingTopicBrief, { topic }));
  for (const text of [topic.region.text, topic.period.text, topic.caseTitle]) {
    assert.ok(metadata.description.includes(text));
    assert.ok(html.includes(text));
  }
  assert.ok(metadata.description.includes("2026-10-22"));
  assert.match(html, /datetime="2026-10-22"/i);
  assert.ok(html.includes("リアルタイムで確認した日ではありません"));
});

test("資料1件の読み直しで、解説全体の確認日を進めない", () => {
  const topic = fixture();
  topic.sources[0].checkedAt = "2026-10-31";
  assert.equal(livingTopicSchema.safeParse(topic).success, false);
  topic.sources[0].checkNote = "案内本文のみ。関連資料の全文は未確認です。";
  assert.equal(livingTopicSchema.safeParse(topic).success, true);
  const html = renderToStaticMarkup(createElement(LivingTopicBrief, { topic }));
  for (const day of ["2026-10-22", "2026-10-31"]) assert.ok(html.includes(`dateTime="${day}"`));
  assert.ok(livingTopicMetadata(topic).description.includes("2026-10-22"));
  assert.ok(html.includes(topic.sources[0].checkNote));
  assert.ok(html.includes("解説全体の確認日とは別"));
});
