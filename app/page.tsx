import Link from "next/link";
import { ZipSearch } from "@/components/ZipSearch";

const LAYERS = [
  {
    href: "/legislators?level=national",
    label: "国会（愛知選出）",
    body: "衆院 愛知1〜16区・比例東海・参院 愛知県選挙区の議員。発言は国会会議録から取得。",
  },
  {
    href: "/legislators?level=prefectural",
    label: "愛知県議会",
    body: "県政の代表者。発言は公式会議録への出典リンクで案内します。",
  },
  {
    href: "/legislators?level=municipal",
    label: "名古屋市会",
    body: "市政の代表者。発言は会議録から抜粋し、原本リンクを併記します。",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm font-medium text-accent">愛知の政治を、一次ソースで。</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          あなたの地域の代表者が、何を言い、どう動いたか。
        </h1>
        <p className="mt-4 max-w-2xl text-muted">
          国会（愛知選出）・愛知県議会・名古屋市会の三層を横断して、発言・採決・政治資金を
          公的な一次ソース付きで確認できます。専門用語を避け、5分で全体像をつかめる導線をめざします。
        </p>
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">郵便番号で、あなたの地域の代表者を調べる</p>
          <ZipSearch />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/area"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            地域から探す
          </Link>
          <Link
            href="/legislators"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-accent-weak"
          >
            議員を見る
          </Link>
          <Link
            href="/issues"
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-accent-weak"
          >
            争点から見る
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">三層で代表者をたどる</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LAYERS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
            >
              <h3 className="font-bold">{l.label}</h3>
              <p className="mt-2 text-sm text-muted">{l.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-accent-weak p-6 text-sm text-muted">
        <h2 className="font-bold text-ink">中立・非投票誘導が大原則です</h2>
        <p className="mt-2">
          本サイトは特定の政党・候補者への投票や不投票を呼びかけません。比較はすべて事実に基づき、
          AI要約には必ず元発言へのリンクを併記します。
          <Link href="/about" className="ml-1 underline">
            詳しくはこちら
          </Link>
          。
        </p>
      </section>
    </div>
  );
}
