// 構成のドットマトリクス（例：首長の男女比）。色＋形＋凡例ラベルの三重符号化。
// groups の順にドットを並べる。1行10個。SVGなのでSSG安全・依存ゼロ。
export interface DotGroup {
  label: string;
  count: number;
  color: string;
  /** 形でも区別する（色覚多様性対応）。circle=●, ring=○ */
  shape?: "circle" | "ring";
}

const DOT = 14; // セル1辺
const R = 5;
const PER_ROW = 10;

export function CompositionDots({ groups, caption }: { groups: DotGroup[]; caption?: string }) {
  const total = groups.reduce((s, g) => s + g.count, 0);
  if (total === 0) return null;
  const rows = Math.ceil(total / PER_ROW);
  const dots: { color: string; shape: "circle" | "ring" }[] = [];
  for (const g of groups) {
    for (let i = 0; i < g.count; i++) dots.push({ color: g.color, shape: g.shape ?? "circle" });
  }
  return (
    <figure>
      <svg
        aria-hidden
        width={PER_ROW * DOT}
        height={rows * DOT}
        viewBox={`0 0 ${PER_ROW * DOT} ${rows * DOT}`}
        className="max-w-full"
      >
        {dots.map((d, i) => {
          const cx = (i % PER_ROW) * DOT + DOT / 2;
          const cy = Math.floor(i / PER_ROW) * DOT + DOT / 2;
          return d.shape === "ring" ? (
            <circle key={i} cx={cx} cy={cy} r={R - 1} fill="none" stroke={d.color} strokeWidth="2" />
          ) : (
            <circle key={i} cx={cx} cy={cy} r={R} fill={d.color} />
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {groups.map((g) => (
          <span key={g.label} className="tnum">
            <span aria-hidden style={{ color: g.color }}>
              {g.shape === "ring" ? "○" : "●"}
            </span>{" "}
            {g.label} <span className="font-bold">{g.count}</span>
          </span>
        ))}
        {caption && <span className="text-faint">{caption}</span>}
      </figcaption>
    </figure>
  );
}
