import type { Legislator, LegislatorProfile, VerificationRecord } from "@/lib/types";
import { verificationStatusText } from "@/lib/roster-verification";
import { SourceLink } from "./SourceLink";

export function VerificationDetail({ label, record }: { label: string; record?: VerificationRecord }) {
  return (
    <div className="min-w-0 border-t border-line py-3 first:border-t-0">
      <dt className="text-sm font-bold">{label}</dt>
      <dd className="mt-1 space-y-1 text-xs leading-relaxed text-muted">
        <p>{verificationStatusText(record)}{record && <> · 資料確認日：<time dateTime={record.checkedAt}>{record.checkedAt}</time></>}</p>
        {record?.sourceAsOf && <p>資料の基準日：<time dateTime={record.sourceAsOf}>{record.sourceAsOf}</time>（資料確認日とは異なります）</p>}
        {record?.note && <p>{record.note}</p>}
        {record?.status === "not_listed" && <p>就任・所属がないことを示すものではありません。</p>}
        {record && <p className="flex flex-wrap gap-x-3 gap-y-1">{record.sourceUrls.map((url, index) => <SourceLink key={url} href={url}>確認根拠{index + 1}</SourceLink>)}</p>}
      </dd>
    </div>
  );
}

export function LegislatorVerification({ legislator, profile }: { legislator: Legislator; profile?: LegislatorProfile }) {
  return (
    <section aria-labelledby="verification-heading" className="rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5">
      <h2 id="verification-heading" className="text-sm font-bold">名簿・所属・役職の確認状況</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">確認日と出典は項目ごとに示します。当選回数・略歴・首長の再確認を示すものではありません。</p>
      <dl className="mt-2 grid gap-x-6 sm:grid-cols-2">
        <VerificationDetail label="現職・氏名・選挙区" record={legislator.verification?.membership} />
        <VerificationDetail label={legislator.level === "national" ? "所属政党" : "所属会派"} record={legislator.verification?.affiliation} />
        {(legislator.faction || legislator.verification?.faction) && <VerificationDetail label={`議会の会派${legislator.faction ? `：${legislator.faction}` : ""}`} record={legislator.verification?.faction} />}
        <VerificationDetail label="掲載した主な役職" record={profile?.verification?.positions} />
        <VerificationDetail label="所属委員会" record={profile?.verification?.committees} />
      </dl>
    </section>
  );
}
