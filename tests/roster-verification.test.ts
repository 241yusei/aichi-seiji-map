// すべて使い捨てfixture。公式サイト・本番・収集APIには接続しない。
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { VerificationDetail, LegislatorVerification } from "../components/LegislatorVerification";
import { rosterVerificationAuditErrors, verifiedMembershipCount } from "../lib/roster-verification";
import { verificationRecordSchema, legislatorSchema, legislatorProfileSchema, speechImportAuditSchema } from "../lib/zod-schemas";
import type { Legislator, LegislatorProfile, RosterVerificationAudit, VerificationRecord } from "../lib/types";

const verified: VerificationRecord = { checkedAt: "2026-10-23", sourceAsOf: "2026-09-28", status: "verified", sourceUrls: ["https://example.org/official-roster"] };
const member: Legislator = { id: "nat-stable-id", name: "照合した氏名", kana: "しょうごうしたしめい", level: "national", district: "愛知1区", party: "所属政党", faction: "別の議会会派", sourceUrl: verified.sourceUrls[0], verification: { membership: verified, affiliation: verified, faction: verified } };

test("公式資料の基準日と確認日を分け、不正日付・根拠なし・未来の資料基準日を拒否する", () => {
  assert.ok(verificationRecordSchema.safeParse(verified).success);
  for (const invalid of [
    { ...verified, checkedAt: "2026-02-30" },
    { ...verified, sourceAsOf: "2026-10-24" },
    { ...verified, sourceUrls: [] },
    { ...verified, sourceUrls: ["not a url"] },
    { ...verified, sourceUrls: ["https://ja.wikipedia.org/wiki/fixture"] },
    { ...verified, sourceUrls: [verified.sourceUrls[0], verified.sourceUrls[0]] },
  ]) assert.equal(verificationRecordSchema.safeParse(invalid).success, false);
});

test("掲載なし・確認不十分には理由が必要で、確認済みへ変換しない", () => {
  for (const status of ["not_listed", "unconfirmed"] as const) {
    assert.equal(verificationRecordSchema.safeParse({ ...verified, status }).success, false);
    assert.equal(verificationRecordSchema.safeParse({ ...verified, status, note: "指定した公式資料では確認できません。" }).success, true);
  }
  assert.equal(verifiedMembershipCount([member, { ...member, id: "other", verification: undefined }]), 1);
  assert.equal(verifiedMembershipCount([{ ...member, verification: { membership: { ...verified, status: "unconfirmed", note: "現職は未確認です" }, affiliation: verified } }]), 0);
});

test("政党と会派、名簿確認と役職確認を別々の根拠として保持する", () => {
  const parsed = legislatorSchema.parse(member);
  assert.equal(parsed.party, "所属政党");
  assert.equal(parsed.faction, "別の議会会派");
  assert.equal(parsed.verification?.faction?.sourceAsOf, "2026-09-28");
  const profile = legislatorProfileSchema.parse({ id: member.id, positions: [], committees: [], sourceUrl: verified.sourceUrls[0] });
  assert.equal(profile.electionCount, undefined);
});

test("実表示で資料の基準日・根拠・未確認を区別し、掲載なしを無役職と断定しない", () => {
  const html = renderToStaticMarkup(createElement(VerificationDetail, { label: "主な役職", record: { ...verified, status: "not_listed", note: "指定した公式一覧に役職の掲載がありません。" } }));
  for (const text of ["公式資料に掲載なし", "就任・所属がないことを示すものではありません", "資料確認日", "資料の基準日", "2026-10-23", "2026-09-28", "https://example.org/official-roster"]) assert.ok(html.includes(text), text);
  const unknown = renderToStaticMarkup(createElement(VerificationDetail, { label: "主な役職" }));
  assert.ok(unknown.includes("確認日：未記録"));
  assert.ok(!unknown.includes("公式資料と照合"));
  const detail = renderToStaticMarkup(createElement(LegislatorVerification, { legislator: member }));
  assert.ok(detail.includes("所属政党"));
  assert.ok(detail.includes("議会の会派：別の議会会派"));
  assert.ok(detail.includes("当選回数・略歴・首長の再確認を示すものではありません"));
});

function auditFixtures() {
  const legislators: Legislator[] = [member,
    { ...member, id: "pref", level: "prefectural" },
    { ...member, id: "nagoya", level: "municipal", govCode: "23100" },
    { ...member, id: "other-city", level: "municipal", govCode: "23211", verification: undefined },
  ];
  const profiles: LegislatorProfile[] = legislators.slice(0, 3).map((item) => ({ id: item.id, positions: ["確認済み役職"], committees: ["確認済み委員会"], sourceUrl: verified.sourceUrls[0], verification: { positions: verified, committees: verified } }));
  const audits: RosterVerificationAudit[] = (["national", "prefectural", "nagoya"] as const).map((scope, index) => ({ scope, checkedAt: "2026-10-23", sources: [{ url: verified.sourceUrls[0], purpose: "公式名簿" }], matchedIds: [legislators[index].id], changes: [], unresolved: [] }));
  return { legislators, profiles, audits };
}

