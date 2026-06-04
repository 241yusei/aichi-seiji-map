// 選挙期間中に常時表示する注意バナー（公職選挙法への配慮）。
export function ElectionPeriodBanner({ name }: { name: string }) {
  return (
    <div className="border-b border-line bg-accent-weak">
      <div className="mx-auto max-w-5xl px-4 py-2 text-xs text-ink">
        現在は<span className="font-medium">{name}</span>の期間です。本サイトは中立・非投票誘導の方針に基づき、
        投票誘導と取られうる表示を抑制しています。発言・記録は事実として、出典付きで表示しています。
      </div>
    </div>
  );
}
