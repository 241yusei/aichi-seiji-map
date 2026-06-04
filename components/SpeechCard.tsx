import type { SpeechRecord } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { AiSummary } from "./AiSummary";
import { SourceLink } from "./SourceLink";

// 発言カード。一次ソース（原文）を主役にし、出典リンクを前面に置く。
export function SpeechCard({ speech }: { speech: SpeechRecord }) {
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold">{speech.body}</h3>
        <time dateTime={speech.date} className="shrink-0 text-xs text-muted">
          {formatDate(speech.date)}
        </time>
      </div>

      <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {speech.text}
      </p>

      <p className="mt-2 text-xs">
        <SourceLink href={speech.sourceUrl}>発言の原文（会議録）↗</SourceLink>
        {speech.isExcerpt && <span className="ml-2 text-muted">（抜粋）</span>}
      </p>

      <AiSummary summary={speech.aiSummary} sourceUrl={speech.sourceUrl} />
    </article>
  );
}
