import type { Candidate } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SourceLink } from "./SourceLink";

// 立候補者の一覧。全員を同じカード・同じ項目で、五十音順に並べる（写真・色・大きさの差をつけない）。
// 掲載するのは、告示日に届け出があり、選挙管理委員会が発表した情報だけ。告示前の「出馬の動き」は載せない。
export function CandidateList({ candidates, electionName }: { candidates: Candidate[]; electionName: string }) {
  return (
    <section aria-labelledby="candidates-heading" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="candidates-heading" className="text-xl font-medium sm:text-2xl">
        立候補した人
      </h2>
      {candidates.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {electionName}の告示日に立候補の届け出があると、選挙管理委員会の発表をもとに、ここに全員を同じ書式で掲載します。
          本サイトは、届け出の前に「出馬する」と伝えられている人を候補者として扱いません。
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            届け出順ではなく<strong className="font-medium text-ink">五十音順</strong>です
            （選挙公報や掲示板の順番とは異なります）。本サイトはどの候補者への投票も呼びかけません。
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {candidates.map((c) => (
              <li key={`${c.name}-${c.kana}`} className="rounded-xl bg-subtle p-4">
                <p className="text-xs text-muted">{c.kana}</p>
                <p className="text-lg font-medium text-ink">{c.name}</p>
                <dl className="mt-2 grid grid-cols-[4.5em_1fr] gap-y-1 text-sm">
                  {c.age !== undefined && (
                    <>
                      <dt className="text-muted">年齢</dt>
                      <dd>{c.age}歳</dd>
                    </>
                  )}
                  <dt className="text-muted">党派</dt>
                  <dd>{c.party}</dd>
                  {c.status && (
                    <>
                      <dt className="text-muted">区分</dt>
                      <dd>{c.status}</dd>
                    </>
                  )}
                  {c.occupation && (
                    <>
                      <dt className="text-muted">職業</dt>
                      <dd>{c.occupation}</dd>
                    </>
                  )}
                  <dt className="text-muted">届出日</dt>
                  <dd>{formatDate(c.filedAt)}</dd>
                </dl>
                <p className="mt-2 text-xs">
                  <SourceLink href={c.sourceUrl}>選挙管理委員会の発表</SourceLink>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
