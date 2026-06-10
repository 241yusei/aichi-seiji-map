import type { FigureKey } from "@/lib/learn";

// まなぶ用の簡易図解（2色・非政党色）。本文の理解を助ける。
// SVGテキストはページのフォントで描画される。

const INK = "#1f1a14";
const SURFACE = "#fffdf8";
const MUTED = "#5d564b";
const ACCENT = "#5c4470";

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={SURFACE} stroke={INK} strokeWidth={1.5} />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 6 : y + h / 2 + 5}
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        fill={INK}
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fontSize="11" fill={MUTED}>
          {sub}
        </text>
      )}
    </g>
  );
}

const ARROW = (
  <defs>
    <marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={INK} />
    </marker>
  </defs>
);

function TaxFigure() {
  return (
    <svg viewBox="0 0 640 150" className="h-auto w-full" role="img" aria-label="税金の流れの図：集める→決める→届く">
      {ARROW}
      <Box x={6} y={45} w={170} h={60} title="あなた・会社" sub="税金を納める" />
      <line x1={182} y1={75} x2={230} y2={75} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <Box x={236} y={45} w={170} h={60} title="議会・行政" sub="予算で使い道を決める" />
      <line x1={412} y1={75} x2={460} y2={75} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <Box x={466} y={45} w={170} h={60} title="サービス" sub="保育・道路・ゴミ" />
      <text x={321} y={28} textAnchor="middle" fontSize="12" fill={ACCENT} fontWeight="700">
        ② ここを決めるのが政治
      </text>
    </svg>
  );
}

function ElectionFigure() {
  return (
    <svg viewBox="0 0 640 180" className="h-auto w-full" role="img" aria-label="選挙のしくみ：小選挙区と比例代表">
      {ARROW}
      <text x={160} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fill={ACCENT}>
        小選挙区
      </text>
      <Box x={40} y={40} w={120} h={50} title="1つの区" />
      <line x1={166} y1={65} x2={206} y2={65} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <Box x={212} y={40} w={120} h={50} title="1人 当選" sub="最多得票の1人" />

      <text x={480} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fill={ACCENT}>
        比例代表
      </text>
      <Box x={360} y={40} w={120} h={50} title="政党の得票" />
      <line x1={486} y1={65} x2={526} y2={65} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <Box x={532} y={40} w={104} h={50} title="議席を配分" sub="得票数に応じて" />

      <text x={320} y={140} textAnchor="middle" fontSize="12" fill={MUTED}>
        国会議員の選挙は、この2つを組み合わせて使う
      </text>
    </svg>
  );
}

function NigenFigure() {
  return (
    <svg viewBox="0 0 640 230" className="h-auto w-full" role="img" aria-label="二元代表制：住民が首長と議会を別々に選ぶ">
      {ARROW}
      <Box x={70} y={20} w={180} h={56} title="首長" sub="知事・市長など" />
      <Box x={390} y={20} w={180} h={56} title="議会" sub="議員のあつまり" />
      {/* 対立も（首長↔議会） */}
      <line x1={250} y1={48} x2={390} y2={48} stroke={ACCENT} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={320} y={40} textAnchor="middle" fontSize="11" fill={ACCENT} fontWeight="700">
        対立も
      </text>
      <Box x={230} y={150} w={180} h={56} title="住民" sub="あなた" />
      {/* 住民→首長／議会（別々に選ぶ） */}
      <line x1={300} y1={150} x2={180} y2={78} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <line x1={340} y1={150} x2={460} y2={78} stroke={INK} strokeWidth={1.5} markerEnd="url(#fig-arrow)" />
      <text x={190} y={120} textAnchor="middle" fontSize="11" fill={MUTED}>
        別々に選ぶ
      </text>
      <text x={450} y={120} textAnchor="middle" fontSize="11" fill={MUTED}>
        別々に選ぶ
      </text>
    </svg>
  );
}

function KenshiFigure() {
  return (
    <svg viewBox="0 0 640 200" className="h-auto w-full" role="img" aria-label="愛知県と名古屋市の役割分担（二重構造）">
      <Box x={20} y={40} w={250} h={80} title="愛知県" sub="県全体の仕事（県道・県立高校など）" />
      <Box x={370} y={40} w={250} h={80} title="名古屋市" sub="市の仕事（政令市＝県並みの権限も）" />
      <line x1={270} y1={80} x2={370} y2={80} stroke={MUTED} strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={320} y={70} textAnchor="middle" fontSize="11" fill={ACCENT} fontWeight="700">
        一部かさなる
      </text>
      <text x={320} y={150} textAnchor="middle" fontSize="12" fill={MUTED}>
        上下関係ではなく、ヨコの「役割分担」（重なる所が二重行政の議論に）
      </text>
    </svg>
  );
}

export function Figure({ figure }: { figure: FigureKey }) {
  const node =
    figure === "tax" ? (
      <TaxFigure />
    ) : figure === "election" ? (
      <ElectionFigure />
    ) : figure === "kenshi" ? (
      <KenshiFigure />
    ) : (
      <NigenFigure />
    );
  return <figure className="my-5 mx-auto max-w-2xl border border-line bg-paper p-4">{node}</figure>;
}
