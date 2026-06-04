import type { Vote, VoteResult } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { VOTE_RESULT_SOURCE } from "@/lib/sources/linkout";
import { SourceLink } from "./SourceLink";

const RESULT_LABEL: Record<VoteResult, string> = {
  yea: "賛成",
  nay: "反対",
  absent: "欠席",
  not_recorded: "個人の賛否は非公開",
};

const RESULT_STYLE: Record<VoteResult, string> = {
  yea: "text-accent",
  nay: "text-ink",
  absent: "text-muted",
  not_recorded: "text-muted",
};

// 採決表。記名投票でない採決は「個人の賛否は非公開」と明示する（SPEC 受け入れ条件3）。
export function VoteTable({ votes, house }: { votes: Vote[]; house: "衆議院" | "参議院" }) {
  const source = VOTE_RESULT_SOURCE[house];
  return (
    <div className="space-y-3">
      {votes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-3 py-2 font-medium">議案</th>
                <th className="px-3 py-2 font-medium">日付</th>
                <th className="px-3 py-2 font-medium">賛否</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((v, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <SourceLink href={v.sourceUrl} className="text-ink hover:text-accent hover:underline">
                      {v.billTitle}
                    </SourceLink>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">{formatDate(v.date)}</td>
                  <td className={`px-3 py-2 font-medium ${RESULT_STYLE[v.result]}`}>
                    {RESULT_LABEL[v.result]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
        <p>
          {house === "参議院"
            ? "参議院では記名投票（押しボタン式）の場合に個人の賛否が公開されます。"
            : "衆議院の本会議の多くは起立採決で、個人の賛否は公表されません（記名投票の場合のみ公開）。"}
          <span className="font-medium text-ink">記名投票でない採決は「個人の賛否は非公開」</span>です。
          個別の賛否データは順次整備し、公式の投票結果でも確認できます。
        </p>
        <p className="mt-2">
          <SourceLink href={source.url}>{source.label} ↗</SourceLink>
        </p>
      </div>
    </div>
  );
}
