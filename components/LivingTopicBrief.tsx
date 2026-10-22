import type { LivingTopicBriefData, LivingTopicStatement } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SourceLink } from "./SourceLink";

const LEVEL_LABEL = { national: "国", prefectural: "県", municipal: "市町村" } as const;

function Statement({ item, topic }: { item: LivingTopicStatement; topic: LivingTopicBriefData }) {
  return (
    <>
      {item.text}
      {item.sourceIds.length > 0 && (
        <span className="ml-1 inline-flex flex-wrap gap-x-2 text-xs">
          {item.sourceIds.map((id) => {
            const number = topic.sources.findIndex((source) => source.id === id) + 1;
            return (
              <a
                key={id}
                href={`#living-source-${topic.issueId}-${id}`}
                className="link-ink whitespace-nowrap"
                aria-label={`出典${number}を確認`}
              >
                [出典{number}]
              </a>
            );
          })}
        </span>
      )}
    </>
  );
}

function Notes({ title, items, topic }: { title: string; items: LivingTopicStatement[]; topic: LivingTopicBriefData }) {
  return (
    <div className="min-w-0 p-5">
      <h3 className="font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
        {items.map((item, index) => <li key={index}><Statement item={item} topic={topic} /></li>)}
      </ul>
    </div>
  );
}

/** 各記述から根拠のある資料へ直接戻れる、案件単位の説明。 */
export function LivingTopicBrief({ topic }: { topic: LivingTopicBriefData }) {
  const headingId = `living-topic-${topic.issueId}`;

  return (
    <section id="living-topic" aria-labelledby={headingId} className="scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="border-b border-line bg-subtle p-5 sm:p-6">
        <p className="eyebrow text-accent-deep">暮らしから、決まったことを読む</p>
        <h2 id={headingId} className="font-display mt-2 text-2xl leading-snug sm:text-3xl">{topic.title}</h2>
        <p className="measure mt-3 text-sm leading-relaxed text-muted">{topic.summary}</p>
        <p className="mt-3 text-xs text-faint">確認日：<time dateTime={topic.confirmedAt}>{formatDate(topic.confirmedAt)}</time></p>
      </header>

      <div className="border-b border-line p-5 sm:px-6">
        <p className="eyebrow text-faint">今回追う制度・計画</p>
        <p className="mt-1 font-bold">{topic.caseTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted"><Statement item={topic.status} topic={topic} /></p>
      </div>

      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
        <Notes title="何が決まった？" items={topic.decisions} topic={topic} />
        <Notes title="誰の暮らしに関わる？" items={topic.affected} topic={topic} />
      </div>

      <section className="border-t border-line p-5 sm:px-6">
        <h3 className="font-bold text-ink">国・県・市町村の担当</h3>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          {topic.responsibilities.map((role) => (
            <div key={role.level} className="min-w-0 border-l-2 border-line pl-3">
              <dt className="text-sm font-bold"><span className="mr-2 text-xs text-accent-deep">{LEVEL_LABEL[role.level]}</span>{role.label}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted"><Statement item={role} topic={topic} /></dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid border-t border-line divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
        <Notes title="いくらかかる？" items={topic.costs} topic={topic} />
        <Notes title="まだ分からないこと" items={topic.unknowns} topic={topic} />
      </div>

      <section className="border-t border-line bg-subtle p-5 sm:px-6">
        <h3 className="font-bold text-ink">次に確認すること</h3>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
          {topic.nextChecks.map((item, index) => <li key={index}><Statement item={item} topic={topic} /></li>)}
        </ul>
      </section>

      <footer className="border-t border-line p-5 sm:px-6">
        <h3 className="text-sm font-bold text-ink">確認に使った一次資料</h3>
        <ol className="mt-3 space-y-2 text-sm">
          {topic.sources.map((source, index) => (
            <li key={source.id} id={`living-source-${topic.issueId}-${source.id}`} className="scroll-mt-24">
              <span className="mr-2 text-xs text-faint">{index + 1}.</span>
              <SourceLink href={source.url}>{source.label}</SourceLink>
            </li>
          ))}
        </ol>
      </footer>
    </section>
  );
}
