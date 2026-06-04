"use client";

// URL（/area/?zip=）からの初期化のため、マウント時 effect で state を設定する（意図的）。
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAGOYA_WARDS, resolveZipToWard, type LegBrief, type WardData } from "@/lib/area";

function Group({ title, items }: { title: string; items: LegBrief[] }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <h3 className="text-sm font-bold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-xs text-muted">該当なし（欠員など）</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.map((l) => (
            <li key={l.id} className="text-sm">
              <Link href={`/legislators/${l.id}/`} className="font-medium text-accent hover:underline">
                {l.name}
              </Link>
              <span className="ml-1 text-xs text-muted">
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

  // 郵便番号付きで遷移してきた場合（/area/?zip=...）に解決する。
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
          className="grow rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          調べる
        </button>
      </form>
      {zipMsg && <p className="text-xs text-muted">{zipMsg}</p>}

      <div>
        <p className="mb-2 text-sm font-medium">名古屋市の区から選ぶ</p>
        <div className="flex flex-wrap gap-2">
          {NAGOYA_WARDS.map((w) => (
            <button
              key={w.ward}
              type="button"
              onClick={() => setSelected(w.ward)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                selected === w.ward
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface hover:border-accent"
              }`}
            >
              {w.ward}
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <section className="rounded-xl border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">名古屋市{data.ward} の代表者</h2>
          <p className="mt-1 text-xs text-muted">
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
