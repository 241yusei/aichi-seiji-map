import Link from "next/link";

type JourneyStage = "start" | "representative" | "topic" | "source";

const TOPICS = [
  { href: "/issues/kosodate/#living-topic", label: "子育て" },
  { href: "/issues/transit/#living-topic", label: "公共交通" },
  { href: "/issues/bousai/#living-topic", label: "防災" },
];
const COPY = {
  start: { title: "はじめてなら、この順番で", body: "地域の代表者を知り、暮らしの話題とその根拠をたどってみましょう。", href: "/area/#region-picker", action: "市町村・区を選ぶ →" },
  representative: { title: "次は、代表者の名前を選ぶ", body: "気になる名前を押すと、プロフィールや本サイトに掲載した記録を確認できます。", href: "#representatives", action: "代表者の名前へ ↓" },
  topic: { title: "次は、暮らしの話題も見てみよう", body: "代表者の記録とは別の入口から、具体的な制度・計画を確認できます。" },
  source: { title: "一次資料で確かめる", body: "根拠になった公式資料へのリンクを、このページの下にまとめています。", href: "#living-sources", action: "一次資料のリンク一覧へ ↓" },
} as const;

/** 次の操作を案内する。議員と制度の担当・賛否を関連付けるものではない。 */
export function JourneyGuide({ stage, headingLevel = "h2" }: { stage: JourneyStage; headingLevel?: "h2" | "h3" }) {
  const copy = COPY[stage];
  const Heading = headingLevel;
  const headingId = `journey-${stage}-heading`;
  return (
    <aside aria-labelledby={headingId} className="rounded-2xl border border-line bg-sand/60 p-4 sm:p-5">
      <ol aria-label="読む順番" className="mb-3 grid grid-cols-4 gap-2 text-xs leading-relaxed text-muted">
        {["地域", "代表者", "暮らし", "一次資料"].map((label, index) => <li key={label} className="whitespace-nowrap"><span className="mb-1 block text-[10px] text-accent">{index + 1}</span>{label}</li>)}
      </ol>
      <Heading id={headingId} className="text-base font-medium">{copy.title}</Heading>
      <p className="mt-2 text-sm leading-relaxed text-muted">{copy.body}</p>
      {stage === "topic" ? (
        <>
          <nav aria-label="暮らしの3テーマへ" className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((topic) => <Link key={topic.href} href={topic.href} className="tap inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-accent-deep hover:bg-subtle">{topic.label} →</Link>)}
          </nav>
          <p className="mt-3 text-xs leading-relaxed text-muted">この議員の担当・賛否を示すものではありません。制度・計画の対象地域はテーマごとに異なります。</p>
        </>
      ) : "href" in copy && (
        <Link href={copy.href} data-usage-event={stage === "source" ? "source_reference_opened" : undefined} className="tap mt-3 inline-flex items-center rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep">{copy.action}</Link>
      )}
      {stage === "source" && <p className="mt-2 text-xs leading-relaxed text-muted">[出典]はページ内の資料一覧へ、↗のリンクは公式サイトを別タブで開きます。</p>}
    </aside>
  );
}
