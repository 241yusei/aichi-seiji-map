import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "訂正・更新ログ",
  description:
    "「政治のトリセツ あいち・なごや」の更新と訂正の履歴。内容の誤りが見つかった場合は、日付・箇所・修正内容・出典を記録して公開します。",
  alternates: { canonical: "/corrections/" },
};

// 更新・訂正の履歴（手動・追記型）。訂正は kind="訂正"、機能/データ追加は kind="更新"。
const LOG: { date: string; kind: "更新" | "訂正"; text: string }[] = [
  { date: "2026-09-25", kind: "訂正", text: "事実カード「国会ではほとんど語られない地元の争点」の件数を訂正。一般的な語（例：バリアフリー・空港・カーボンニュートラル）で数えていたため、名古屋城と無関係の発言を1件と数えるなど件数が過大でした。判定語を固有名詞に限り、全件を目で確認して数え直しました（EV転換54→13件ほか）。あわせて収録期間の記載を「2017年〜」から正しい「2021年4月〜」に直しました。" },
  { date: "2026-09-25", kind: "訂正", text: "選挙期間中の注意書きの文言を訂正。「投票誘導と取られうる表示を抑制しています」と記載していましたが、実際に非表示にしている項目はありませんでした。実際の運用（特定の候補者・政党への投票を呼びかけない、掲載情報は出典付きの事実）に合わせた文言に改めました。" },
  { date: "2026-09-25", kind: "更新", text: "国会発言データを更新し、議員の委員会・役職（名古屋市会68人）、岡崎市議会の議決、財政・歴史・集計方法のページ、清須市議会の出典URLの修正などを反映（6月以降の更新をまとめて記録）。" },
  { date: "2026-06-08", kind: "更新", text: "まなぶ各章の本文を充実。争点を11件に拡充（介護・公共交通・観光ほか）。" },
  { date: "2026-06-08", kind: "更新", text: "学習レイヤーを新設（まなぶ全14章・用語集・用語ツールチップ・図解・「県？市？」クイズ・投票ガイド）。名称を「政治のトリセツ あいち・なごや」にリブランド。" },
  { date: "2026-06-06", kind: "更新", text: "事実カード、首長55名、議員プロフィール32名、市町村ページ・地図、横断検索を追加。" },
];

export default function CorrectionsPage() {
  return (
    <div className="space-y-8">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">Corrections &amp; Updates</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          訂正・更新ログ
        </h1>
        <p className="measure mt-3 text-muted">
          このサイトの更新と訂正の履歴です。内容の誤りが見つかった場合は、日付・箇所・修正内容・出典をここに記録して公開します。
          誤りのご指摘は
          <a
            href="https://github.com/241yusei/aichi-seiji-map/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="link-ink"
          >
            GitHub Issues
          </a>
          へ。
        </p>
      </header>

      <ol className="space-y-0">
        {LOG.map((l, i) => (
          <li key={i} className="grid grid-cols-[7rem_1fr] gap-3 border-t border-line py-4 last:border-b">
            <div>
              <span className="tnum block text-sm font-bold">{l.date}</span>
              <span
                className={`eyebrow ${l.kind === "訂正" ? "text-accent-deep" : "text-faint"}`}
              >
                {l.kind}
              </span>
            </div>
            <p className="measure text-sm text-muted">{l.text}</p>
          </li>
        ))}
      </ol>

      <p className="text-sm">
        <Link href="/about" className="link-ink">
          ← 中立性・運営・財源について
        </Link>
      </p>
    </div>
  );
}
