import Link from "next/link";
import type { LegislatorListItem } from "@/lib/types";

/** 絞り込みの操作やJavaScriptに依存せず、収録県議の個人ページへ進める一覧。 */
export function PrefecturalDirectory({ legislators }: { legislators: readonly LegislatorListItem[] }) {
  const prefectural = legislators.filter((legislator) => legislator.level === "prefectural");
  if (prefectural.length === 0) return null;

  const groups = new Map<string, LegislatorListItem[]>();
  for (const legislator of prefectural) {
    const members = groups.get(legislator.district) ?? [];
    members.push(legislator);
    groups.set(legislator.district, members);
  }
  const districts = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "ja"));

  return (
    <details id="prefectural-directory" className="mt-6 rounded-2xl border border-line bg-surface p-4 sm:p-6">
      <summary className="min-h-11 cursor-pointer py-2 marker:text-accent-deep">
        <h2 className="font-display inline text-xl">
          愛知県議会の議員を選挙区から探す
          <span className="ml-2 inline-block font-sans text-sm text-muted">本サイト収録{prefectural.length}名</span>
        </h2>
      </summary>
      <p className="measure mt-3 text-sm leading-relaxed text-muted">
        名前を選ぶと、名簿・所属・役職の確認状況と公式会議録への入口を確認できます。
        選挙区ごとに、議員名はふりがな順で掲載しています。
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {districts.map(([district, members]) => (
          <section key={district} className="min-w-0 border-t border-line pt-3">
            <h3 className="text-sm font-medium">{district}</h3>
            <ul className="mt-1">
              {[...members].sort((a, b) =>
                (a.kana || a.name).localeCompare(b.kana || b.name, "ja") ||
                a.name.localeCompare(b.name, "ja") || a.id.localeCompare(b.id, "en"),
              ).map((legislator) => (
                <li key={legislator.id}>
                  <Link href={`/legislators/${legislator.id}/`} className="link-ink inline-flex min-h-11 items-center py-2 text-sm">
                    {legislator.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}
