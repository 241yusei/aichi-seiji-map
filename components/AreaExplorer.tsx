"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NAGOYA_WARDS, resolveZipToWard } from "@/lib/area";

// 結果は地域ごとの静的ページへ遷移し、そのまま共有できるURLにする。
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
      setZipMsg("対応する区が見つかりませんでした。名古屋市内の郵便番号を入力するか、下の区一覧からお選びください。名古屋市以外の方は、下の「愛知県の市町村から探す」をご利用ください。");
    }
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="rounded-2xl bg-subtle px-5 py-7 sm:p-10" aria-labelledby="zip-heading">
        <div className="grid gap-7 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-sm font-medium text-accent">郵便番号で、かんたんに</p>
            <h2 id="zip-heading" className="mt-3 text-2xl font-medium sm:text-3xl">地域から探す</h2>
            <p id="zip-help" className="mt-4 text-sm leading-relaxed text-muted">
              名古屋市内の郵便番号に対応しています。<br />上3桁をもとに、お住まいの区をご案内します。
            </p>
          </div>
          <form onSubmit={onZip}>
            <label htmlFor="area-postal-code" className="mb-2 block text-sm font-medium">郵便番号</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="area-postal-code"
                value={zip}
                onChange={(e) => { setZip(e.target.value); setZipMsg(""); }}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="例：460-0008"
                aria-describedby={zipMsg ? "zip-help zip-feedback" : "zip-help"}
                aria-invalid={Boolean(zipMsg)}
                className="tnum min-h-14 w-full min-w-0 flex-1 rounded-2xl border border-line bg-paper px-5 py-3 text-lg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="min-h-14 shrink-0 rounded-xl bg-accent px-6 py-3 text-base font-medium text-white transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                代表者を見る <span aria-hidden="true">→</span>
              </button>
            </div>
            <p id="zip-feedback" aria-live="polite" className="mt-3 text-sm text-accent-deep">{zipMsg}</p>
          </form>
        </div>
      </section>

      <section aria-labelledby="wards-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 id="wards-heading" className="text-2xl font-medium sm:text-3xl">名古屋市の区から選ぶ</h2>
          <span className="text-sm text-muted">郵便番号がわからなくても大丈夫。</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NAGOYA_WARDS.map((w) => (
            <Link
              key={w.slug}
              href={`/area/${w.slug}/`}
              className="group flex min-h-20 items-center justify-between gap-2 rounded-2xl border border-line bg-paper px-4 py-5 text-base font-medium transition-colors hover:border-accent hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-6 sm:text-lg"
            >
              {w.ward}
              <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </section>

      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        この地域検索は名古屋市内に対応しています。名古屋市以外にお住まいの方は、
        <Link href="/municipalities/" className="mx-1 text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          愛知県の市町村から探す
        </Link>
        （54市町村の首長・議会）か、
        <Link href="/legislators/" className="ml-1 text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
          議員一覧
        </Link>
        をご利用ください。
      </p>
    </div>
  );
}
