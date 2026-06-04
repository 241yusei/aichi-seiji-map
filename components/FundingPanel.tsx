import type { Funding } from "@/lib/types";
import { formatYen } from "@/lib/format";
import { FUNDING_SOURCE } from "@/lib/sources/linkout";
import { SourceLink } from "./SourceLink";

// 政治資金パネル。Phase1は出典リンク＋主要項目のみ（総務省の収支報告書が出典）。
export function FundingPanel({ funding }: { funding: Funding[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
      {funding.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left text-xs">
              <th className="py-1 font-medium">年</th>
              <th className="py-1 font-medium">収入</th>
              <th className="py-1 font-medium">支出</th>
              <th className="py-1 font-medium">出典</th>
            </tr>
          </thead>
          <tbody>
            {funding.map((f, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <td className="py-1 text-ink">{f.year}年</td>
                <td className="py-1">{f.totalIncome != null ? formatYen(f.totalIncome) : "—"}</td>
                <td className="py-1">{f.totalExpense != null ? formatYen(f.totalExpense) : "—"}</td>
                <td className="py-1">
                  <SourceLink href={f.sourceUrl}>報告書 ↗</SourceLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          政治資金収支報告書の主要項目（収入・支出の総額）は順次掲載します。価値判断はせず、金額と出典のみを示します。
        </p>
      )}
      <p className="mt-2">
        <SourceLink href={FUNDING_SOURCE.url}>{FUNDING_SOURCE.label} ↗</SourceLink>
      </p>
    </div>
  );
}
