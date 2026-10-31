import { JourneyMilestone } from "./JourneyMilestone";
import { JourneyGuide } from "./JourneyGuide";
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
                data-usage-event="source_reference_opened"
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
        <JourneyMilestone event="living_topic_viewed" />
        <p className="eyebrow text-accent-deep">暮らしから、決まったことを読む</p>
        <h2 id={headingId} className="font-display mt-2 text-2xl leading-snug sm:text-3xl">{topic.caseTitle}</h2>
        <p className="mt-2 text-sm font-medium text-ink">{topic.title}</p>
        <p className="measure mt-3 text-sm leading-relaxed text-muted">{topic.summary}</p>
        <p className="mt-3 text-xs text-faint">この解説の確認日：<time dateTime={topic.confirmedAt}>{formatDate(topic.confirmedAt)}</time></p>
        <p className="mt-2 text-xs leading-relaxed text-muted">受付・空き状況・運行・避難情報をリアルタイムで確認した日ではありません。</p>
      </header>

      <div className="border-b border-line p-5 sm:px-6">
        <p className="eyebrow text-faint">対象と資料の時点</p>
        <dl className="mt-4 space-y-3 text-sm leading-relaxed">
          <div><dt className="font-bold">対象地域</dt><dd className="mt-1 text-muted"><Statement item={topic.region} topic={topic} /></dd></div>
          <div><dt className="font-bold">対象年度・計画の版</dt><dd className="mt-1 text-muted"><Statement item={topic.period} topic={topic} /></dd></div>
        </dl>
        <p className="mt-2 text-sm leading-relaxed text-muted"><Statement item={topic.status} topic={topic} /></p>
      </div>

      <div className="border-b border-line p-4 sm:px-6">
        <JourneyGuide stage="source" headingLevel="h3" />
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

      <footer id="living-sources" tabIndex={-1} aria-labelledby="living-sources-heading" className="scroll-mt-24 border-t border-line p-5 sm:px-6">
        <h3 id="living-sources-heading" className="text-sm font-bold text-ink">確認に使った一次資料</h3>
        <ol className="mt-3 space-y-2 text-sm">
          {topic.sources.map((source, index) => (
            <li key={source.id} id={`living-source-${topic.issueId}-${source.id}`} className="scroll-mt-24 flex items-baseline gap-2">
              <span className="shrink-0 text-xs text-faint">{index + 1}.</span>
              <div className="min-w-0 flex-1">
                <SourceLink href={source.url} usageEvent="source_external_opened" className="link-ink inline-flex min-h-11 items-center py-2.5">{source.label}</SourceLink>
                {source.checkedAt && <p className="text-xs text-muted">この資料の再確認日：<time dateTime={source.checkedAt}>{formatDate(source.checkedAt)}</time>（解説全体の確認日とは別）</p>}
                {source.checkNote && <p className="mt-1 text-xs leading-relaxed text-muted">{source.checkNote}</p>}
              </div>
            </li>
          ))}
        </ol>
      </footer>
    </section>
  );
}
