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

/** 同一争点について、国・県・市の発言/動きを1画面で並置する（SPEC 受け入れ条件4）。 */
export function CrossLayerView({
  items,
  keywords,
}: {
  items: CrossLayerItem[];
  keywords: string[];
}) {
  const pref = MINUTES_SEARCH.prefectural;
  const muni = MINUTES_SEARCH.municipal;
  return (
    <div className="space-y-8">
      <section>
        <LayerHead label="国" full="国会（愛知選出）" />
        {items.length === 0 ? (
          // 0件時は空振りカードでなく台帳の1行に縮退（反復ノイズを避ける）。
          <p className="tnum border-y border-line py-3 text-sm text-muted">
            この争点の取得済み発言：<span className="font-bold text-ink">0件</span>
            （関連発言が会議録に記録され次第、追加します）
          </p>
        ) : (
          <>
            <p className="tnum mb-3 border-b border-line pb-2 text-sm text-muted">
              この争点の取得済み発言：
              <span className="font-bold text-ink">{items.length}件</span>
              （各発言に出典つき）
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
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
          </>
        )}
      </section>

      {/* 県・市は1つの「公式会議録で確認」モジュールに統合（同文反復＝テンプレ臭を避ける）。 */}
      <section>
        <LayerHead label="県・市" full="愛知県議会・市町村議会" />
        <div className="border-l-2 border-line bg-subtle px-4 py-3 text-sm text-muted">
          <p>
            県・市町村議会の発言本文は、各サイトの規約・robots.txt
            に配慮し本サイトでは扱っていません。公式の会議録検索システムで、次のキーワードからご確認いただけます。
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
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {pref && <SourceLink href={pref.url}>{pref.label}</SourceLink>}
            {muni && <SourceLink href={muni.url}>{muni.label}</SourceLink>}
          </p>
        </div>
      </section>
    </div>
  );
}
