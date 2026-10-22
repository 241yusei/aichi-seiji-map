"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { checkNagoyaPostalCode, type NagoyaWard } from "@/lib/area";

const MESSAGES = {
  empty: "郵便番号を入力してください。",
  length: "郵便番号は7桁で入力してください（例：460-0008）。",
  format: "数字7桁、または「460-0008」の形で入力してください。全角数字も使えます。",
  outside: "この郵便番号は名古屋市の区を案内できません。市町村・区の一覧からお選びください。",
};

export function ZipSearch({ onResolved }: { onResolved?: (ward: NagoyaWard) => void }) {
  const fieldId = useId();
  const [zip, setZip] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = checkNagoyaPostalCode(zip);
    if (result.status !== "found") {
      setErr(MESSAGES[result.status]);
      return;
    }
    setErr("");
    onResolved?.(result.ward);
    router.push(`/area/${result.ward.slug}/`);
  }

  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-medium">名古屋市の郵便番号から</label>
      <form onSubmit={onSubmit} noValidate className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          id={fieldId}
          value={zip}
          onChange={(e) => { setZip(e.target.value); setErr(""); }}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="例：460-0008"
          aria-invalid={err ? true : undefined}
          aria-describedby={`${fieldId}-help${err ? ` ${fieldId}-error` : ""}`}
          className="tnum min-w-0 rounded-xl border border-field bg-surface px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button type="submit" className="tap whitespace-nowrap rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-deep">
          区を見る
        </button>
      </form>
      <p id={`${fieldId}-help`} className="mt-2 text-xs leading-relaxed text-muted">7桁を入力すると、上3桁をもとに区をご案内します。</p>
      {err && (
        <p id={`${fieldId}-error`} role="alert" className="mt-2 border-l-2 border-accent pl-3 text-sm text-muted">
          {err}
          <Link href="/area/#region-picker" className="mt-1 inline-flex min-h-11 items-center text-accent underline underline-offset-4">市町村・区から探す →</Link>
        </p>
      )}
    </div>
  );
}
