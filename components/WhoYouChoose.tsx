import Link from "next/link";
import { SourceLink } from "./SourceLink";

// 「あなたが選べる人」マップ（名古屋市に住む有権者の場合）。
// 国・県・市で、それぞれ別の選挙で代表を選ぶことを一覧にする。時期は任期満了日などの事実のみ。
type Ballot = { who: string; how: string; next: string };

const LAYERS: { layer: string; ballots: Ballot[] }[] = [
  {
    layer: "国",
    ballots: [
      {
        who: "衆議院議員",
        how: "小選挙区で1人の名前を書く＋比例代表で政党名を書く（2票）",
        next: "解散があるとき（最長で2030年2月まで）",
      },
      {
        who: "参議院議員",
        how: "愛知県選挙区で1人の名前を書く＋比例代表で政党名か候補者名を書く（2票）",
        next: "3年ごと（次は2028年7月に任期満了）",
      },
    ],
  },
  {
    layer: "愛知県",
    ballots: [
      { who: "知事", how: "1人の名前を書く", next: "2027年2月に任期満了" },
      { who: "県議会議員", how: "住んでいる区の選挙区で1人の名前を書く", next: "2027年4月ごろ（統一地方選挙）" },
    ],
  },
  {
    layer: "名古屋市",
    ballots: [
      { who: "市長", how: "1人の名前を書く", next: "2028年11月に任期満了" },
      { who: "市会議員", how: "住んでいる区の選挙区で1人の名前を書く", next: "2027年4月ごろ（統一地方選挙）" },
    ],
  },
];

export function WhoYouChoose() {
  return (
    <section aria-labelledby="who-you-choose" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="who-you-choose" className="text-xl font-medium sm:text-2xl">
        あなたが選べる人（名古屋市に住んでいる場合）
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        国・県・市は、それぞれ別の選挙で代表を選びます。全部あわせると6種類の選挙があります。
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {LAYERS.map((l) => (
          <div key={l.layer} className="rounded-2xl bg-subtle p-4">
            <h3 className="text-sm font-medium text-accent-deep">{l.layer}</h3>
            <ul className="mt-2 space-y-3">
              {l.ballots.map((b) => (
                <li key={b.who} className="rounded-xl bg-surface p-3">
                  <p className="font-medium text-ink">{b.who}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{b.how}</p>
                  <p className="mt-1 text-xs text-ink">次：{b.next}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        <span className="font-medium text-ink">選挙で選ばないもの：</span>
        首相（国会議員が選ぶ）と区長（名古屋市の職員）。名古屋市以外の市町村では、市長・市会議員が
        「市町村長・市町村議会議員」になります。投票できるのは18歳以上です。
      </p>
      <p className="chart-note mt-3">
        出典：
        <SourceLink href="https://laws.e-gov.go.jp/law/325AC1000000100">公職選挙法（e-Gov法令検索）</SourceLink>
        ・時期は任期満了日（本サイトの首長データ・選挙のページ）に基づく目安。投票日は各選挙管理委員会の告示で確定します。
        <Link href="/vote-guide/" className="ml-1 link-ink">
          投票ガイドへ
        </Link>
      </p>
    </section>
  );
}
