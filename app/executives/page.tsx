import type { Metadata } from "next";
import { getExecutives } from "@/lib/data";
import { SourceLink } from "@/components/SourceLink";
import { CompositionDots } from "@/components/CompositionDots";
import { LAST_UPDATED } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "首長（知事・市町村長）",
  description:
    "愛知県知事と県内市町村長を、公式サイトの一次ソース付きで一覧。議会（議員）とあわせて「誰が地域を率いているか」を確認できます。",
};

function ExecRow({
  area,
  title,
  name,
  kana,
  sourceUrl,
}: {
  area: string;
  title: string;
  name: string;
  kana?: string;
  sourceUrl: string;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-4 border-t border-line py-4 last:border-b sm:grid-cols-[12rem_1fr]">
      <div className="font-display text-base sm:text-lg">
        {area}
        <span className="eyebrow ml-2 align-middle text-faint">{title}</span>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-base">
          <span className="font-bold">{name}</span>
          {kana && <span className="ml-2 text-xs text-faint">{kana}</span>}
        </p>
        <span className="text-xs">
          <SourceLink href={sourceUrl}>公式プロフィール</SourceLink>
        </span>
      </div>
    </div>
  );
}

export default function ExecutivesPage() {
  const executives = getExecutives();
  const governor = executives.filter((e) => e.level === "prefectural");
  const mayors = executives
    .filter((e) => e.level === "municipal")
    .sort((a, b) => a.govCode.localeCompare(b.govCode));

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Executives</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          首長（知事・市町村長）
        </h1>
        <p className="measure mt-3 text-muted">
          愛知県知事と県内市町村長を、各自治体公式サイトの一次ソース付きで。
          議会（議員）が「決める人たち」なら、首長は「率いる人」。あわせて見ると地域の政治が立体的になります。
        </p>
        {/* 構成のドット（実データ：肩書別の人数） */}
        <div className="mt-5">
          <CompositionDots
            groups={[
              {
                label: "知事",
                count: executives.filter((e) => e.title === "知事").length,
                color: "var(--color-chart-national)",
              },
              {
                label: "市長",
                count: executives.filter((e) => e.title === "市長").length,
                color: "var(--color-chart-pref)",
              },
              {
                label: "町長・村長",
                count: executives.filter((e) => e.title === "町長" || e.title === "村長").length,
                color: "var(--color-chart-municipal)",
                shape: "ring",
              },
            ]}
            caption={`計${executives.length}人（各自治体公式サイトより）`}
          />
        </div>
      </header>

      {governor.length > 0 && (
        <section>
          <h2 className="eyebrow text-accent-deep">愛知県知事</h2>
          <div className="mt-3">
            {governor.map((e) => (
              <ExecRow
                key={e.id}
                area={e.area}
                title={e.title}
                name={e.name}
                kana={e.kana}
                sourceUrl={e.sourceUrl}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="eyebrow text-accent-deep">市町村長（{mayors.length}）</h2>
        {mayors.length === 0 ? (
          <p className="mt-3 text-sm text-muted">データは準備中です。</p>
        ) : (
          <div className="mt-3">
            {mayors.map((e) => (
              <ExecRow
                key={e.id}
                area={e.area}
                title={e.title}
                name={e.name}
                kana={e.kana}
                sourceUrl={e.sourceUrl}
              />
            ))}
          </div>
        )}
      </section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。氏名・肩書はすべて各自治体公式サイトの記載に基づきます（各行の「公式プロフィール」リンクが出典）。
        改選などで交代した場合は順次更新します。誤りにお気づきの場合は出典とあわせてご指摘ください。
      </p>
    </div>
  );
}
