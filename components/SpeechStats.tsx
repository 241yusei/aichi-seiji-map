import Link from "next/link";
import type { CoverageRange, SpeechStats as Stats } from "@/lib/activity-stats";
import { DataBar } from "./DataBar";

// 発言の統計（国会議員のみ・ビルド時集計）。
// 中立ガード：多寡の解釈をしない。0件を「サボり」と読ませない注記を必ず添える。
export function SpeechStats({
  stats,
  coverage,
  minutesHref,
  minutesLabel,
}: {
  stats: Stats;
  coverage: CoverageRange | null;
  minutesHref?: string;
  minutesLabel?: string;
}) {
  const coverageText = coverage
    ? `収録範囲：${coverage.fromYear}年${coverage.fromMonth}月〜${coverage.toYear}年${coverage.toMonth}月・愛知選出議員のみ`
    : "収録範囲：愛知選出議員のみ";

  if (stats.total === 0) {
    return (
      <div className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
        <p>
          本サイトには、この議員の発言はまだ収録されていません。
          <span className="font-bold text-ink">これは活動量の多寡を示すものではありません</span>
          （収録は会議録の整備状況によります）。
        </p>
        {minutesHref && minutesLabel && (
          <p className="mt-2">
            発言は公式の会議録でご確認いただけます：{" "}
            <Link href={minutesHref} className="link-ink" target="_blank" rel="noopener noreferrer">
              {minutesLabel}
            </Link>
          </p>
        )}
        <p className="mt-2 text-xs text-faint">{coverageText}</p>
      </div>
    );
  }

  const yearMax = Math.max(...stats.byYear.map((y) => y.count), 1);
  const comMax = Math.max(...stats.byCommittee.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* 収録発言数 */}
      <div className="border border-line bg-surface p-5">
        <p className="eyebrow text-faint">収録発言数</p>
        <p className="num-display tnum mt-1 text-3xl">
          {stats.total}
          <span className="ml-1 text-base font-normal text-muted">件</span>
        </p>
        <p className="mt-1 text-xs text-muted">国会会議録より（各発言に出典）。</p>
      </div>

      {/* 年別の推移 */}
      {stats.byYear.length > 0 && (
        <div>
          <p className="eyebrow text-faint">年別の収録件数</p>
          <div className="mt-2">
            {stats.byYear.map((y) => (
              <DataBar
                key={y.year}
                label={`${y.year}年`}
                value={y.count}
                max={yearMax}
                valueLabel={`${y.count}`}
                color="var(--color-chart-national)"
              />
            ))}
          </div>
        </div>
      )}

      {/* 委員会・会議別の内訳（上位） */}
      {stats.byCommittee.length > 0 && (
        <div>
          <p className="eyebrow text-faint">
            会議別の収録件数（上位{stats.byCommittee.length}／全{stats.committeeTotal}種）
          </p>
          <div className="mt-2">
            {stats.byCommittee.map((c) => (
              <DataBar
                key={c.committee}
                label={c.committee}
                value={c.count}
                max={comMax}
                valueLabel={`${c.count}`}
                color="var(--color-chart-national)"
              />
            ))}
            {stats.otherCommitteeCount > 0 && (
              <DataBar
                label="その他の会議"
                value={stats.otherCommitteeCount}
                max={comMax}
                valueLabel={`${stats.otherCommitteeCount}`}
                color="var(--color-abstain)"
              />
            )}
          </div>
        </div>
      )}

      {/* 中立注記：範囲と限界を必ず明示 */}
      <div className="chart-note">
        <p>{coverageText}。</p>
        <p className="mt-1">
          これは本サイトが収録した発言の集計で、国会での実際の発言・活動のすべてではありません。
          件数の多い少ないは働きぶりや優劣を示すものではありません。
          集計方法と限界は{" "}
          <Link href="/methodology/" className="link-ink">
            集計方法（methodology）
          </Link>
          {" "}で開示しています。
        </p>
      </div>
    </div>
  );
}
