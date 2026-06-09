"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resolveZipToWard } from "@/lib/area";

// トップ等の郵便番号入力。クライアントで区を解決し、その地域の固有URL（/area/[ward]）へ直接遷移する。
// 失敗時はインラインエラー（支援技術へ role=alert で通知）。
export function ZipSearch() {
  const [zip, setZip] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const w = resolveZipToWard(zip);
    if (w) {
      setErr("");
      router.push(`/area/${w.slug}/`);
    } else {
      setErr("名古屋市内の郵便番号を入力してください（例: 460-0008）。市外は順次対応します。");
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9-]*"
          placeholder="郵便番号（例: 460-0008）"
          aria-label="郵便番号"
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? "zip-error" : undefined}
          className="tnum grow border border-ink bg-surface px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="tap bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
        >
          地域の代表者を見る
        </button>
      </form>
      {err && (
        <p
          id="zip-error"
          role="alert"
          className="mt-2 border-l-2 border-accent pl-3 text-xs text-muted"
        >
          {err}
        </p>
      )}
    </div>
  );
}
