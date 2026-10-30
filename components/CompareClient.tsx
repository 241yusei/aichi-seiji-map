"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatYen } from "@/lib/format";
import { loadCompareIndex, type CompareEntry } from "@/lib/compare-index";
import { compareSelectionUrl, readCompareSelection, type CompareSelection } from "@/lib/compare-selection";
import { CompareSkeleton } from "./IndexSkeleton";

type LoadState =
  | { status: "loading" | "error" }
  | { status: "ready"; entries: CompareEntry[] };

export function CompareClient() {
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selection, setSelection] = useState<CompareSelection>({ aId: null, bId: null });
  const { aId, bId } = selection;
  const contentRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const retryPending = useRef(false);
  const index = load.status === "ready" ? load.entries : null;

  useEffect(() => {
    const controller = new AbortController();
    loadCompareIndex(controller.signal)
      .then((entries) => {
        if (!controller.signal.aborted) setLoad({ status: "ready", entries });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoad({ status: "error" });
      });
    return () => controller.abort();
  }, [attempt]);

  // 共有URLと戻る/進むを反映する。履歴を読む処理からURLを書き戻さない。
  useEffect(() => {
    const syncSelection = () => setSelection(readCompareSelection(window.location.search));
    syncSelection();
    window.addEventListener("popstate", syncSelection);
    return () => window.removeEventListener("popstate", syncSelection);
  }, []);

  // 再試行した人だけ、消えたボタンから適切な操作先へ戻す。
  // 読み込み中に別の場所へ移動した場合や通常の初回読込ではフォーカスを奪わない。
  useEffect(() => {
    if (load.status === "loading" || !retryPending.current) return;
    retryPending.current = false;
    if (document.activeElement !== document.body && document.activeElement !== statusRef.current) return;
    const target = load.status === "error"
      ? retryButtonRef.current
      : contentRef.current?.querySelector<HTMLElement>("input, button, a");
    target?.focus({ preventScroll: true });
  }, [load.status]);

  function pick(slot: "aId" | "bId", id: string | null) {
    const next = { ...selection, [slot]: id };
    setSelection(next);
    // 選択は履歴を増やさず共有URLへ反映。他のクエリ・hash・履歴の情報は保持。
    window.history.replaceState(window.history.state, "", compareSelectionUrl(window.location.href, next));
  }

  function retry() {
    if (load.status !== "error" || retryPending.current) return;
    retryPending.current = true;
    statusRef.current?.focus({ preventScroll: true });
    setLoad({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  const byId = useMemo(() => {
    const m = new Map<string, CompareEntry>();
    for (const e of index ?? []) m.set(e.id, e);
    return m;
  }, [index]);

  const a = aId ? byId.get(aId) : undefined;
  const b = bId ? byId.get(bId) : undefined;

  return (
    <div>
      <p ref={statusRef} tabIndex={-1} role="status" className="sr-only">
        {load.status === "loading" ? "比較データを読み込み中…" : load.status === "ready" ? "比較データを読み込みました。" : ""}
      </p>
      <div ref={contentRef} aria-busy={load.status === "loading"}>
        {load.status === "loading" ? <CompareSkeleton withTable={Boolean(aId && bId)} /> : load.status === "error" ? (
          <div className="ui-reveal border-l-2 border-accent bg-subtle p-4">
            <p role="alert" className="text-sm text-ink">
              比較データを読み込めませんでした。通信状況を確認して、もう一度お試しください。
            </p>
            <button
              type="button"
              ref={retryButtonRef}
              onClick={retry}
              className="mt-3 min-h-11 border border-ink px-4 py-2 text-sm font-bold hover:bg-surface"
            >
              もう一度読み込む
            </button>
            <p className="mt-3 text-sm text-muted">
              <Link href="/legislators/" className="link-ink">議員一覧から探す →</Link>
            </p>
          </div>
        ) : index?.length === 0 ? (
          <p role="status" className="ui-reveal measure text-sm text-muted">
            比較できる議員データは0件です。
            <Link href="/legislators/" className="link-ink">議員一覧からお探しください。</Link>
          </p>
        ) : index ? (
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Slot label="A" selectedId={aId} entry={a} index={index} otherId={bId} onPick={(id) => pick("aId", id)} />
              <Slot label="B" selectedId={bId} entry={b} index={index} otherId={aId} onPick={(id) => pick("bId", id)} />
            </div>

            {a && b ? (
              <ComparisonTable key={`${a.id}:${b.id}`} a={a} b={b} />
            ) : (
              <p className="measure mt-8 text-sm text-muted">
                2人の議員を選ぶと、当選回数・主な役職・発言数・採決・政治資金を並べて比較できます。
                数値はいずれも本サイト収録分です。詳しい内訳と出典は各議員ページでご確認ください。
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Slot({
  label,
  selectedId,
  entry,
  index,
  otherId,
  onPick,
}: {
  label: string;
  selectedId: string | null;
  entry: CompareEntry | undefined;
  index: CompareEntry[];
  otherId: string | null;
  onPick: (id: string | null) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const focusAfterPick = useRef(false);

  useEffect(() => {
    if (!focusAfterPick.current) return;
    focusAfterPick.current = false;
    (entry ? changeRef.current : inputRef.current)?.focus({ preventScroll: true });
  }, [entry]);

  function choose(id: string | null) {
    focusAfterPick.current = true;
    onPick(id);
    setQuery("");
  }

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
      <div key={entry.id} className="ui-reveal min-h-40 border border-ink bg-surface p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow text-faint">{label}</span>
          <button
            type="button"
            ref={changeRef}
            onClick={() => choose(null)}
            aria-label={`${label}の議員を変更`}
            className="min-h-11 min-w-11 text-xs text-muted underline hover:text-accent-deep"
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
    <div key="choose" className="ui-reveal min-h-40 border border-line bg-surface p-4">
      <span className="eyebrow text-faint">{label}：議員を選ぶ</span>
      {selectedId && (
        <p role="status" className="mt-2 text-sm text-muted">
          共有URLで指定された議員は、現在の収録データに見つかりません。別の議員を選んでください。
        </p>
      )}
      <input
        ref={inputRef}
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
            onClick={() => choose(e.id)}
            className="block min-h-11 w-full border-t border-line py-2 text-left transition-colors hover:bg-subtle"
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

function ComparisonTable({ a, b }: { a: CompareEntry; b: CompareEntry }) {
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
    <div className="ui-reveal mt-8">
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
