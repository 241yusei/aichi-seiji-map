import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { billKeyOf, detectDivergences } from "../lib/faction-divergence";
import { snapshotVoteFaction } from "../scripts/backfill-vote-factions";
import type { Legislator, Vote } from "../lib/types";

const url = "https://www.sangiin.go.jp/japanese/touhyoulist/221/221-0724-v001.htm";
const ballot = (id: string, result: Vote["result"], factionAtVote?: string, sourceUrl = url): Vote => ({
  legislatorId: id, result, factionAtVote, sourceUrl, billTitle: "同じ案件名", date: "2026-07-24",
});
const threeVotes = [ballot("a", "yea", "当時の会派"), ballot("b", "yea", "当時の会派"), ballot("c", "nay", "当時の会派")];

test("採決当時の会派で集計し、現在の所属が変わっても結果を変えない", () => {
  const roster = (party: string): Legislator[] => ["a", "b", "c"].map((id) => ({ id, name: id, kana: "", level: "national", district: "愛知県選挙区", party, sourceUrl: "https://example.org" }));
  const first = detectDivergences(threeVotes, roster("現在の会派A"));
  assert.deepEqual(first, detectDivergences(threeVotes, roster("現在の会派B")));
  assert.equal(first.billsAnalyzed, 1);
  assert.equal(first.billsEligible, 1);
  assert.equal(first.divergenceCount, 1);
  assert.equal(first.records[0].legislatorId, "c");
  assert.equal(first.records[0].faction, "当時の会派");
});

test("衆院票・非公式URLは同じ日付と案件名でも参院集計に混ぜない", () => {
  const other = ["https://kokkai.ndl.go.jp/txt/fixture", "https://www.sangiin.go.jp.evil.example/japanese/touhyoulist/221/x.htm"];
  const polluted = [...threeVotes, ...other.flatMap((source) => [ballot("x", "nay", "当時の会派", source), ballot("y", "nay", "当時の会派", source)])];
  assert.deepEqual(detectDivergences(polluted), detectDivergences(threeVotes));
});

test("会派未確認の票に現在所属を補わず、同数の案件は集計可能と数えない", () => {
  assert.equal(detectDivergences(threeVotes.map((vote) => ({ ...vote, factionAtVote: undefined }))).billsEligible, 0);
  const tie = detectDivergences([...threeVotes, ballot("d", "nay", "当時の会派")]);
  assert.equal(tie.billsAnalyzed, 1);
  assert.equal(tie.billsEligible, 0);
  assert.equal(tie.divergenceCount, 0);
  assert.equal(detectDivergences([threeVotes[0], threeVotes[1], ballot("c", "nay")]).billsEligible, 0);
});

test("公式URLが別なら同一日・同一案件名でも別採決として数える", () => {
  assert.equal(detectDivergences([...threeVotes, ballot("d", "yea", undefined, url.replace("v001", "v002"))]).billsAnalyzed, 2);
});

test("キャッシュ補完は公式合計・氏名・本人票の一致を要求する", () => {
  const result = { total: 3, yea: 2, nay: 1, ballots: [
    { name: "藤川政人", faction: "採決時会派", vote: "yea" as const },
    { name: "他一", faction: "採決時会派", vote: "yea" as const },
    { name: "他二", faction: "別会派", vote: "nay" as const },
  ] };
  assert.equal(snapshotVoteFaction(ballot("a", "yea"), "藤川 政人", result).factionAtVote, "採決時会派");
  assert.throws(() => snapshotVoteFaction(ballot("a", "yea"), "藤川政人", { ...result, total: 4 }), /公式合計/);
  assert.throws(() => snapshotVoteFaction(ballot("a", "nay"), "藤川政人", result), /議員名・票・会派/);
  assert.throws(() => snapshotVoteFaction(ballot("a", "yea"), "別人", result), /議員名・票・会派/);
  assert.throws(() => snapshotVoteFaction(ballot("a", "yea", "現在の所属"), "藤川政人", result), /保存済み会派/);
});

test("fetch:votesはキャッシュfixtureから既存票の採決当時会派を補完する（外部接続を無効化）", () => {
  const root = mkdtempSync(join(tmpdir(), "vote-snapshot-test-"));
  try {
    const cache = join(root, "data", "raw", "sangiin");
    mkdirSync(cache, { recursive: true });
    const previous = ballot("a", "yea");
    writeFileSync(join(root, "data", "votes.json"), JSON.stringify([previous]));
    writeFileSync(join(root, "data", "legislators.aichi.json"), JSON.stringify([
      { id: "a", name: "藤川政人", kana: "", level: "national", district: "愛知県選挙区", party: "現在の別所属", sourceUrl: "https://example.org" },
    ]));
    const cached = (sourceUrl: string, html: string) => writeFileSync(join(cache, createHash("sha1").update(sourceUrl).digest("hex").slice(0, 16) + ".html"), html);
    cached("https://www.sangiin.go.jp/japanese/touhyoulist/221/vote_ind.htm", '<TR><TH class="touhyo_date">令和08年7月24日</TH><TD><A HREF="221-0724-v001.htm">日程第１ 同じ案件名</A></TD></TR>');
    cached(url, '投票総数 3 賛成票 2 反対票 1<h4 class="party">採決時会派(3名)</h4><span class="pros">○</span><span class="cons"></span><span class="names">藤川 政人</span><span class="pros">○</span><span class="cons"></span><span class="names">他一</span><span class="pros"></span><span class="cons">○</span><span class="names">他二</span></main>');
    const disableNetwork = join(root, "disable-network.mjs");
    writeFileSync(disableNetwork, 'globalThis.fetch = async (url) => { if (String(url).endsWith("/robots.txt")) return new Response("User-agent: *\\nAllow: /"); throw new Error("External network disabled"); };');
    const script = fileURLToPath(new URL("../scripts/fetch-votes.ts", import.meta.url));
    const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/loader.mjs", import.meta.url));
    const result = spawnSync(process.execPath, ["--import", disableNetwork, "--import", tsx, script], { cwd: root, encoding: "utf-8", env: { ...process.env, SANGIIN_SESSIONS: "221" } });
    assert.equal(result.status, 0, result.stderr);
    const out = JSON.parse(readFileSync(join(root, "data", "votes.json"), "utf-8"));
    assert.deepEqual(out, [{ ...previous, factionAtVote: "採決時会派" }]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("同日同名でも出典が違う採決の表示キーを分ける", () => {
  const common = { date: "2026-10-01", billTitle: "同名議案" };
  assert.notEqual(billKeyOf({ ...common, sourceUrl: "https://www.sangiin.go.jp/japanese/touhyoulist/221/a.htm" }), billKeyOf({ ...common, sourceUrl: "https://www.sangiin.go.jp/japanese/touhyoulist/221/b.htm" }));
});
