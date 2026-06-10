import type { Metadata } from "next";
import Link from "next/link";
import { getExecutives, getLegislators } from "@/lib/data";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { REGIONS } from "@/lib/regions";
import { AichiMap } from "@/components/AichiMap";

export const metadata: Metadata = {
  title: "市町村から探す（地域別）",
  description:
    "愛知の全54市町村を地域（名古屋・尾張・知多・西三河・東三河）別に。各市町村の議会・議員・首長・会議録に一次ソース付きでたどれます。",
};

export default function MunicipalitiesPage() {
  const legislators = getLegislators();
  const memberCount = new Map<string, number>();
  for (const l of legislators) {
    if (l.level === "municipal" && l.govCode) {
      memberCount.set(l.govCode, (memberCount.get(l.govCode) ?? 0) + 1);
    }
  }
  const execName = new Map<string, string>();
  for (const e of getExecutives()) execName.set(e.govCode, e.name);

  const bySlug = new Map(MUNICIPALITIES.map((m) => [m.govCode, m]));

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Municipalities</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          市町村から探す
        </h1>
        <p className="measure mt-3 text-muted">
          愛知の全54市町村を地域別に。各市町村の議会・議員・首長・会議録へ、一次ソース付きでたどれます。
        </p>
      </header>

      <section>
        <h2 className="eyebrow text-faint">地図から探す</h2>
        <div className="mt-3 max-w-3xl">
          <AichiMap />
        </div>
      </section>

      {REGIONS.map((region) => {
        const munis = region.govCodes
          .map((g) => bySlug.get(g))
          .filter((m): m is NonNullable<typeof m> => Boolean(m));
        return (
          <section key={region.name}>
            <div className="flex items-baseline gap-3 border-b border-line pb-2">
              <h2 className="font-display text-xl">{region.name}</h2>
              <span className="eyebrow text-faint">
                {region.note}・{munis.length}市町村
              </span>
            </div>
            <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {munis.map((m) => (
                <Link
                  key={m.govCode}
                  href={`/municipalities/${m.slug}/`}
                  className="group flex flex-col bg-surface px-4 py-3 transition-colors hover:bg-subtle"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-lg">{m.city}</span>
                    <span aria-hidden className="text-faint transition-colors group-hover:text-accent">
                      →
                    </span>
                  </span>
                  <span className="mt-1 text-xs text-muted">
                    議員{memberCount.get(m.govCode) ?? 0}名
                    {execName.get(m.govCode) ? ` ／ ${execName.get(m.govCode)}` : ""}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
