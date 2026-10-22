import type { Legislator, LegislatorProfile, RosterVerificationAudit, VerificationRecord } from "./types";

export function verifiedMembershipCount(legislators: Legislator[]): number {
  return legislators.filter((legislator) => legislator.verification?.membership.status === "verified").length;
}

export function verificationStatusText(record?: VerificationRecord): string {
  if (!record) return "確認日：未記録";
  if (record.status === "not_listed") return "公式資料に掲載なし";
  if (record.status === "unconfirmed") return "現状は未確認";
  return "公式資料と照合";
}


/** 同じ照合で確認していない自治体やプロフィールを、集計だけで確認済みにしない。 */
export function rosterVerificationAuditErrors(
  legislators: Legislator[], profiles: LegislatorProfile[], audits: RosterVerificationAudit[],
): string[] {
  const errors: string[] = [];
  const scopes = ["national", "prefectural", "nagoya"] as const;
  for (const scope of scopes) {
    const members = legislators.filter((legislator) => scope === "nagoya"
      ? legislator.level === "municipal" && legislator.govCode === "23100"
      : legislator.level === scope);
    const reports = audits.filter((audit) => audit.scope === scope);
    if (reports.length !== 1) { errors.push(`${scope}: 照合記録は1件必要です`); continue; }
    const report = reports[0];
    const ids = new Set(members.map((member) => member.id));
    const matched = new Set(report.matchedIds);
    for (const id of matched) if (!ids.has(id)) errors.push(`${scope}: 照合記録の議員が対象外です: ${id}`);
    for (const member of members) {
      if (!matched.has(member.id)) errors.push(`${scope}: 名簿照合記録にない議員: ${member.id}`);
      if (!member.verification || member.verification.membership.status !== "verified") {
        errors.push(`${member.id}: 現職・氏名・選挙区の公式照合が必要です`);
      } else if (member.verification.membership.checkedAt !== report.checkedAt) {
        errors.push(`${member.id}: 照合記録と個別の確認日が一致しません`);
      }
      if (member.party?.trim() && member.verification && member.verification.affiliation.status !== "verified") {
        errors.push(`${member.id}: 確認済みではない所属に旧政党・会派を現行値として残せません`);
      }
      if (member.faction?.trim() && member.verification?.faction && member.verification.faction.status !== "verified") {
        errors.push(`${member.id}: 確認済みではない会派に旧会派を現行値として残せません`);
      }
      if (member.faction && !member.verification?.faction) errors.push(`${member.id}: 議会会派の確認根拠がありません`);
      const profile = profiles.find((item) => item.id === member.id);
      if (!profile?.verification) { errors.push(`${member.id}: 役職・委員会の確認状況がありません`); continue; }
      for (const field of ["positions", "committees"] as const) {
        if (profile.verification[field].status === "not_listed" && profile[field].length > 0) {
          errors.push(`${member.id}: 掲載なしの${field}に役職・所属を残せません`);
        }
      }
    }
  }
  return errors;
}
