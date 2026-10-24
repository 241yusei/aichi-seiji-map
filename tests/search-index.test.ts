import assert from "node:assert/strict";
import { test } from "node:test";
import { loadSearchIndex } from "../lib/search-index";

const entry = { t: "検索用の架空議員", s: "テスト用", u: "/legislators/test/", k: "議員", q: "架空 テスト" };

test("正常な検索データと空の検索データを区別して読み込む", async (t) => {
  for (const entries of [[entry], []]) {
    await t.test(`${entries.length}件`, async (t) => {
      const controller = new AbortController();
      const fetchMock = t.mock.method(globalThis, "fetch", async () => Response.json(entries));
      assert.deepEqual(await loadSearchIndex(controller.signal), entries);
      assert.deepEqual(fetchMock.mock.calls[0].arguments, [
        "/search-index.json", { signal: controller.signal, cache: "no-cache" },
      ]);
    });
  }
});

test("通信・HTTP・JSONのエラーは検索結果0件に変換しない", async (t) => {
  const cases = [
    ["通信失敗", async () => { throw new TypeError("Failed to fetch"); }],
    ["HTTP 503", async () => new Response("[]", { status: 503 })],
    ["JSON解析失敗", async () => new Response("not json")],
    ["配列でない応答", async () => Response.json({ error: "unavailable" })],
    ["nullの項目", async () => Response.json([null])],
    ["検索文字列がない項目", async () => Response.json([{ ...entry, q: undefined }])],
    ["見出しの型が異なる項目", async () => Response.json([{ ...entry, t: 42 }])],
  ] as const;
  for (const [name, response] of cases) {
    await t.test(name, async (t) => {
      t.mock.method(globalThis, "fetch", response);
      await assert.rejects(loadSearchIndex());
    });
  }
});
