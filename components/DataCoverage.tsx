import type { Legislator } from "@/lib/types";
import { verifiedMembershipCount } from "@/lib/roster-verification";
import { getAllVotes, getCouncilDecisions, getLegislators, getSpeeches, getSpeechCollectionStatus } from "@/lib/data";
import { collectionLabel, isSangiinVote, recordedRange } from "@/lib/data-coverage";

export function RosterCoverage({ legislators = getLegislators() }: { legislators?: Legislator[] } = {}) {
  const verified = verifiedMembershipCount(legislators);
  return <p className="mt-2 text-xs leading-relaxed text-muted">現職・氏名・選挙区の公式照合：{verified}人／本サイト収録{legislators.length}人。所属・役職・委員会の確認状況、資料確認日と出典は各議員ページに表示します。未記録の項目を確認済みとして扱いません。</p>;
}

export function SpeechCoverage() {
  const speeches = getSpeeches();
  const status = getSpeechCollectionStatus();
  return <div className="mt-2 space-y-1 text-xs text-muted">
    <p>国会発言の収録期間：{recordedRange(speeches) ?? "未収録"}。一部収録であり、全発言を示しません。</p>
    <p>{collectionLabel(status)}</p>
    {status && status.failedIds.length > 0 && <p>直近の照会：{status.targetCount}人中{status.succeededCount}人成功・{status.failedIds.length}人失敗。取得済みの記録を保持しています。</p>}
  </div>;
}

export function VoteCoverage() {
  const votes = getAllVotes().filter(isSangiinVote);
  const bills = new Set(votes.map((v) => v.sourceUrl)).size;
  return <p className="mt-2 text-xs text-muted">参院記名投票の収録：{recordedRange(votes) ?? "未収録"}・{bills}案件。最新の全採決を収録したことを示すものではありません。</p>;
}

export function DecisionCoverage() {
  const sessions = [...new Set(getCouncilDecisions().map((d) => `${d.council} ${d.session}`))];
  return <p className="mt-2 text-xs text-muted">収録会期（主要議案のみ）：{sessions.join("／") || "未収録"}。サイト更新日は議決の確認日ではありません。</p>;
}
