"use client";

// URL（/legislators?level=）からの初期化のため、マウント時 effect で state を設定する（意図的）。
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Legislator, Level } from "@/lib/types";
import { Monogram } from "./Monogram";

const LEVELS: { key: Level | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "national", label: "国会（愛知選出）" },
  { key: "prefectural", label: "愛知県議会" },
  { key: "municipal", label: "市町村議会（全54市町村）" },
];

const CHUNK = 50;

export function LegislatorFilter({ legislators }: { legislators: Legislator[] }) {
  // 初期表示は「国会（愛知選出）」起点。1,244名フラットの壁を避け、まず意味の分かる32名を見せる。
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

  const visible = filtered.slice(0, shown);
  const rest = filtered.length - visible.length;

  return (
    <div>
      {/* 絞り込みは sticky（深いスクロールからも戻れる）。 */}
      <div className="sticky top-0 z-20 -mx-1 bg-paper px-1 pb-3 pt-2">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv.key}
              type="button"
              onClick={() => applyLevel(lv.key)}
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
            onChange={(e) => applyQuery(e.target.value)}
            placeholder="氏名・地域で検索"
            className="grow border border-line bg-surface px-3 py-2 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="氏名・地域で検索"
          />
          <select
            value={party}
            onChange={(e) => applyParty(e.target.value)}
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

        <p className="eyebrow mt-3 text-faint" role="status" aria-live="polite">
          <span className="tnum text-ink">{filtered.length.toLocaleString()}</span> 名
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">該当する議員がいません。</p>
      ) : (
        <>
          {/* 台帳＝罫線リスト行（データ層・角丸ゼロ）。1,244名のスケールが厚みとして見える。 */}
          <div className="border-y border-line">
            {visible.map((l) => (
              <Link
                key={l.id}
                href={`/legislators/${l.id}/`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-line py-2.5 transition-colors last:border-b-0 hover:bg-subtle"
              >
                <Monogram name={l.name} level={l.level} size="sm" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-base leading-tight">{l.name}</span>
                    {l.kana && <span className="text-xs text-faint">{l.kana}</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {l.district}
                    {l.party ? `・${l.party}` : ""}
                  </span>
                </span>
                <span aria-hidden className="pr-1 text-faint transition-colors group-hover:text-accent">
                  →
                </span>
              </Link>
            ))}
          </div>
          {rest > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + CHUNK * 2)}
              className="tap mt-4 w-full rounded-[10px] border border-ink py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
            >
              さらに表示（残り{rest.toLocaleString()}名）
            </button>
          )}
        </>
      )}
    </div>
  );
}
