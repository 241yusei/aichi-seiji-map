import Link from "next/link";
import type { SpeechRecord } from "@/lib/types";
import type { Theme } from "@/lib/themes";
import { formatDate } from "@/lib/format";
import { keywordParts, speechKeywordContext } from "@/lib/speech-context";
import { AiSummary } from "./AiSummary";
import { SourceLink } from "./SourceLink";
import { SpeechCard } from "./SpeechCard";

export function ThemeSpeechCard({ speech, speakerName, theme }: {
  speech: SpeechRecord;
  speakerName?: string;
  theme: Pick<Theme, "label" | "keywords">;
}) {
  const context = speechKeywordContext(speech.text, theme.keywords);
  if (!context) return <SpeechCard speech={speech} speakerName={speakerName} />;
  const headingId = `theme-speech-${speech.id}`;

  return (
    <article aria-labelledby={headingId} data-speech-id={speech.id} className="border border-line bg-surface p-4 sm:p-5">
      <p className="eyebrow text-accent-deep">{theme.label} · キーワード一致</p>
      <h3 id={headingId} className="font-display mt-2 text-xl">
        {speakerName ? `${speakerName}氏の発言` : "収録された発言"}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        <time dateTime={speech.date}>{formatDate(speech.date)}</time> · {speech.body}
      </p>

      <div className="mt-4 rounded-xl bg-subtle p-3 sm:p-4">
        <p className="text-xs text-muted">収録本文全体の一致語：<span className="font-bold text-ink">{context.matched.join("・")}</span></p>
        <p className="mt-3 text-sm font-bold">最初の一致箇所の周辺原文（自動抜粋）</p>
        <blockquote cite={speech.sourceUrl} className="measure mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
          {context.before && "…"}
          {keywordParts(context.text, context.matched).map((part, i) => part.matched
            ? <mark key={i} className="bg-calm font-bold text-ink underline decoration-accent decoration-2 underline-offset-4">{part.text}</mark>
            : part.text)}
          {context.after && "…"}
        </blockquote>
      </div>

      {speech.isExcerpt && <p className="mt-3 text-xs text-muted">収録本文自体も抜粋です。全文は公式会議録でご確認ください。</p>}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <SourceLink href={speech.sourceUrl} className="link-ink inline-flex min-h-11 flex-wrap items-center">
          全文・前後の発言を会議録で確認<span className="text-xs text-muted">（国立国会図書館・別タブ）</span>
        </SourceLink>
        <Link href={`/legislators/${speech.legislatorId}/`} className="link-ink inline-flex min-h-11 items-center">
          {speakerName ? `${speakerName}氏` : "この議員"}の発言・採決・政治資金 →
        </Link>
      </div>
      <AiSummary summary={speech.aiSummary} sourceUrl={speech.sourceUrl} />
    </article>
  );
}
