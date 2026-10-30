import Link from "next/link";
import { SourceLink } from "./SourceLink";

export function ThemeEmptyState() {
  return (
    <section className="border-y border-line py-4 text-sm" aria-labelledby="theme-empty-heading">
      <h2 id="theme-empty-heading" className="font-bold">このテーマに一致する収録発言はありません</h2>
      <p className="mt-2 text-muted">本サイトの収録範囲でキーワードに一致した発言が0件の状態です。実際に発言がなかったことを示すものではありません。</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        <SourceLink href="https://kokkai.ndl.go.jp/" className="link-ink inline-flex min-h-11 items-center">公式会議録で探す（国立国会図書館・別タブ）</SourceLink>
        <Link href="/themes/" className="link-ink inline-flex min-h-11 items-center">別のテーマから探す →</Link>
      </div>
    </section>
  );
}
