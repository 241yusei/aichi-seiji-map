import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFactCard, getFactCards, getIssue } from "@/lib/data";
import { FactCardView } from "@/components/FactCardView";

export function generateStaticParams() {
  return getFactCards().map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getFactCard(id);
  if (!card) return { title: "事実カード" };
  return {
    title: card.title,
    description: card.hook,
    alternates: { canonical: `/facts/${id}/` },
    openGraph: {
      title: card.title,
      description: card.hook,
      type: "article",
      url: `/facts/${id}/`,
    },
    twitter: {
      card: "summary_large_image",
      title: card.title,
      description: card.hook,
    },
  };
}

export default async function FactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getFactCard(id);
  if (!card) notFound();

  const relatedIssues = (card.relatedIssueIds ?? [])
    .map((iid) => getIssue(iid))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <div className="space-y-10">
      <FactCardView card={card} />

      {relatedIssues.length > 0 && (
        <section className="border-t border-line pt-5">
          <p className="eyebrow text-faint">関連する争点（三層で見る）</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {relatedIssues.map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}/`} className="link-ink">
                {issue.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/facts" className="link-ink">
          ← 事実カード一覧
        </Link>
        <Link href="/area" className="hover:text-accent-deep">
          郵便番号で自分の代表者を探す
        </Link>
        <Link href="/legislators" className="hover:text-accent-deep">
          議員を見る
        </Link>
        <Link href="/about" className="hover:text-accent-deep">
          中立性・出典について
        </Link>
      </nav>
    </div>
  );
}
