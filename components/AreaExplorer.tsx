"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAGOYA_WARDS, resolveZipToWard } from "@/lib/area";

// 郵便番号／区を選ぶと、その地域の固定URL（/area/[slug]）へ遷移する“選ぶだけ”のUI。
// 結果（ダッシュボード）は静的ページ側で描画するため、共有可能な固有URLになる。
export function AreaExplorer() {
  const router = useRouter();
  const [zip, setZip] = useState("");
  const [zipMsg, setZipMsg] = useState("");

  function onZip(e: React.FormEvent) {
    e.preventDefault();
    const w = resolveZipToWard(zip);
    if (w) {
      router.push(`/area/${w.slug}/`);
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
          autoComplete="postal-code"
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
            <Link
              key={w.slug}
              href={`/area/${w.slug}/`}
              className="border border-line bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
            >
              {w.ward}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-faint">
        ※ 現在は名古屋市内に対応。対象範囲は順次拡大します。
      </p>
    </div>
  );
}
