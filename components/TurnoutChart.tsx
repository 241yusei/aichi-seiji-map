import type { TurnoutSeries } from "@/lib/types";

// 知事選（県全体）と名古屋市長選の投票率を重ねる2系列の折れ線。
// 依存ゼロのインラインSVG・SSG安全。縦軸は0起点（切り詰めて高低を誇張しない＝中立性）。
// スクリーンリーダー・詳細確認向けに、全データ点の表を <details> で併設する。
export function TurnoutChart({
  governor,
  mayor,
}: {
  governor: TurnoutSeries;
  mayor: TurnoutSeries;
}) {
  const all = [...governor.points, ...mayor.points];
  const minYear = Math.min(...all.map((p) => p.year));
  const maxYear = Math.max(...all.map((p) => p.year));
  const W = 760;
  const H = 300;
  const padL = 34;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMax = 100;
  const x = (yr: number) => padL + ((yr - minYear) / (maxYear - minYear)) * plotW;
  const y = (t: number) => padT + ((yMax - t) / yMax) * plotH;
  const govColor = "var(--color-chart-pref)";
  const mayorColor = "var(--color-chart-municipal)";
  const line = (pts: { year: number; turnout: number }[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(p.turnout).toFixed(1)}`)
      .join(" ");
  const yTicks = [0, 25, 50, 75, 100];
  const xTicks: number[] = [];
  for (let yr = Math.ceil(minYear / 10) * 10; yr <= maxYear; yr += 10) xTicks.push(yr);

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-w-[36rem]"
          role="img"
          aria-label={`愛知県知事選（県全体）と名古屋市長選の投票率の推移（${minYear}〜${maxYear}年）。詳細な数値は下の表を参照。`}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                y1={y(t)}
                x2={W - padR}
                y2={y(t)}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
              <text x={padL - 5} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--color-faint)">
                {t}
              </text>
            </g>
          ))}
          {xTicks.map((yr) => (
            <text
              key={yr}
              x={x(yr)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-faint)"
            >
              {yr}
            </text>
          ))}
          <path d={line(governor.points)} fill="none" stroke={govColor} strokeWidth={2} />
          <path d={line(mayor.points)} fill="none" stroke={mayorColor} strokeWidth={2} />
          {governor.points.map((p) => (
            <circle key={`g${p.date}`} cx={x(p.year)} cy={y(p.turnout)} r={2.4} fill={govColor} />
          ))}
          {mayor.points.map((p) => (
            <circle key={`m${p.date}`} cx={x(p.year)} cy={y(p.turnout)} r={2.4} fill={mayorColor} />
          ))}
        </svg>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-2.5 w-4" style={{ backgroundColor: govColor }} />
          知事選（{governor.scope}）
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2.5 w-4"
            style={{ backgroundColor: mayorColor }}
          />
          市長選（{mayor.scope}）
        </span>
        <span className="text-faint">縦軸＝投票率(%)・0起点</span>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">数値の一覧（表）を開く</summary>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <TurnoutTable title={`知事選 投票率（${governor.scope}）`} series={governor} />
          <TurnoutTable title={`名古屋市長選 投票率（${mayor.scope}）`} series={mayor} />
        </div>
      </details>
    </div>
  );
}

function TurnoutTable({ title, series }: { title: string; series: TurnoutSeries }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <caption className="mb-1 text-left font-bold">{title}</caption>
        <thead>
          <tr className="border-b border-line text-faint">
            <th scope="col" className="py-1 pr-3 font-normal">
              執行日
            </th>
            <th scope="col" className="py-1 pr-3 font-normal">
              投票率
            </th>
          </tr>
        </thead>
        <tbody className="tnum">
          {series.points.map((p) => (
            <tr key={p.date} className="border-b border-line/60">
              <td className="py-1 pr-3">{p.date}</td>
              <td className="py-1 pr-3">
                {p.turnout.toFixed(2)}%
                {p.note && <span className="ml-1 text-faint">（{p.note}）</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
