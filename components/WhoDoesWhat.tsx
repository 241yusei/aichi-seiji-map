import Link from "next/link";
import { SourceLink } from "./SourceLink";

// 「県と市、どっちが何をしている？」の早見表。各行の根拠は法律の条文（e-Gov法令検索）で確認済み。
// 条文で言えることだけを載せる（推測で行を足さない）。
const ROWS: { what: string; who: "市町村" | "都道府県"; nagoya: string; law: string; url: string }[] = [
  {
    what: "保育園（保育が必要な子どもの保育）",
    who: "市町村",
    nagoya: "名古屋市",
    law: "児童福祉法24条",
    url: "https://laws.e-gov.go.jp/law/322AC0000000164",
  },
  {
    what: "ごみの収集・処理",
    who: "市町村",
    nagoya: "名古屋市",
    law: "廃棄物処理法6条の2",
    url: "https://laws.e-gov.go.jp/law/345AC0000000137",
  },
  {
    what: "小学校・中学校をつくる",
    who: "市町村",
    nagoya: "名古屋市",
    law: "学校教育法38条・49条",
    url: "https://laws.e-gov.go.jp/law/322AC0000000026",
  },
  {
    what: "消防・救急",
    who: "市町村",
    nagoya: "名古屋市（消防局）",
    law: "消防組織法6条",
    url: "https://laws.e-gov.go.jp/law/322AC0000000226",
  },
  {
    what: "水道",
    who: "市町村",
    nagoya: "名古屋市（上下水道局）",
    law: "水道法6条2項（原則として市町村）",
    url: "https://laws.e-gov.go.jp/law/332AC0000000177",
  },
  {
    what: "警察",
    who: "都道府県",
    nagoya: "愛知県（愛知県警察）",
    law: "警察法36条",
    url: "https://laws.e-gov.go.jp/law/329AC0000000162",
  },
];

export function WhoDoesWhat() {
  return (
    <section aria-labelledby="who-does-what" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="who-does-what" className="text-xl font-medium sm:text-2xl">
        県と市、どっちが何をしている？
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        毎日のくらしに近いことの多くは市町村の仕事です。一方で、警察は市ではなく県の仕事です。
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <caption className="sr-only">くらしのことと、主に担当する自治体の早見表</caption>
          <thead>
            <tr className="border-b border-line text-xs text-muted">
              <th scope="col" className="py-2 pr-3 font-medium">くらしのこと</th>
              <th scope="col" className="py-2 pr-3 font-medium">主に担当</th>
              <th scope="col" className="py-2 pr-3 font-medium">名古屋では</th>
              <th scope="col" className="py-2 font-medium">根拠（法律）</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.what} className="border-b border-line last:border-0">
                <th scope="row" className="py-3 pr-3 font-medium text-ink">{r.what}</th>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.who === "市町村" ? "bg-accent-weak text-accent-deep" : "bg-subtle text-ink"
                    }`}
                  >
                    {r.who}
                  </span>
                </td>
                <td className="py-3 pr-3 text-muted">{r.nagoya}</td>
                <td className="py-3 text-xs">
                  <SourceLink href={r.url}>{r.law}</SourceLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        名古屋市は「政令指定都市」なので、ふつうは県がする仕事の一部も市が受け持っています。
        くわしくは{" "}
        <Link href="/learn/seireishi/" className="link-ink">
          まなぶ「政令指定都市」
        </Link>
        へ。
      </p>
    </section>
  );
}
