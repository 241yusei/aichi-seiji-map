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
  { key: "municipal", label: "市議会（名古屋・豊田）" },
];

export function LegislatorFilter({ legislators }: { legislators: Legislator[] }) {
  const [level, setLevel] = useState<Level | "all">("all");
  const [party, setParty] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const lv = new URLSearchParams(window.location.search).get("level");
    if (lv === "national" || lv === "prefectural" || lv === "municipal") setLevel(lv);
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
            className={`rounded-full border px-3 py-1 text-sm transition ${
              level === lv.key
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface hover:border-accent"
            }`}
          >
            {lv.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="氏名・地域で検索"
          className="grow rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
          aria-label="氏名・地域で検索"
        />
        <select
          value={party}
          onChange={(e) => setParty(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
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

      <p className="mt-3 text-xs text-muted">{filtered.length} 名</p>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">該当する議員がいません。</p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {filtered.map((l) => (
            <LegislatorCard key={l.id} legislator={l} />
          ))}
        </div>
      )}
    </div>
  );
}
