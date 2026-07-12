import Link from "next/link";
import type { Vote, VoteResult } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { billKeyOf } from "@/lib/faction-divergence";
import { VOTE_RESULT_SOURCE } from "@/lib/sources/linkout";
import { SourceLink } from "./SourceLink";

const RESULT_LABEL: Record<VoteResult, string> = {
  yea: "賛成",
  nay: "反対",
  absent: "欠席",
  not_recorded: "非公開",
};

// 色だけに頼らず、記号＋色＋ラベルの三重符号化（色覚多様性対応）。
const RESULT_SYMBOL: Record<VoteResult, string> = {
  yea: "●",
  nay: "✕",
  absent: "—",
  not_recorded: "—",
};

const RESULT_STYLE: Record<VoteResult, string> = {
  yea: "text-yea",
  nay: "text-nay",
  absent: "text-abstain",
  not_recorded: "text-abstain",
};

// 採決表。記名投票でない採決は「個人の賛否は非公開」と明示する（SPEC 受け入れ条件3）。
// divergentKeys: 「会派多数と異なる投票」と機械検出された採決キー（billKeyOf）の集合。
// 用語は「会派多数と異なる投票」に限定し、評価語（造反等）は使わない。
export function VoteTable({
  votes,
  house,
  divergentKeys,
}: {
  votes: Vote[];
  house: "衆議院" | "参議院";
  divergentKeys?: Set<string>;
}) {
  const source = VOTE_RESULT_SOURCE[house];
  const hasDivergence = votes.some((v) => divergentKeys?.has(billKeyOf(v)));
  return (
    <div className="space-y-4">
      {votes.length > 0 && (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-[3px] border-ink text-left">
                <th className="eyebrow px-3 py-2 text-faint">議案</th>
                <th className="eyebrow px-3 py-2 text-faint">日付</th>
                <th className="eyebrow px-3 py-2 text-faint">賛否</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((v, i) => {
                const diverged = divergentKeys?.has(billKeyOf(v)) ?? false;
                return (
                  <tr key={i} className="border-b border-line transition-colors last:border-0 hover:bg-subtle">
                    <td className="px-3 py-2.5">
                      <SourceLink href={v.sourceUrl}>{v.billTitle}</SourceLink>
                      {diverged && (
                        <span className="mt-1 block">
                          <span className="inline-flex items-center border border-accent px-1.5 py-0.5 text-[0.65rem] font-bold text-accent-deep">
                            会派多数と異なる投票
                          </span>
                        </span>
                      )}
                    </td>
                    <td className="tnum whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                      {formatDate(v.date)}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-2.5 font-bold ${RESULT_STYLE[v.result]}`}>
                      <span aria-hidden>{RESULT_SYMBOL[v.result]}</span> {RESULT_LABEL[v.result]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasDivergence && (
        <div className="border-l-2 border-accent bg-subtle px-4 py-3 text-sm text-muted">
          <p>
            <span className="font-bold text-ink">「会派多数と異なる投票」</span>
            は、同じ採決で同会派（愛知選出）の多数と異なる賛否だったことを機械的に示す事実表示です。
            会派の正式な賛否指示は非公開のため、同会派メンバーの多数を近似として用いています。
            良し悪しや評価を示すものではありません。
          </p>
          <p className="mt-2">
            <Link href="/methodology/" className="link-ink">
              検出方法と閾値・限界の開示（methodology）→
            </Link>
          </p>
        </div>
      )}

      <div className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
        <p>
          {house === "参議院"
            ? "参議院では記名投票（押しボタン式）の場合に個人の賛否が公開されます。"
            : "衆議院の本会議の多くは起立採決で、個人の賛否は公表されません（記名投票の場合のみ公開）。"}
          <span className="font-bold text-ink">記名投票でない採決は「個人の賛否は非公開」</span>です。
          個別の賛否データは順次整備し、公式の投票結果でも確認できます。
        </p>
        <p className="mt-2">
          <SourceLink href={source.url}>{source.label}</SourceLink>
        </p>
      </div>
    </div>
  );
}
