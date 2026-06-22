"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatYen } from "@/lib/format";

interface CmpEntry {
  id: string;
  t: string;
  layer: string;
  sub: string;
  party: string;
  sp: number;
  vy: number;
  vn: number;
  vo: number;
  fund: number | null;
  fundYear: number | null;
  ec: number;
  pos: string[];
  q: string;
}

export function CompareClient() {
  const [index, setIndex] = useState<CmpEntry[] | null>(null);
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/compare-index.json")
      .then((r) => r.json())
      .then((d: CmpEntry[]) => setIndex(d))
      .catch(() => setIndex([]));
  }, []);

  // 共有URL（?a=&b=）から初期化。SSR後のマウント時に一度だけURLを反映する。
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAId(p.get("a"));
    setBId(p.get("b"));
  }, []);

  // 選択をURLに反映（共有可能に）
  useEffect(() => {
    if (index === null) return;
    const p = new URLSearchParams();
    if (aId) p.set("a", aId);
    if (bId) p.set("b", bId);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [aId, bId, index]);

  const byId = useMemo(() => {
    const m = new Map<string, CmpEntry>();
    for (const e of index ?? []) m.set(e.id, e);
    return m;
  }, [index]);

  const a = aId ? byId.get(aId) : undefined;
  const b = bId ? byId.get(bId) : undefined;

  if (index === null) {
    return <p className="eyebrow text-faint">読み込み中…</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Slot label="A" entry={a} index={index} otherId={bId} onPick={setAId} />
        <Slot label="B" entry={b} index={index} otherId={aId} onPick={setBId} />
      </div>

      {a && b ? (
        <ComparisonTable a={a} b={b} />
      ) : (
        <p className="measure mt-8 text-sm text-muted">
          2人の議員を選ぶと、当選回数・主な役職・発言数・採決・政治資金を並べて比較できます。
          数値はいずれも本サイト収録分です。詳しい内訳と出典は各議員ページでご確認ください。
        </p>
      )}
    </div>
  );
}

function Slot({
  label,
  entry,
  index,
  otherId,
  onPick,
}: {
  label: string;
  entry: CmpEntry | undefined;
  index: CmpEntry[];
  otherId: string | null;
  onPick: (id: string | null) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const qq = query.trim().toLowerCase().normalize("NFKC");
    if (!qq) return [];
    const terms = qq.split(/\s+/);
    return index
      .filter((e) => e.id !== otherId)
      .filter((e) => terms.every((t) => e.q.includes(t)))
      .slice(0, 20);
  }, [query, index, otherId]);

  if (entry) {
    return (
      <div className="border border-ink bg-surface p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-faint">{label}</span>
          <button
            type="button"
            onClick={() => onPick(null)}
            className="text-xs text-muted underline hover:text-accent-deep"
          >
            変更
          </button>
        </div>
        <p className="mt-1 font-display text-xl">{entry.t}</p>
        <p className="mt-1 text-xs text-muted">{entry.layer}</p>
        <p className="text-xs text-faint">{entry.sub}</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-surface p-4">
      <span className="eyebrow text-faint">{label}：議員を選ぶ</span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="氏名・地域・政党で検索"
        aria-label={`${label} の議員を検索`}
        className="mt-2 w-full border border-ink bg-paper px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="mt-2 max-h-64 overflow-auto">
        {results.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              onPick(e.id);
              setQuery("");
            }}
            className="block w-full border-t border-line py-2 text-left transition-colors hover:bg-subtle"
          >
            <span className="font-bold">{e.t}</span>
            <span className="ml-2 text-xs text-muted">{e.layer}</span>
          </button>
        ))}
        {query.trim() !== "" && results.length === 0 && (
          <p className="mt-2 text-sm text-muted">該当なし。</p>
        )}
      </div>
    </div>
  );
}

function ComparisonTable({ a, b }: { a: CmpEntry; b: CmpEntry }) {
  const rows: { label: string; a: React.ReactNode; b: React.ReactNode }[] = [
    { label: "層", a: a.layer, b: b.layer },
    { label: "選挙区・政党", a: a.sub, b: b.sub },
    {
      label: "当選回数",
      a: a.ec > 0 ? `${a.ec}回` : "—",
      b: b.ec > 0 ? `${b.ec}回` : "—",
    },
    {
      label: "主な役職",
      a: a.pos.length ? a.pos.join("・") : "—",
      b: b.pos.length ? b.pos.join("・") : "—",
    },
    { label: "発言数（収録）", a: `${a.sp}件`, b: `${b.sp}件` },
    {
      label: "採決（賛成／反対）",
      a: a.vy + a.vn + a.vo > 0 ? `賛成${a.vy}・反対${a.vn}` : "記録なし",
      b: b.vy + b.vn + b.vo > 0 ? `賛成${b.vy}・反対${b.vn}` : "記録なし",
    },
    {
      label: "政治資金 収入",
      a: a.fund != null ? `${formatYen(a.fund)}（${a.fundYear}年）` : "—",
      b: b.fund != null ? `${formatYen(b.fund)}（${b.fundYear}年）` : "—",
    },
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-[7rem_1fr_1fr] gap-x-3 rule-thick pb-2">
        <span className="eyebrow text-faint">項目</span>
        <Link href={`/legislators/${a.id}/`} className="link-ink font-bold">
          {a.t}
        </Link>
        <Link href={`/legislators/${b.id}/`} className="link-ink font-bold">
          {b.t}
        </Link>
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid grid-cols-[7rem_1fr_1fr] gap-x-3 border-t border-line py-3 text-sm last:border-b"
        >
          <span className="text-xs text-muted">{r.label}</span>
          <span className="tnum">{r.a}</span>
          <span className="tnum">{r.b}</span>
        </div>
      ))}
      <p className="chart-note mt-3">
        数値は本サイト収録分です（発言は収録した会議録、採決は記名投票など）。
        多い／少ないは活動量の優劣を示すものではありません。内訳と出典は各議員ページでご確認ください。
      </p>
    </div>
  );
}
