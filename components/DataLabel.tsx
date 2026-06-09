// 事実／解釈／非公開 を一目で区別するラベル（初心者向け・USAFacts型の「事実と解釈の境界」可視化）。
const MAP = {
  fact: { t: "事実（出典あり）", c: "border-ink text-ink" },
  summary: { t: "AI要約（多視点）", c: "border-accent text-accent-deep" },
  unpublished: { t: "非公開", c: "border-line text-faint" },
} as const;

export function DataLabel({ kind }: { kind: keyof typeof MAP }) {
  const m = MAP[kind];
  return (
    <span className={`eyebrow inline-flex items-center border px-1.5 py-0.5 ${m.c}`}>{m.t}</span>
  );
}
