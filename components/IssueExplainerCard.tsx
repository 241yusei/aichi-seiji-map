import type { IssueExplainer } from "@/lib/types";
import { SourceLink } from "./SourceLink";

// 争点の「一言でいうと」カード（説明報道型）。立場は中立に併記し、推薦はしない。
export function IssueExplainerCard({ ex }: { ex: IssueExplainer }) {
  return (
    <section className="border border-ink bg-surface">
      <div className="border-b border-line bg-subtle px-5 py-4">
        <p className="eyebrow text-accent-deep">一言でいうと</p>
        <p className="mt-1 text-base font-bold leading-relaxed">{ex.oneLine}</p>
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-2">
        <div className="bg-surface p-5">
          <p className="eyebrow text-faint">なぜ重要か</p>
          <p className="mt-1 text-sm text-muted">{ex.whyImportant}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="eyebrow text-faint">いま何が起きているか</p>
          <p className="mt-1 text-sm text-muted">{ex.now}</p>
        </div>
      </div>
      <div className="border-t border-line p-5">
        <p className="eyebrow text-faint">立場（中立に併記・推薦はしません）</p>
        <ul className="mt-2 space-y-2">
          {ex.stances.map((s, i) => (
            <li key={i} className="measure text-sm">
              <span className="font-bold text-ink">{s.label}：</span>
              <span className="text-muted">{s.text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-faint">主語（だれの権限の話か）：{ex.subject}</p>
      </div>
      {ex.sources && ex.sources.length > 0 && (
        <div className="border-t border-line px-5 py-3">
          <p className="eyebrow text-faint">出典</p>
          <ul className="mt-1 space-y-1 text-sm">
            {ex.sources.map((s, i) => (
              <li key={i}>
                <SourceLink href={s.url}>{s.label}</SourceLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
