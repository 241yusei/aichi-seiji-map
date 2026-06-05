"use client";

// URL（/area/?zip=）からの初期化のため、マウント時 effect で state を設定する（意図的）。
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAGOYA_WARDS, resolveZipToWard, type LegBrief, type WardData } from "@/lib/area";

function Group({ title, items }: { title: string; items: LegBrief[] }) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="eyebrow text-faint">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted">該当なし（欠員など）</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((l) => (
            <li key={l.id} className="text-sm">
              <Link href={`/legislators/${l.id}/`} className="link-ink font-medium">
                {l.name}
              </Link>
              <span className="ml-1 text-xs text-faint">
                {l.district}
                {l.party ? `・${l.party}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AreaExplorer({ wardData }: { wardData: WardData[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [zip, setZip] = useState("");
  const [zipMsg, setZipMsg] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("zip");
    if (q) {
      const w = resolveZipToWard(q);
      if (w) {
        setSelected(w.ward);
        setZip(q);
      } else {
        setZipMsg("名古屋市内の郵便番号を入力してください。市外は順次対応します。");
      }
    }
  }, []);

  const data = wardData.find((w) => w.ward === selected) ?? null;

  function onZip(e: React.FormEvent) {
    e.preventDefault();
    const w = resolveZipToWard(zip);
    if (w) {
      setSelected(w.ward);
      setZipMsg("");
    } else {
      setZipMsg("名古屋市内の郵便番号を入力してください（例: 460-0008）。市外は順次対応します。");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onZip} className="flex flex-wrap gap-2">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          inputMode="numeric"
          placeholder="郵便番号（例: 460-0008）"
          aria-label="郵便番号"
          className="tnum grow border border-ink bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
        >
          調べる
        </button>
      </form>
      {zipMsg && <p className="text-xs text-muted">{zipMsg}</p>}

      <div>
        <p className="eyebrow mb-2 text-ink">名古屋市の区から選ぶ</p>
        <div className="flex flex-wrap gap-2">
          {NAGOYA_WARDS.map((w) => (
            <button
              key={w.ward}
              type="button"
              onClick={() => setSelected(w.ward)}
              className={`border px-3 py-1.5 text-sm font-medium transition-colors ${
                selected === w.ward
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-surface hover:border-ink"
              }`}
            >
              {w.ward}
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <section className="border-t-2 border-ink pt-5">
          <h2 className="font-display text-2xl">名古屋市{data.ward} の代表者</h2>
          <p className="mt-1 text-xs text-faint">
            あなたの地域を代表する、国・県・市の議員です。各氏名から詳細（発言・出典など）に進めます。
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Group title="衆議院（小選挙区）" items={data.shugiin} />
            <Group title="参議院（愛知県選挙区）" items={data.sangiin} />
            <Group title="愛知県議会" items={data.kengikai} />
            <Group title="名古屋市会" items={data.shikai} />
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted">郵便番号を入力するか、区を選んでください。</p>
      )}
    </div>
  );
}
