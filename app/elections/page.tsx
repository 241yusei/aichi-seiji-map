import type { Metadata } from "next";
import Link from "next/link";
import { getExecutives } from "@/lib/data";
import { municipalityByGov } from "@/lib/municipalities";
import { SourceLink } from "@/components/SourceLink";
import { formatDate } from "@/lib/format";
import { LAST_UPDATED } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "選挙カレンダー｜愛知の次の選挙はいつ",
  description:
    "愛知県知事・県内市町村長の任期満了日から「次の選挙はいつごろか」を一覧に。あなたの街の次の首長選の目安を、各自治体公式の一次ソース付きで。中立・投票誘導なし。",
  alternates: { canonical: "/elections/" },
};

// 任期満了日は「次の選挙の時期の目安」。基準日（今日相当）はビルド時の最終更新日とする。
const TODAY = LAST_UPDATED;

export default function ElectionsPage() {
  const execs = getExecutives()
    .filter((e) => e.termEnd)
    .sort((a, b) => (a.termEnd! < b.termEnd! ? -1 : 1));

  const upcoming = execs.filter((e) => e.termEnd! >= TODAY);
  const past = execs.filter((e) => e.termEnd! < TODAY);

  // 年ごとにグループ化（今後分）。
  const byYear = new Map<string, typeof upcoming>();
  for (const e of upcoming) {
    const y = e.termEnd!.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(e);
  }

  return (
    <div className="space-y-10">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Elections</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          選挙カレンダー
        </h1>
        <p className="measure mt-3 text-muted">
          愛知県知事と県内市町村長の「任期満了日」から、次の選挙の時期の目安を時系列でまとめました。
          任期満了日はあくまで目安で、実際の投票日は各自治体・選挙管理委員会が告示します。中立・投票誘導はしません。
        </p>
      </header>

      {/* 統一地方選・知事選の注記（既知の大きな節目） */}
      <section className="bg-calm p-5">
        <h2 className="eyebrow text-accent-deep">大きな節目</h2>
        <ul className="measure mt-2 space-y-2 text-sm text-ink">
          <li>
            <span className="font-bold">2027年2月：愛知県知事の任期満了</span>
            。時期の目安と知事のしくみは{" "}
            <Link href="/elections/aichi-governor-2027" className="link-ink">
              愛知県知事選挙2027の解説
            </Link>
            へ。
          </li>
          <li>
            <span className="font-bold">2027年4月：統一地方選挙</span>
            。愛知県議会議員や多くの市町村議会議員の改選が見込まれます。何が選ばれるかは{" "}
            <Link href="/elections/unified-2027" className="link-ink">
              統一地方選挙2027（愛知）の解説
            </Link>
            へ。日程は今後、各選挙管理委員会から告示されます。
          </li>
        </ul>
      </section>

      {/* 今後の首長選（年別） */}
      {[...byYear.entries()].map(([year, list]) => (
        <section key={year}>
          <div className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-2">
            <h2 className="font-display text-2xl">{year}年</h2>
            <span className="tnum text-sm text-muted">{list.length}件</span>
          </div>
          <div className="mt-3">
            {list.map((e) => {
              const m = municipalityByGov(e.govCode);
              const href = m ? `/municipalities/${m.slug}/` : "/executives/";
              return (
                <div
                  key={e.id}
                  className="grid grid-cols-[6.5rem_1fr] items-baseline gap-x-4 border-t border-line py-4 last:border-b sm:grid-cols-[8rem_1fr]"
                >
                  <div className="tnum font-display text-base sm:text-lg">
                    {formatDate(e.termEnd!).replace(/^\d+年/, "")}
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-base">
                      <Link href={href} className="link-ink font-bold">
                        {e.area}
                      </Link>
                      <span className="ml-2 text-sm text-muted">
                        次の{e.title}選（現職：{e.name}）
                      </span>
                    </p>
                    {e.termSourceUrl && (
                      <span className="text-xs">
                        <SourceLink href={e.termSourceUrl}>任期の出典</SourceLink>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {past.length > 0 && (
        <section>
          <h2 className="eyebrow text-faint">基準日時点で任期満了日を過ぎているもの（{past.length}）</h2>
          <p className="measure mt-2 text-sm text-muted">
            改選後はデータを順次更新します。最新は各自治体の公式サイトでご確認ください。
          </p>
        </section>
      )}

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        情報の基準日：{LAST_UPDATED}。任期満了日は各自治体公式サイト・愛知県選挙管理委員会の資料に基づきます（各行の「任期の出典」リンク）。
        任期満了日＝投票日ではありません。実際の投票日・立候補者は各選挙管理委員会の告示でご確認ください。特定の候補者・政党への投票は呼びかけません。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/executives" className="link-ink">
          首長一覧
        </Link>
        <Link href="/municipalities" className="hover:text-accent-deep">
          市町村から探す
        </Link>
        <Link href="/area" className="hover:text-accent-deep">
          郵便番号で探す
        </Link>
        <Link href="/history" className="hover:text-accent-deep">
          県政・市政の歴史
        </Link>
      </nav>
    </div>
  );
}
