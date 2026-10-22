// 外部API・本番データへの書き込みなし。地域定義は読取のみ、保存は使い捨てMapで検証する。
import assert from "node:assert/strict";
import test from "node:test";
import { checkNagoyaPostalCode, NAGOYA_WARDS, resolveZipToWard } from "../lib/area";
import { MUNICIPALITIES } from "../lib/municipalities";
import { forgetRegion, readSavedRegion, REGION_STORAGE_KEY, resolveRegionTarget, saveRegion } from "../lib/region-preference";

test("7桁・全角・一般的なハイフンで名古屋の区を案内する", () => {
  for (const input of ["4600008", "460-0008", "４６０－０００８", "４６０ー０００８", " 460−0008 "]) {
    assert.equal(resolveZipToWard(input)?.slug, "naka", input);
  }
  for (const ward of NAGOYA_WARDS) {
    assert.equal(resolveZipToWard(`${ward.zip3[0]}0000`)?.slug, ward.slug);
  }
});

test("不完全・形式不正・対象外の郵便番号を区別し、3桁だけで代表者を断定しない", () => {
  for (const input of ["460", "460-000", "46000088"]) assert.equal(checkNagoyaPostalCode(input).status, "length", input);
  for (const input of ["abc4600008", "460--0008", "46-00008", "460 0008"]) assert.equal(checkNagoyaPostalCode(input).status, "format", input);
  assert.equal(checkNagoyaPostalCode("").status, "empty");
  assert.equal(checkNagoyaPostalCode("100-0001").status, "outside");
  assert.equal(resolveZipToWard("460"), null);
});

test("既存54市町村の入口だけを使い、名古屋は必ず区のページへ進む", () => {
  assert.equal(MUNICIPALITIES.length, 54);
  assert.equal(resolveRegionTarget("ward:naka")?.href, "/area/naka/");
  assert.equal(resolveRegionTarget("municipality:toyota")?.href, "/municipalities/toyota/");
  for (const city of MUNICIPALITIES.filter((m) => m.slug !== "nagoya")) assert.equal(resolveRegionTarget(`municipality:${city.slug}`)?.label, city.city);
  for (const value of ["municipality:nagoya", "ward:unknown", "https://example.com", "../../outside", ""]) assert.equal(resolveRegionTarget(value), null, value);
});

test("地域の明示保存と解除。郵便番号や任意URLは保存できない", () => {
  const fixture = new Map<string, string>();
  const storage = { getItem: (key: string) => fixture.get(key) ?? null, setItem: (key: string, value: string) => { fixture.set(key, value); }, removeItem: (key: string) => { fixture.delete(key); } };
  assert.equal(readSavedRegion(storage), null);
  assert.equal(saveRegion(storage, "ward:naka"), true);
  assert.deepEqual([...fixture], [[REGION_STORAGE_KEY, "ward:naka"]]);
  assert.equal(readSavedRegion(storage)?.label, "名古屋市中区");
  assert.equal(saveRegion(storage, "4600008"), false);
  assert.equal(saveRegion(storage, "https://example.com"), false);
  assert.equal(forgetRegion(storage), true);
  assert.equal(readSavedRegion(storage), null);
  storage.setItem(REGION_STORAGE_KEY, "bad-data");
  assert.equal(readSavedRegion(storage), null);
});

test("保存機能が禁止されても例外を外に出さない", () => {
  const blocked = () => { throw new Error("storage blocked"); };
  const storage = { getItem: blocked, setItem: blocked, removeItem: blocked };
  assert.equal(readSavedRegion(storage), null);
  assert.equal(saveRegion(storage, "ward:naka"), false);
  assert.equal(forgetRegion(storage), false);
});
