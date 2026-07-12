import type { HistoryTenure } from "@/lib/types";

// 歴代首長の在任期間を横棒で並べる系譜タイムライン（Gantt型）。
// 依存ゼロ・SSG安全。塗りは aria-hidden、在任年・期数は可視テキストで併記する。
// 在任の長短に評価語は加えない（tenureLabel は "6期24年" のような事実表記のみ）。
export function HistoryTimeline({
  tenures,
  minYear,
  maxYear,
  color,
}: {
  tenures: HistoryTenure[];
  minYear: number;
  maxYear: number;
  color: string;
}) {
  const span = maxYear - minYear;
  const decades: number[] = [];
  for (let y = Math.ceil(minYear / 10) * 10; y <= maxYear; y += 10) decades.push(y);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[34rem]">
        {/* 年の目盛り（10年刻み）。左余白は下の行の名前カラム幅と揃える */}
        <div className="relative ml-[8.5rem] h-5 border-b border-line">
          {decades.map((y) => (
            <span
              key={y}
              className="tnum absolute top-0 -translate-x-1/2 text-[0.65rem] text-faint"
              style={{ left: `${((y - minYear) / span) * 100}%` }}
            >
              {y}
            </span>
          ))}
        </div>
        <div className="divide-y divide-line">
          {tenures.map((t) => {
            const end = t.endYear ?? maxYear;
            const left = ((t.startYear - minYear) / span) * 100;
            const width = Math.max(((end - t.startYear) / span) * 100, 1.5);
            const ongoing = t.endYear === null;
            // 棒が右端に近い場合はラベルを棒の左側に出す（はみ出し・重なり防止）
            const labelAfter = left + width <= 82;
            return (
              <div key={t.name} className="grid grid-cols-[8.5rem_1fr] items-center py-2">
                <div className="min-w-0 pr-2">
                  <div className="font-display truncate text-sm leading-tight">{t.name}</div>
                  <div className="truncate text-[0.65rem] text-faint">{t.kana}</div>
                </div>
                <div className="relative h-6">
                  {decades.map((y) => (
                    <span
                      key={y}
                      aria-hidden
                      className="absolute top-0 h-full border-l border-line/70"
                      style={{ left: `${((y - minYear) / span) * 100}%` }}
                    />
                  ))}
                  <span
                    aria-hidden
                    className="absolute top-1/2 h-4 -translate-y-1/2"
                    style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                  />
                  <span
                    className={`tnum absolute top-1/2 whitespace-nowrap text-[0.7rem] font-bold text-ink ${
                      labelAfter ? "pl-1.5" : "pr-1.5"
                    }`}
                    style={
                      labelAfter
                        ? { left: `${left + width}%`, transform: "translateY(-50%)" }
                        : { left: `${left}%`, transform: "translate(-100%, -50%)" }
                    }
                  >
                    {t.startYear}–{ongoing ? "現職" : end}
                    <span className="ml-1 font-normal text-muted">{t.tenureLabel}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