test("照合漏れ・別自治体の混入・役職確認漏れを検出し、他市の未照合は対象外に保つ", () => {
  const { legislators, profiles, audits } = auditFixtures();
  assert.deepEqual(rosterVerificationAuditErrors(legislators, profiles, audits), []);
  assert.ok(rosterVerificationAuditErrors(legislators, profiles, [{ ...audits[0], matchedIds: [] }, ...audits.slice(1)]).some((message) => message.includes("名簿照合記録にない")));
  assert.ok(rosterVerificationAuditErrors(legislators, profiles, [{ ...audits[0], matchedIds: [member.id, "other-city"] }, ...audits.slice(1)]).some((message) => message.includes("対象外")));
  assert.ok(rosterVerificationAuditErrors(legislators, profiles.slice(1), audits).some((message) => message.includes("役職・委員会の確認状況がありません")));
  assert.ok(rosterVerificationAuditErrors(legislators, profiles, [{ ...audits[0], checkedAt: "2026-10-22" }, ...audits.slice(1)]).some((message) => message.includes("確認日が一致しません")));
});

test("公式掲載なしの項目へ旧役職を残して確認済みのように見せない", () => {
  const { legislators, profiles, audits } = auditFixtures();
  profiles[0].verification!.positions = { ...verified, status: "not_listed", note: "公式掲載なし" };
  assert.ok(rosterVerificationAuditErrors(legislators, profiles, audits).some((message) => message.includes("掲載なしのpositions")));
  profiles[0].positions = [];
  assert.deepEqual(rosterVerificationAuditErrors(legislators, profiles, audits), []);
});

test("名簿再生成で氏名表記を修正しても既存ID・確認日・政党と会派を保持する", () => {
  const root = mkdtempSync(join(tmpdir(), "roster-verification-test-"));
  try {
    mkdirSync(join(root, "data", "seed"), { recursive: true });
    const seed = [{ id: member.id, name: "訂正後の氏名", kana: "ていせいごのしめい", house: "衆議院", district: member.district, party: member.party, faction: member.faction, sourceUrl: member.sourceUrl, verification: member.verification }];
    writeFileSync(join(root, "data", "seed", "legislators.aichi.seed.json"), JSON.stringify(seed));
    const script = fileURLToPath(new URL("../scripts/seed-legislators-aichi.ts", import.meta.url));
    const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/loader.mjs", import.meta.url));
    const result = spawnSync(process.execPath, ["--import", tsx, script], { cwd: root, encoding: "utf-8" });
    assert.equal(result.status, 0, result.stderr);
    const [out] = JSON.parse(readFileSync(join(root, "data", "legislators.aichi.json"), "utf-8"));
    assert.equal(out.id, member.id);
    assert.equal(out.name, "訂正後の氏名");
    assert.equal(out.party, member.party);
    assert.equal(out.faction, member.faction);
    assert.deepEqual(out.verification, member.verification);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("PR取込の件数・重複・照会日と確認日の逆転を拒否する", () => {
  const fixture = { pullRequestUrl: "https://github.com/example/repo/pull/93", sourceCommit: "a".repeat(40), runUrl: "https://github.com/example/repo/actions/runs/1", reviewedAt: "2026-10-23", collectionCheckedAt: "2026-10-20", beforeCount: 10, afterCount: 12, speechIds: ["new1", "new2"], note: "収集ログで成功を確認" };
  assert.ok(speechImportAuditSchema.safeParse(fixture).success);
  for (const invalid of [{ ...fixture, afterCount: 11 }, { ...fixture, speechIds: ["new1", "new1"] }, { ...fixture, collectionCheckedAt: "2026-10-24" }]) assert.equal(speechImportAuditSchema.safeParse(invalid).success, false);
});


test("所属掲載なしへ旧政党・会派を残して現行値として表示しない", () => {
  const { legislators, profiles, audits } = auditFixtures();
  const noListing: VerificationRecord = { ...verified, status: "not_listed", note: "公式の掲載がありません" };
  legislators[0] = { ...member, verification: { membership: verified, affiliation: noListing, faction: noListing } };
  const errors = rosterVerificationAuditErrors(legislators, profiles, audits);
  assert.ok(errors.some((message) => message.includes("旧政党・会派")));
  assert.ok(errors.some((message) => message.includes("旧会派")));
  legislators[0] = { ...legislators[0], party: undefined, faction: undefined };
  assert.deepEqual(rosterVerificationAuditErrors(legislators, profiles, audits), []);
});
