// 取得済み参院HTMLだけを使い、公式結果の会派を補完する。ネットワークへは接続しない。
// 実行: SANGIIN_CACHE_DIR=/path/to/data/raw/sangiin node --import tsx scripts/backfill-vote-factions.ts
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isSangiinVote } from "../lib/data-coverage";
import { parseResult, type SangiinVoteResult } from "../lib/sources/sangiin";
import type { Legislator, Vote } from "../lib/types";

/** 名前・票・全体の公式合計が一致したときだけ採決当時の会派を保存する。 */
export function snapshotVoteFaction(vote: Vote, name: string, result: SangiinVoteResult): Vote {
  if (!isSangiinVote(vote)) return { ...vote };
  const yea = result.ballots.filter((ballot) => ballot.vote === "yea").length;
  if (yea !== result.yea || result.ballots.length - yea !== result.nay ||
    result.ballots.length !== result.total || result.yea + result.nay !== result.total) {
    throw new Error(`公式合計と解析結果が不一致: ${vote.sourceUrl}`);
  }
  const normalize = (value: string) => value.replace(/[\s　]+/g, "");
  const matches = result.ballots.filter((ballot) => normalize(ballot.name) === normalize(name));
  if (matches.length !== 1 || matches[0].vote !== vote.result || !matches[0].faction.trim()) {
    throw new Error(`議員名・票・会派を確認できません: ${name} ${vote.sourceUrl}`);
  }
  const factionAtVote = matches[0].faction.trim();
  if (vote.factionAtVote && vote.factionAtVote !== factionAtVote) {
    throw new Error(`保存済み会派と公式結果が不一致: ${name} ${vote.sourceUrl}`);
  }
  return { ...vote, factionAtVote };
}

function main() {
  const dataDir = join(process.cwd(), "data");
  const cacheDir = process.env.SANGIIN_CACHE_DIR ?? join(dataDir, "raw", "sangiin");
  const votesPath = join(dataDir, "votes.json");
  const votes = JSON.parse(readFileSync(votesPath, "utf-8")) as Vote[];
  const legislators = JSON.parse(readFileSync(join(dataDir, "legislators.aichi.json"), "utf-8")) as Legislator[];
  const names = new Map(legislators.map((legislator) => [legislator.id, legislator.name]));
  const parsed = new Map<string, SangiinVoteResult>();
  let checked = 0;
  const out = votes.map((vote) => {
    if (!isSangiinVote(vote)) return vote;
    const name = names.get(vote.legislatorId);
    if (!name) throw new Error(`議員名簿にないID: ${vote.legislatorId}`);
    if (!parsed.has(vote.sourceUrl)) {
      const hash = createHash("sha1").update(vote.sourceUrl).digest("hex").slice(0, 16);
      parsed.set(vote.sourceUrl, parseResult(readFileSync(join(cacheDir, `${hash}.html`), "utf-8")));
    }
    checked++;
    return snapshotVoteFaction(vote, name, parsed.get(vote.sourceUrl)!);
  });
  // 途中の検証に失敗した場合は一切書き込まない。
  writeFileSync(votesPath, JSON.stringify(out, null, 2) + "\n", "utf-8");
  console.log(`✓ 公式キャッシュ ${parsed.size} 案件・${checked} 票の採決当時会派を照合・保存（外部取得なし）`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
