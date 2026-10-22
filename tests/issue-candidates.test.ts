import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import type { Issue, SpeechRecord } from "../lib/types";
import { buildIssueCandidates, type IssueSeed } from "../scripts/_lib/issue-candidates";

const seed: IssueSeed[] = [{ id: "castle", title: "名古屋城", description: "木造復元", keywords: ["名古屋城", "バリアフリー"] }];
const speech = (id: string, text: string, date = "2026-10-01"): SpeechRecord => ({
  id, text, date, legislatorId: "fixture-legislator", body: "委員会", sourceUrl: `https://example.org/speech/${id}`,
});
const reviewed = speech("old", "木造復元について", "2024-01-01");
const published: Issue[] = [{ ...seed[0], relatedSpeechIds: [reviewed.id] }];

test("古い確認済み紐付けを維持し、一般語の機械候補を公開と分離する", () => {
  const newer = Array.from({ length: 20 }, (_, i) => speech(`new-${i}`, "放課後等デイのバリアフリー"));
  const before = JSON.stringify(published);
  const [report] = buildIssueCandidates(seed, published, [reviewed, ...newer]);
  assert.deepEqual(report.publishedSpeechIds, ["old"]);
  assert.equal(report.unmatchedReviewCount, 20);
  assert.equal(report.candidates.length, 15);
  assert.ok(report.candidates.every((candidate) => candidate.status === "unreviewed" && candidate.reason.includes("一般語単体")));
  assert.equal(JSON.stringify(published), before);
  report.publishedSpeechIds.push("mutated-copy");
  assert.equal(JSON.stringify(published), before);
});

test("未知の争点ID・発言IDと重複を拒否する", () => {
  assert.throws(() => buildIssueCandidates([], published, [reviewed]), /seedにない/);
  assert.throws(() => buildIssueCandidates(seed, [], [reviewed]), /公開争点にない/);
  assert.throws(() => buildIssueCandidates(seed, published, []), /参照先発言が不明/);
  assert.throws(() => buildIssueCandidates([...seed, ...seed], published, [reviewed]), /重複ID/);
});

test("コマンドは使い捨てfixtureの候補だけを書き、公開JSONを一字も上書きしない", () => {
  const root = mkdtempSync(join(tmpdir(), "issue-candidates-test-"));
  try {
    mkdirSync(join(root, "data", "seed"), { recursive: true });
    writeFileSync(join(root, "data", "seed", "issues.seed.json"), JSON.stringify(seed));
    const publicPath = join(root, "data", "issues.json");
    const original = JSON.stringify(published, null, 2) + "\n";
    writeFileSync(publicPath, original);
    writeFileSync(join(root, "data", "speeches.national.json"), JSON.stringify([reviewed, speech("new", "バリアフリー")]));
    const script = fileURLToPath(new URL("../scripts/build-issues.ts", import.meta.url));
    const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/loader.mjs", import.meta.url));
    const result = spawnSync(process.execPath, ["--import", tsx, script], { cwd: root, encoding: "utf-8" });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(publicPath, "utf-8"), original);
    const report = JSON.parse(readFileSync(join(root, "data", "raw", "issue-candidates", "latest.json"), "utf-8"));
    assert.equal(report.status, "unreviewed");
    assert.deepEqual(report.issues[0].publishedSpeechIds, ["old"]);
    assert.equal(report.issues[0].candidates[0].speechId, "new");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
