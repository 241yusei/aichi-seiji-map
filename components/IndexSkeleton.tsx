// 実際の取得中だけ表示する。支援技術へは各画面の読み込み案内を使う。
export function SearchSkeleton() {
  return (
    <div aria-hidden="true" className="skeleton-delayed" data-skeleton="search">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 border-t border-line py-4">
          <span className="skeleton-line h-5" />
          <div className="space-y-2"><span className="skeleton-line h-5 w-2/3" /><span className="skeleton-line h-3 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

export function CompareSkeleton({ withTable = false }: { withTable?: boolean }) {
  return (
    <div aria-hidden="true" className="skeleton-delayed" data-skeleton="compare">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {["A", "B"].map((label) => (
        <div key={label} className="min-h-40 border border-line bg-surface p-4">
          <span className="eyebrow text-faint">{label}</span>
          <span className="skeleton-line mt-3 h-8 w-2/3" />
          <span className="skeleton-line mt-3 h-4 w-1/2" />
        </div>
      ))}
    </div>
    {withTable && (
      <div className="mt-8" data-skeleton="comparison-table">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="grid grid-cols-[7rem_1fr_1fr] gap-3 border-t border-line py-3">
            <span className="skeleton-line h-5" /><span className="skeleton-line h-5" /><span className="skeleton-line h-5" />
          </div>
        ))}
      </div>
    )}
    </div>
  );
}
