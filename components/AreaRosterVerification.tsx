import Link from "next/link";
import type { Legislator } from "@/lib/types";
import { VerificationDetail } from "./LegislatorVerification";

type Field = "membership" | "affiliation";

function Summary({ label, field, legislators }: { label: string; field: Field; legislators: readonly Legislator[] }) {
  const counts = { verified: 0, not_listed: 0, unconfirmed: 0, missing: 0 };
  const dates = new Set<string>();
  for (const legislator of legislators) {
    const record = legislator.verification?.[field];
    if (record) {
      counts[record.status]++;
      dates.add(record.checkedAt);
    } else counts.missing++;
  }
  const statuses = [
    ["verified", "公式資料と照合"],
    ["not_listed", "公式資料に掲載なし"],
    ["unconfirmed", "現状は未確認"],
    ["missing", "確認記録なし"],
  ] as const;

  return (
    <div className="min-w-0 rounded-xl bg-subtle p-3">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="mt-2 space-y-1 text-xs leading-relaxed text-muted">
        <p>{statuses.filter(([key]) => counts[key] > 0).map(([key, text]) => `${text} ${counts[key]}名`).join(" ／ ")}</p>
        <p>記録された資料確認日：{dates.size ? [...dates].sort().map((date, index) => <span key={date}>{index > 0 && "・"}<time dateTime={date}>{date}</time></span>) : "未記録"}</p>
      </dd>
    </div>
  );
}

/** 既存の名簿照合記録だけを表示し、サイト更新日や役職の確認日へ広げない。 */
export function AreaRosterVerification({ legislators }: { legislators: readonly Legislator[] }) {
  if (legislators.length === 0) return null;
  return (
    <section aria-labelledby="area-roster-verification-heading" className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <h2 id="area-roster-verification-heading" className="text-base font-medium">名簿・所属の確認状況</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">対象は、この区の案内に掲載した本サイト収録の議員{legislators.length}名です。資料確認日は、サイト更新日や資料の基準日とは異なります。</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <Summary label="現職・氏名・選挙区" field="membership" legislators={legislators} />
        <Summary label="所属（国会は政党／県・市は会派）" field="affiliation" legislators={legislators} />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-muted">当選回数・略歴・役職などを再確認した日ではありません。確認した資料と、その基準日は以下の個別記録で確認できます。</p>
      <details className="mt-3 border-t border-line pt-2">
        <summary className="min-h-11 cursor-pointer py-2 text-sm text-accent-deep">議員ごとの照合日・資料の基準日・公式出典</summary>
        <ul className="mt-3 divide-y divide-line">
          {legislators.map((legislator) => (
            <li key={legislator.id} className="py-4 first:pt-0">
              <Link href={`/legislators/${legislator.id}/`} className="link-ink inline-flex min-h-11 items-center text-sm font-medium">{legislator.name}</Link>
              <span className="ml-2 text-xs text-muted">{legislator.district}</span>
              <dl className="mt-1 grid gap-x-5 sm:grid-cols-2">
                <VerificationDetail label="現職・氏名・選挙区" record={legislator.verification?.membership} />
                <VerificationDetail label={legislator.level === "national" ? "所属政党" : "所属会派"} record={legislator.verification?.affiliation} />
              </dl>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
