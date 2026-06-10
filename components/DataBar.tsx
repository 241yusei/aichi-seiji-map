// 汎用の横棒（データ報道の基本図形）。依存ゼロ・SSG安全。
// 塗りは aria-hidden、値は可視テキストで併記する（a11y＝チャートが読めなくても数字で伝わる）。
export function DataBar({
  label,
  value,
  max,
  valueLabel,
  color = "var(--color-ink)",
}: {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  color?: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 1.5 : 0) : 0;
  return (
    <div className="grid grid-cols-[minmax(5.5rem,9rem)_1fr_auto] items-center gap-3 py-1.5">
      <span className="truncate text-sm">{label}</span>
      <span aria-hidden className="h-3.5 bg-subtle">
        <span className="block h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </span>
      <span className="tnum text-sm font-bold">{valueLabel ?? value}</span>
    </div>
  );
}
