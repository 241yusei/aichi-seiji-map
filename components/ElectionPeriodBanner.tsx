// 選挙期間中に常時表示する注意バナー（公職選挙法への配慮）。差し色のベタ面で明示。
export function ElectionPeriodBanner({ name }: { name: string }) {
  return (
    <div className="bg-accent text-on-accent">
      <div className="mx-auto max-w-6xl px-5 py-2 text-xs">
        <span className="eyebrow mr-2">選挙期間中</span>
        現在は<span className="font-bold">{name}</span>
        の期間です。中立・非投票誘導の方針に基づき、投票誘導と取られうる表示を抑制しています。発言・記録は事実として、出典付きで表示します。
      </div>
    </div>
  );
}
