"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// トップの郵便番号入力。/area/?zip= へ送り、地域の代表者を表示する。
export function ZipSearch() {
  const [zip, setZip] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const digits = zip.replace(/[^0-9]/g, "");
    router.push(`/area/?zip=${encodeURIComponent(digits)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
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
        地域の代表者を見る
      </button>
    </form>
  );
}
