import assert from "node:assert/strict";
import { test } from "node:test";
import { collectionLabel, fundingCoverage, isSangiinVote, latestFundingRecords, recordedRange } from "../lib/data-coverage";
import { speechCollectionStatusSchema } from "../lib/zod-schemas";

test("収録期間は記録から算出し、空欄を現在日や0件に置き換えない", () => {
  assert.equal(recordedRange([]), null);
  assert.equal(recordedRange([{ date: "2024-04-01" }, { date: "2026-10-05" }, { date: "2025-03-01" }]), "2024-04-01〜2026-10-05");
  assert.equal(recordedRange([{ date: "2024-04-01" }]), "2024-04-01");
  assert.match(collectionLabel(null), /未記録/);
});

test("年度をまたぐ資金を現在年の合計に混ぜない", () => {
  const fixture = [2023, 2024, 2024].map((year, i) => ({ legislatorId: "fixture", year, totalIncome: i + 10, sourceUrl: "https://example.org/report" }));
  assert.deepEqual(latestFundingRecords(fixture).map((f) => f.year), [2024, 2024]);
  assert.deepEqual(latestFundingRecords([]), []);
  assert.match(fundingCoverage(fixture), /2023・2024年分・3件/);
});

test("参院公式に似た別ホストのURLを集計対象にしない", () => {
  assert.ok(isSangiinVote({ sourceUrl: "https://www.sangiin.go.jp/japanese/touhyoulist/221/221-0323-v001.htm" }));
  for (const url of ["https://www.sangiin.go.jp.example.org/japanese/touhyoulist/a", "https://www.shugiin.go.jp/japanese/touhyoulist/a", "invalid"]) assert.equal(isSangiinVote({ sourceUrl: url }), false);
});

test("照会履歴は日付・期間・成功失敗の件数を検証し、名簿確認日へ転用しない", () => {
  const fixture = { sourceUrl: "https://kokkai.ndl.go.jp/api.html", lastSuccessfulCheck: "2026-10-18", from: "2026-10-01", until: "2026-10-22", targetCount: 2, succeededCount: 1, failedIds: ["fixture-2"] };
  assert.ok(speechCollectionStatusSchema.safeParse(fixture).success);
  assert.match(collectionLabel(fixture), /名簿・所属の確認日ではありません/);
  assert.equal(speechCollectionStatusSchema.safeParse({ ...fixture, until: "2026-09-30" }).success, false);
  assert.equal(speechCollectionStatusSchema.safeParse({ ...fixture, succeededCount: 2 }).success, false);
  assert.equal(speechCollectionStatusSchema.safeParse({ ...fixture, lastSuccessfulCheck: "2026-02-30" }).success, false);
});
