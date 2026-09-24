"use client";

// URL（/legislators?level=）からの初期化のため、マウント時 effect で state を設定する（意図的）。
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import type { LegislatorListItem, Level } from "@/lib/types";
import { LegislatorCard } from "./LegislatorCard";

const LEVELS: { key: Level | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "national", label: "国会（愛知選出）" },
  { key: "prefectural", label: "愛知県議会" },
  { key: "municipal", label: "市町村議会（全54市町村）" },
];

const CHUNK = 50;
const normalizeSearch = (value: string) => value.normalize("NFKC").replace(/\s/g, "");

// 所属や掲載データ量に左右されない、明示した一定の順序で表示する。
function compareNames(a: LegislatorListItem, b: LegislatorListItem) {
  return (
    normalizeSearch(a.kana || a.name).localeCompare(normalizeSearch(b.kana || b.name), "ja") ||
    a.name.localeCompare(b.name, "ja") ||
    a.id.localeCompare(b.id, "en")
  );
}

export function LegislatorFilter({ legislators }: { legislators: LegislatorListItem[] }) {
  // 初期表示は「国会（愛知選出）」起点。URLで指定された議会があればそちらを優先する。
  const [level, setLevel] = useState<Level | "all">("national");
  const [party, setParty] = useState("all");
  const [q, setQ] = useState("");
  // 全件マウントを避ける段階描画（静的export互換）。フィルタ変更でリセット。
  const [shown, setShown] = useState(CHUNK);

  useEffect(() => {
    const lv = new URLSearchParams(window.location.search).get("level");
    if (lv === "national" || lv === "prefectural" || lv === "municipal" || lv === "all")
      setLevel(lv);
  }, []);

  function applyLevel(lv: Level | "all") {
    setLevel(lv);
    setShown(CHUNK);
  }
  function applyParty(p: string) {
    setParty(p);
    setShown(CHUNK);
  }
  function applyQuery(v: string) {
    setQ(v);
    setShown(CHUNK);
  }
  function clearFilters() {
    setLevel("all");
    setParty("all");
    setQ("");
    setShown(CHUNK);
  }

  const parties = useMemo(
    () =>
      Array.from(new Set(legislators.map((l) => l.party).filter((p): p is string => Boolean(p)))).sort(
        (a, b) => a.localeCompare(b, "ja"),
      ),
    [legislators],
  );

  const filtered = useMemo(
    () =>
      legislators.filter((l) => {
        if (level !== "all" && l.level !== level) return false;
        if (party !== "all" && l.party !== party) return false;
        if (q && !normalizeSearch(`${l.name}${l.kana}${l.district}`).includes(normalizeSearch(q))) return false;
        return true;
      }).sort(compareNames),
    [legislators, level, party, q],
  );

  const visible = filtered.slice(0, shown);
  const rest = filtered.length - visible.length;

  return (
    <div>
      <div className="rounded-2xl bg-subtle/60 p-4 sm:p-6">
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-ink">議会を選ぶ</legend>
          <div className="flex flex-wrap gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv.key}
              type="button"
              onClick={() => applyLevel(lv.key)}
              aria-pressed={level === lv.key}
              className={`tap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                level === lv.key
                  ? "border-ink bg-ink text-paper"
                  : "border-transparent bg-surface hover:border-ink"
              }`}
            >
              {lv.label}
            </button>
          ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <label className="min-w-0 text-sm font-medium">
            氏名・地域
            <input
              type="search"
              value={q}
              onChange={(e) => applyQuery(e.target.value)}
              placeholder="例：氏名、愛知1区、名古屋市"
              className="tap mt-2 block w-full min-w-0 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-normal placeholder:text-faint focus:border-ink"
            />
          </label>
          <label className="min-w-0 text-sm font-medium">
            会派・政党
            <select
              value={party}
              onChange={(e) => applyParty(e.target.value)}
              className="tap mt-2 block w-full min-w-0 rounded-2xl border border-line bg-surface px-4 py-3 text-base font-normal focus:border-ink"
            >
              <option value="all">すべての会派・政党</option>
              {parties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="my-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted" role="status" aria-live="polite" aria-atomic="true">
          <span className="tnum mr-1 text-2xl font-medium text-ink">{filtered.length.toLocaleString()}</span>名の議員
          <span className="ml-3 text-xs">{visible.length.toLocaleString()}名を表示中</span>
        </p>
        <p className="max-w-lg text-xs leading-relaxed text-faint">
          五十音順（ふりがな未登録の場合は氏名順）。全員を同じ項目・デザインで掲載しています。
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line p-8 text-center sm:p-12">
          <p className="font-display text-xl">条件に合う議員が見つかりませんでした</p>
          <p className="mt-3 text-sm text-muted">氏名や地域の一部で検索するか、絞り込み条件を変更してください。</p>
          <button type="button" onClick={clearFilters} className="tap mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-medium text-paper">
            すべての条件を解除する
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (
              <LegislatorCard key={l.id} legislator={l} />
            ))}
          </div>
          {rest > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + CHUNK * 2)}
              className="tap mt-8 w-full rounded-2xl border border-line bg-surface px-4 py-4 text-sm font-medium transition-colors hover:border-ink hover:bg-subtle"
            >
              さらに表示（残り{rest.toLocaleString()}名）
            </button>
          )}
        </>
      )}
    </div>
  );
}
