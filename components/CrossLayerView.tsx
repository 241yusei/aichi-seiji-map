import Link from "next/link";
import type { Legislator, SpeechRecord } from "@/lib/types";
import { MINUTES_SEARCH } from "@/lib/sources/linkout";
import { SpeechCard } from "./SpeechCard";
import { SourceLink } from "./SourceLink";

export interface CrossLayerItem {
  speech: SpeechRecord;
  legislator?: Legislator;
}

function MinutesColumn({
  level,
  keywords,
}: {
  level: "prefectural" | "municipal";
  keywords: string[];
}) {
  const m = MINUTES_SEARCH[level];
  if (!m) return null;
  const body =
    level === "prefectural" ? "愛知県議会" : "名古屋市会";
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
      <p>
        {body}の発言本文は、各サイトの規約・robots.txt に配慮し本サイトでは扱っていません。
        公式の会議録検索システムで、次のキーワードからご確認いただけます。
      </p>
      {keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {keywords.map((k) => (
            <span key={k} className="rounded bg-accent-weak px-2 py-0.5 text-xs text-accent">
              {k}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3">
        <SourceLink href={m.url}>{m.label} ↗</SourceLink>
      </p>
    </div>
  );
}

/** 同一争点について、国・県・市の発言/動きを1画面で並置する（SPEC 受け入れ条件4）。 */
export function CrossLayerView({
  items,
  keywords,
}: {
  items: CrossLayerItem[];
  keywords: string[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <span className="rounded bg-accent-weak px-1.5 py-0.5 text-xs text-accent">国</span>
          国会（愛知選出）
        </h3>
        {items.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
            取得済みの発言からは、この争点の関連発言は見つかりませんでした。
          </p>
        ) : (
          <div className="space-y-3">
            {items.map(({ speech, legislator }) => (
              <div key={speech.id}>
                {legislator && (
                  <Link
                    href={`/legislators/${legislator.id}/`}
                    className="mb-1 inline-block text-xs font-medium text-accent hover:underline"
                  >
                    {legislator.name}（{legislator.district}
                    {legislator.party ? `・${legislator.party}` : ""}）
                  </Link>
                )}
                <SpeechCard speech={speech} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <span className="rounded bg-accent-weak px-1.5 py-0.5 text-xs text-accent">県</span>
          愛知県議会
        </h3>
        <MinutesColumn level="prefectural" keywords={keywords} />
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <span className="rounded bg-accent-weak px-1.5 py-0.5 text-xs text-accent">市</span>
          名古屋市会
        </h3>
        <MinutesColumn level="municipal" keywords={keywords} />
      </section>
    </div>
  );
}
