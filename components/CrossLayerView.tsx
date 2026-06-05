import Link from "next/link";
import type { Legislator, SpeechRecord } from "@/lib/types";
import { MINUTES_SEARCH } from "@/lib/sources/linkout";
import { SpeechCard } from "./SpeechCard";
import { SourceLink } from "./SourceLink";

export interface CrossLayerItem {
  speech: SpeechRecord;
  legislator?: Legislator;
}

function LayerHead({ label, full }: { label: string; full: string }) {
  return (
    <h3 className="mb-3 flex items-baseline gap-2 border-b-2 border-ink pb-2">
      <span className="inline-flex items-center border border-ink px-1.5 text-[0.7rem] font-bold leading-5 text-ink">
        {label}
      </span>
      <span className="font-display text-lg">{full}</span>
    </h3>
  );
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
  const body = level === "prefectural" ? "愛知県議会" : "市町村議会";
  return (
    <div className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
      <p>
        {body}の発言本文は、各サイトの規約・robots.txt に配慮し本サイトでは扱っていません。
        公式の会議録検索システムで、次のキーワードからご確認いただけます。
      </p>
      {keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span key={k} className="border border-line bg-surface px-2 py-0.5 text-xs text-ink">
              {k}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3">
        <SourceLink href={m.url}>{m.label}</SourceLink>
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
    <div className="grid gap-8 lg:grid-cols-3">
      <section>
        <LayerHead label="国" full="国会（愛知選出）" />
        {items.length === 0 ? (
          <p className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
            取得済みの発言からは、この争点の関連発言は見つかりませんでした。
          </p>
        ) : (
          <div className="space-y-3">
            {items.map(({ speech, legislator }) => (
              <div key={speech.id}>
                {legislator && (
                  <Link
                    href={`/legislators/${legislator.id}/`}
                    className="link-ink mb-1 inline-block text-xs"
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
        <LayerHead label="県" full="愛知県議会" />
        <MinutesColumn level="prefectural" keywords={keywords} />
      </section>

      <section>
        <LayerHead label="市" full="市町村議会" />
        <MinutesColumn level="municipal" keywords={keywords} />
      </section>
    </div>
  );
}
