import Link from "next/link";
import { getLivingTopics } from "@/lib/data";

/** 暮らしの疑問を、具体的な制度・計画とその確認資料につなぐ入口。 */
export function LivingTopicCards() {
  const topics = getLivingTopics();
  if (!topics.length) return null;
  return <section className="home-section" aria-labelledby="living-topics-heading">
    <p className="eyebrow text-accent">暮らしの3テーマ</p>
    <h2 id="living-topics-heading" className="font-display section-heading mt-3">何が決まり、次はどうなる？</h2>
    <p className="mt-3 text-sm text-muted">子育て・公共交通・防災から、気になる話題をひとつ選んでください。決まったことと未確認のことを読み、最後に公式の一次資料で確かめられます。地域によって対象が異なります。</p>
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      {topics.map((topic) => <Link key={topic.issueId} href={`/issues/${topic.issueId}/#living-topic`} className="home-card flex flex-col border border-line bg-surface p-5">
        <span className="eyebrow text-accent">{topic.title}</span>
        <h3 className="font-display mt-2 text-xl">{topic.caseTitle}</h3>
        <p className="mt-3 text-sm text-muted">{topic.summary}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">対象地域：{topic.region.text}</p>
        <p className="mt-4 text-xs text-muted">解説の確認日：<time dateTime={topic.confirmedAt}>{topic.confirmedAt}</time></p>
        <span className="mt-auto pt-4 text-sm text-accent">決まったこと・担当・次の確認事項へ →</span>
      </Link>)}
    </div>
  </section>;
}
