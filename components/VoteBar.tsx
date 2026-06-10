// 賛成/反対/欠席の積み上げ帯。記号＋人数を直書きし、色だけに頼らない（三重符号化）。
export function VoteBar({
  yea,
  nay,
  abstain = 0,
}: {
  yea: number;
  nay: number;
  abstain?: number;
}) {
  const total = yea + nay + abstain;
  if (total === 0) return null;
  const w = (n: number) => `${(n / total) * 100}%`;
  return (
    <div>
      <div aria-hidden className="flex h-5 overflow-hidden">
        {yea > 0 && <span className="h-full bg-yea" style={{ width: w(yea) }} />}
        {nay > 0 && <span className="h-full bg-nay" style={{ width: w(nay) }} />}
        {abstain > 0 && <span className="h-full bg-abstain" style={{ width: w(abstain) }} />}
      </div>
      <p className="tnum mt-1.5 flex flex-wrap gap-x-4 text-xs">
        <span className="font-bold text-yea">●賛成 {yea}</span>
        <span className="font-bold text-nay">✕反対 {nay}</span>
        {abstain > 0 && <span className="font-bold text-abstain">—欠席等 {abstain}</span>}
      </p>
    </div>
  );
}
