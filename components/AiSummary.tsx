import { SourceLink } from "./SourceLink";

// AI要約は「補助情報」。視覚的に区別し、免責＋元発言リンクを必ず併記する。
export function AiSummary({ summary, sourceUrl }: { summary?: string; sourceUrl: string }) {
  if (!summary) return null;
  return (
    <div className="mt-3 rounded-lg border border-line bg-accent-weak p-3 text-sm">
      <p className="mb-1 text-xs font-semibold text-accent">AIによる自動要約（補助情報）</p>
      <p className="text-ink">{summary}</p>
      <p className="mt-2 text-xs text-muted">
        ※ 自動生成のため原文と異なる場合があります。判断の際は必ず{" "}
        <SourceLink href={sourceUrl}>発言の原文（会議録）</SourceLink> をご確認ください。
      </p>
    </div>
  );
}
