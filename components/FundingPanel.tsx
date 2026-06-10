import type { Funding } from "@/lib/types";
import { formatYen } from "@/lib/format";
import { FUNDING_SOURCE } from "@/lib/sources/linkout";
import { SourceLink } from "./SourceLink";

// 政治資金パネル。出典リンク＋主要項目のみ（総務省・都道府県選管の収支報告書が出典）。
export function FundingPanel({ funding }: { funding: Funding[] }) {
  return (
    <div className="text-sm text-muted">
      {funding.length > 0 ? (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b-[3px] border-ink text-left">
                <th className="eyebrow px-3 py-2 text-faint">年</th>
                <th className="eyebrow px-3 py-2 text-faint">団体</th>
                <th className="eyebrow px-3 py-2 text-faint">収入</th>
                <th className="eyebrow px-3 py-2 text-faint">支出</th>
                <th className="eyebrow px-3 py-2 text-faint">出典</th>
              </tr>
            </thead>
            <tbody>
              {funding.map((f, i) => (
                <tr key={i} className="border-b border-line transition-colors last:border-0 hover:bg-subtle">
                  <td className="tnum whitespace-nowrap px-3 py-2.5 text-ink">{f.year}年</td>
                  <td className="px-3 py-2.5 text-ink">{f.teamName ?? "—"}</td>
                  <td className="tnum whitespace-nowrap px-3 py-2.5 text-ink">
                    {f.totalIncome != null ? formatYen(f.totalIncome) : "—"}
                  </td>
                  <td className="tnum whitespace-nowrap px-3 py-2.5 text-ink">
                    {f.totalExpense != null ? formatYen(f.totalExpense) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <SourceLink href={f.sourceUrl}>報告書</SourceLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          政治資金収支報告書の主要項目（収入・支出の総額）は順次掲載します。価値判断はせず、金額と出典のみを示します。
        </p>
      )}
      {funding.length > 0 && (
        <p className="mt-3 border-l-2 border-line bg-subtle px-3 py-2 text-xs text-faint">
          ※ 金額は収支報告書PDF（出典）からの転記です。正確な数値は各行の出典PDFでご確認ください。本サイトは金額と出典のみを示し、価値判断はしていません。
        </p>
      )}
      <p className="mt-3 text-xs">
        <SourceLink href={FUNDING_SOURCE.url}>{FUNDING_SOURCE.label}</SourceLink>
      </p>
    </div>
  );
}
