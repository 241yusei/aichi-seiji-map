import { SourceLink } from "./SourceLink";

// AI要約は「補助情報」。一次ソースより一段弱く（左罫線・小さめ・ラベル）、免責＋元発言リンクを必ず併記。
export function AiSummary({ summary, sourceUrl }: { summary?: string; sourceUrl: string }) {
  if (!summary) return null;
  return (
    <div className="mt-3 border-l-2 border-accent bg-subtle px-3 py-2.5">
      <p className="eyebrow mb-1 text-accent-deep">AIによる自動要約（補助）</p>
      <p className="text-sm text-ink">{summary}</p>
      <p className="mt-2 text-xs text-faint">
        ※ 自動生成のため原文と異なる場合があります。判断の際は必ず{" "}
        <SourceLink href={sourceUrl}>発言の原文（会議録）</SourceLink> をご確認ください。
      </p>
    </div>
  );
}
