import Link from "next/link";
import { NAGOYA_WARDS } from "@/lib/area";
import { RegionPicker } from "./RegionPicker";

export function AreaExplorer() {
  return (
    <div className="space-y-10 sm:space-y-14">
      <section className="rounded-2xl bg-calm p-5 sm:p-8" aria-labelledby="area-picker-heading">
        <h2 id="area-picker-heading" className="mb-4 text-xl font-medium">愛知54市町村から探す</h2>
        <RegionPicker />
        <p className="mt-3 text-xs leading-relaxed text-muted">名古屋市は国・県・市の代表者へ。ほかの市町村は首長・議員一覧へ進みます。</p>
      </section>
      <section aria-labelledby="wards-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 id="wards-heading" className="text-2xl font-medium">名古屋市の区から選ぶ</h2>
          <span className="text-sm text-muted">郵便番号がわからなくても大丈夫。</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {NAGOYA_WARDS.map((ward) => (
            <Link key={ward.slug} href={`/area/${ward.slug}/`} data-usage-event="region_selected" className="group flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-line bg-paper px-4 py-4 text-base font-medium transition-colors hover:border-accent hover:bg-subtle sm:px-6">
              {ward.ward}<span aria-hidden="true" className="text-accent">→</span>
            </Link>
          ))}
        </div>
      </section>
      <p className="text-sm text-muted"><Link href="/municipalities/" className="link-ink inline-flex min-h-11 items-center">地図・地域別の市町村一覧から探す →</Link></p>
    </div>
  );
}
