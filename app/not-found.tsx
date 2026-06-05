import Link from "next/link";

export default function NotFound() {
  return (
    <div className="border-t-2 border-ink pt-10">
      <p className="eyebrow text-accent-deep">Error 404</p>
      <h1 className="font-display mt-3 text-[clamp(2rem,7vw,4.5rem)] leading-[1.02]">
        ページが見つかりません
      </h1>
      <p className="measure mt-4 text-muted">
        お探しのページは移動または削除された可能性があります。トップから探し直すか、議員一覧・争点からどうぞ。
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
        >
          トップへ
        </Link>
        <Link
          href="/legislators"
          className="border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
        >
          議員を見る
        </Link>
      </div>
    </div>
  );
}
