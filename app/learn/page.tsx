import type { Metadata } from "next";
import Link from "next/link";
import { getLearnChapters } from "@/lib/learn";
import { LearnProgress } from "@/components/LearnProgress";

export const metadata: Metadata = {
  title: "まなぶ｜政治を、ゼロからすこしずつ",
  description:
    "政治をまったく知らない人のための学習コース。そもそも政治とは／選挙のしくみ／二元代表制／税金の流れ／会派／政治資金を、やさしい言葉と図解で。",
  alternates: { canonical: "/learn/" },
};

export default function LearnPage() {
  const chapters = getLearnChapters();
  const parts = [...new Set(chapters.map((c) => c.partLabel))];

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Learn</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">まなぶ</h1>
        <p className="measure mt-3 text-muted">
          政治をまったく知らなくても大丈夫。ゼロからすこしずつ、愛知・名古屋の政治がわかるように。
          各章は3分で読めて、むずかしい言葉は
          <span className="border-b border-dotted border-accent">点線</span>
          にふれると意味が出ます。「やさしい／くわしい」も切り替えられます。
        </p>
      </header>

      <LearnProgress slugs={chapters.map((c) => c.slug)} />

      {parts.map((part) => (
        <section key={part}>
          <h2 className="eyebrow text-accent-deep">{part}</h2>
          <div className="mt-3">
            {chapters
              .filter((c) => c.partLabel === part)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/learn/${c.slug}/`}
                  className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-t border-line py-5 transition-colors last:border-b hover:bg-subtle"
                >
                  <span className="num-display tnum text-faint">{c.n}</span>
                  <div>
                    <h3 className="font-display text-lg sm:text-xl">{c.title}</h3>
                    <p className="measure mt-1 text-sm text-muted">{c.lead}</p>
                  </div>
                  <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                    →
                  </span>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <p className="measure rule-thick pt-5 text-sm text-muted">
        言葉の意味をまとめて見たいときは
        <Link href="/glossary" className="link-ink">
          用語集
        </Link>
        へ。実例から入りたいときは
        <Link href="/facts" className="link-ink">
          事実カード
        </Link>
        がおすすめです。
      </p>
    </div>
  );
}
