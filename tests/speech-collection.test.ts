import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// 外部fetchを全置換し、cwdは使い捨て。実API・本番・リポジトリのdataへ接続しない。
function fixture(fail: boolean, broken = false) {
  const root = mkdtempSync(join(tmpdir(), "speech-collection-test-"));
  mkdirSync(join(root, "data"));
  const old = '[{"id":"saved","legislatorId":"fixture","date":"2024-01-01","body":"fixture","text":"saved","sourceUrl":"https://example.org/saved"}]\n';
  writeFileSync(join(root, "data/speeches.national.json"), broken ? "{broken" : old);
  writeFileSync(join(root, "data/legislators.aichi.json"), JSON.stringify([{ id: "fixture", name: "試験議員", kana: "", level: "national", district: "愛知1区", sourceUrl: "https://example.org/profile" }]));
  writeFileSync(join(root, "data/speech-collection-status.json"), JSON.stringify({ sourceUrl: "https://kokkai.ndl.go.jp/api.html", lastSuccessfulCheck: "2026-10-18", from: "2026-10-01", until: "2026-10-18", targetCount: 1, succeededCount: 1, failedIds: [] }));
  writeFileSync(join(root, "mock.mjs"), `globalThis.fetch = async (url) => { if (!String(url).startsWith("https://kokkai.ndl.go.jp/api/speech?")) throw new Error("fixture blocked network"); ${fail ? 'throw new Error("fixture failure");' : 'return new Response(JSON.stringify({numberOfRecords:0,speechRecord:[]}),{status:200});'} };`);
  const loader = fileURLToPath(new URL("../node_modules/tsx/dist/loader.mjs", import.meta.url));
  const script = fileURLToPath(new URL("../scripts/fetch-kokkai.ts", import.meta.url));
  const result = spawnSync(process.execPath, ["--import", loader, "--import", join(root, "mock.mjs"), script], { cwd: root, env: { ...process.env, KOKKAI_FROM: "2026-10-01", KOKKAI_UNTIL: "2026-10-22" }, encoding: "utf8", timeout: 10000 });
  return { root, result, old };
}

test("追加0件でも全対象の照会成功を記録し、既存発言を保持する", () => {
  const { root, result, old } = fixture(false);
  try {
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(readFileSync(join(root, "data/speeches.national.json"), "utf8")), JSON.parse(old));
    const status = JSON.parse(readFileSync(join(root, "data/speech-collection-status.json"), "utf8"));
    assert.equal(status.succeededCount, 1);
    assert.equal(status.until, "2026-10-22");
    assert.equal(status.lastSuccessfulCheck, new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("取得失敗を成功扱いせず、前回の成功日と既存発言を保持する", () => {
  const { root, result, old } = fixture(true);
  try {
    assert.equal(result.status, 1);
    assert.deepEqual(JSON.parse(readFileSync(join(root, "data/speeches.national.json"), "utf8")), JSON.parse(old));
    const status = JSON.parse(readFileSync(join(root, "data/speech-collection-status.json"), "utf8"));
    assert.equal(status.lastSuccessfulCheck, "2026-10-18");
    assert.deepEqual(status.failedIds, ["fixture"]);
    assert.equal(status.succeededCount, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("既存発言が壊れている場合は新規データで上書きしない", () => {
  const { root, result } = fixture(false, true);
  try {
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(join(root, "data/speeches.national.json"), "utf8"), "{broken");
  } finally { rmSync(root, { recursive: true, force: true }); }
});
