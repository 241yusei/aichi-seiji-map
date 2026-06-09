"use client";

// URL（/legislators?level=）からの初期化のため、マウント時 effect で state を設定する（意図的）。
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import type { Legislator, Level } from "@/lib/types";
import { LegislatorCard } from "./LegislatorCard";

const LEVELS: { key: Level | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "national", label: "国会（愛知選出）" },
  { key: "prefectural", label: "愛知県議会" },
  { key: "municipal", label: "市町村議会（全54市町村）" },
];

export function LegislatorFilter({ legislators }: { legislators: Legislator[] }) {
  // 初期表示は「国会（愛知選出）」起点。1,244名フラットの壁を避け、まず意味の分かる32名を見せる。
  const [level, setLevel] = useState<Level | "all">("national");
  const [party, setParty] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const lv = new URLSearchParams(window.location.search).get("level");
    if (lv === "national" || lv === "prefectural" || lv === "municipal" || lv === "all")
      setLevel(lv);
  }, []);

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
        if (q && !`${l.name}${l.kana}${l.district}`.includes(q)) return false;
        return true;
      }),
    [legislators, level, party, q],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((lv) => (
          <button
            key={lv.key}
            type="button"
            onClick={() => setLevel(lv.key)}
            className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
              level === lv.key
                ? "border-ink bg-ink text-paper"
                : "border-line bg-surface hover:border-ink"
            }`}
          >
            {lv.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="氏名・地域で検索"
          className="grow border border-line bg-surface px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="氏名・地域で検索"
        />
        <select
          value={party}
          onChange={(e) => setParty(e.target.value)}
          className="border border-line bg-surface px-3 py-2 text-sm focus:border-ink focus:outline-none"
          aria-label="会派・政党で絞り込み"
        >
          <option value="all">会派・政党（すべて）</option>
          {parties.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <p className="eyebrow mt-4 text-faint">
        <span className="tnum text-ink">{filtered.length.toLocaleString()}</span> 名
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">該当する議員がいません。</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <LegislatorCard key={l.id} legislator={l} />
          ))}
        </div>
      )}
    </div>
  );
}
