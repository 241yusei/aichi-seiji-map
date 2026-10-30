import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCompareIndex } from "../lib/compare-index";

const entry = {
  id: "fixture", t: "検証用の架空議員", layer: "テスト用", sub: "架空地域", party: "",
  sp: 0, vy: 0, vn: 0, vo: 0, fund: null, fundYear: null, ec: 0, pos: [], q: "検証用 架空",
};

test("比較データの正常・0件・未収録の数値を読み込む", async (t) => {
  const cases = [
    ["資金未収録・件数0件", [entry]],
    ["比較データ0件", []],
    ["資金0円・年・役職あり", [{ ...entry, fund: 0, fundYear: 2024, pos: ["テスト役職"] }]],
  ] as const;
  for (const [name, entries] of cases) {
    await t.test(name, async (t) => {
      const controller = new AbortController();
      const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json(entries));
      assert.deepEqual(await loadCompareIndex(controller.signal), entries);
      assert.deepEqual(fetchMock.mock.calls[0].arguments, [
        "/compare-index.json", { signal: controller.signal, cache: "no-cache" },
      ]);
    });
  }
});

test("比較データの通信・HTTP・形式不備を0件に変換しない", async (t) => {
  const cases = [
    ["通信失敗", async () => { throw new TypeError("Failed to fetch"); }],
    ["HTTP 503", async () => new Response("[]", { status: 503 })],
    ["JSON解析失敗", async () => new Response("not json")],
    ["配列でない応答", async () => Response.json({ error: "unavailable" })],
    ["nullの項目", async () => Response.json([null])],
    ["検索文字列がない", async () => Response.json([{ ...entry, q: undefined }])],
    ["件数が文字列", async () => Response.json([{ ...entry, sp: "0" }])],
    ["資金が欠落", async () => Response.json([{ ...entry, fund: undefined }])],
    ["資金の年が文字列", async () => Response.json([{ ...entry, fundYear: "2024" }])],
    ["役職がnull", async () => Response.json([{ ...entry, pos: null }])],
    ["役職の項目が文字列以外", async () => Response.json([{ ...entry, pos: [1] }])],
  ] as const;
  for (const [name, response] of cases) {
    await t.test(name, async (t) => {
      t.mock.method(globalThis, "fetch", response);
      await assert.rejects(loadCompareIndex());
    });
  }
});
