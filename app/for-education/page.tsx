import type { Metadata } from "next";
import Link from "next/link";
import { SourceLink } from "@/components/SourceLink";
import { LAST_UPDATED } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "教育でつかう｜主権者教育・調べ学習・ゼミでの活用ガイド",
  description:
    "高校の主権者教育（公共）・大学ゼミ・図書館の調べ学習で「政治のトリセツ」を使うためのガイド。名簿・発言・採決・政治資金の収録範囲と限界、一次資料の確認方法、問いと引用の例を紹介。無料・申請不要。",
  alternates: { canonical: "/for-education/" },
};

const COVERAGE_ROWS = [
  {
    label: "議員名簿・首長",
    scope: "愛知選出の国会議員・愛知県議会・全54市町村議会の名簿と、首長への入口があります。",
    note: "名簿の収録と公式照合の完了は別です。現職・所属・役職などの確認状況は各ページで確認してください。",
  },
  {
    label: "発言",
    scope: "本文・統計は愛知選出の国会議員の収録分を掲載しています。県・市町村議会の発言本文は転載せず、公式会議録へ案内します。",
    note: "全発言を収録しているわけではありません。未収録・0件を「発言や活動がない」とは扱いません。",
  },
  {
    label: "採決",
    scope: "個人別の賛否は、参院の記名投票など公式に公開された収録分のみです。最新の全採決を網羅していません。",
    note: "起立採決や県・市町村の議案の議決結果から、議員個人の賛否を推測しません。",
  },
  {
    label: "政治資金",
    scope: "2024年分の一部の政治団体について、収入・支出などの主要項目と報告書リンクを掲載しています。",
    note: "議員本人の家計や、関係する全団体・全年度の合計ではありません。報告年・団体・集計項目をそろえて比べます。",
  },
  {
    label: "地域検索",
    scope: "54市町村から選べます。郵便番号検索は名古屋市内のみで、7桁の形式を確かめ、上3桁から区を案内します。",
    note: "住所や個々の郵便番号の実在を照合する機能ではありません。名古屋市以外は市町村の一覧から選んでください。",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rule-thick pt-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="measure mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function ForEducationPage() {
  return (
    <div className="space-y-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium tracking-wider text-accent">授業で使う</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          教育でつかう
        </h1>
        <p className="measure mt-3 text-muted">
          このサイトは、高校の主権者教育・大学のゼミ・図書館での調べ学習に
          <span className="font-bold text-ink">無料・申請不要</span>
          でお使いいただけます。特定の政党・候補者への投票は呼びかけません。
          授業では、掲載した記録の収録範囲と一次ソース（出典）を確かめながらご利用ください。
        </p>
      </header>

      {/* 教員・司書向けに、編集方針と運用を区別して提示する。 */}
      <section className="card-soft border border-line bg-surface p-5">
        <p className="eyebrow text-accent-deep">授業で使う前に</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>投票／不投票を呼びかけません。収録した記録の件数で議員の優劣を評価しません。</li>
          <li>掲載した発言・採決・政治資金には出典URLを併記します。未収録のデータもあります。</li>
          <li>選挙期間中（公示・告示〜投票日）は、新しい事実カードの公開とSNSの新規投稿を止める運用です。既存の記録は出典付きで継続し、誤りは訂正します。</li>
          <li>
            運営・財源・編集方針は
            <Link href="/about" className="link-ink">
              「中立性・運営・財源」
            </Link>
            で開示しています（政党・政治家・政治団体からの寄付は受け取りません）。
          </li>
        </ul>
      </section>

      <section className="rule-thick pt-5" aria-labelledby="education-coverage-heading">
        <h2 id="education-coverage-heading" className="font-display text-xl">現在の収録範囲と、授業での注意</h2>
        <p className="measure mt-2 text-sm text-muted">データの種類によって、調べられる範囲が異なります。</p>
        <table className="mt-4 w-full table-fixed border-y border-line text-left text-sm">
          <caption className="sr-only">データ別の収録・案内と、その限界</caption>
          <thead className="border-b border-line bg-subtle">
            <tr>
              <th scope="col" className="w-24 px-3 py-3 font-medium sm:w-36">データ</th>
              <th scope="col" className="px-3 py-3 font-medium">本サイトで調べられること・注意点</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {COVERAGE_ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="px-3 py-4 align-top font-medium">{row.label}</th>
                <td className="px-3 py-4 align-top leading-relaxed">
                  <p>{row.scope}</p>
                  <p className="mt-2 text-muted">{row.note}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="measure mt-3 text-sm text-muted">
          日付・対象年・未確認の意味は各ページで、数え方と収録の限界は
          <Link href="/methodology/" className="link-ink">集計方法</Link>
          で確認できます。サイト更新日は、すべての資料を再確認した日ではありません。
        </p>
      </section>

      <Section title="① 主権者教育（高校「公共」・18歳選挙権）での使い方">
        <p>
          「自分の地域の代表を知る」からはじめるのが定番です。生徒それぞれの地域で結果が変わるので、
          自分ごとになります。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/area" className="link-ink">
              市町村・区から自分の地域の代表者を調べる
            </Link>
            （名古屋市は区・郵便番号から国・県・市の代表者へ。ほかの市町村は首長・議員一覧へ）
          </li>
          <li>
            <Link href="/vote-guide" className="link-ink">
              投票ガイド
            </Link>
            で投票の流れを確認（だれに入れるべきかは言いません）
          </li>
          <li>
            <Link href="/elections" className="link-ink">
              選挙カレンダー
            </Link>
            で「次の選挙はいつごろか」を確認
          </li>
        </ul>
      </Section>

      <Section title="② 探究学習・レポート（高校・大学）での使い方">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/issues" className="link-ink">
              争点ページ
            </Link>
            は、リニア・名古屋城などの論点を「これは国・県・市のどの話か」で整理しています。
            複数の立場の根拠と、まだ分からないことを読み比べる材料にできます。
          </li>
          <li>
            <Link href="/learn" className="link-ink">
              まなぶ
            </Link>
            と
            <Link href="/glossary" className="link-ink">
              用語集
            </Link>
            で、二元代表制・記名投票と起立採決などの基礎を確認できます。
          </li>
          <li>
            <Link href="/facts" className="link-ink">
              事実カード
            </Link>
            は「数字1つ＋読み方の注意」の形なので、グラフ読解・データリテラシーの教材になります。
          </li>
        </ul>
      </Section>

      <Section title="③ ゼミ・研究での使い方">
        <p>
          愛知選出の国会議員・県議会・54市町村の議員名簿や首長への入口を使い、
          収録範囲を確かめて比較します。発言・採決・政治資金が、全議員・全自治体で同じように
          そろっているわけではありません。
          <Link href="/legislators" className="link-ink">
            議員一覧
          </Link>
          ・
          <Link href="/compare" className="link-ink">
            議員をくらべる
          </Link>
          ・
          <Link href="/parties" className="link-ink">
            政党・会派の勢力図
          </Link>
          が入口です。議員ごとに収録期間や資料の公表方法が違うことも、調査の対象にしてください。
        </p>
      </Section>

      <Section title="授業で使える「問い」の例（中立）">
        <ul className="list-disc space-y-1 pl-5">
          <li>同じ議案を衆議院・参議院で比べるとき、議案名・採決日・採決方法の何をそろえる必要があるだろう？</li>
          <li>「記名投票」と「起立採決」では、どの記録から個人の賛否を確認でき、何は確認できないだろう？</li>
          <li>あなたの市町村議会の会派構成はどうなっているだろう？　政党と会派の違いを確かめるには、どの資料を読めばよいだろう？</li>
          <li>ある選挙の議員定数と立候補者数は、それぞれ何人だろう？　選挙管理委員会の確定発表で時期・選挙区をそろえて比べ、数字だけで分かることと、理由を調べるために必要な資料を分けてみよう。</li>
        </ul>
        <p className="text-xs text-faint">
          未収録や数字の違いから、活動の有無や原因を決めつけず、原典で確認できる範囲から考える問いです。
        </p>
      </Section>

      <Section title="原典と集計方法を確かめる">
        <ul className="list-disc space-y-2 pl-5">
          <li><SourceLink href="https://kokkai.ndl.go.jp/api.html">国立国会図書館・国会会議録検索用APIの仕様</SourceLink>：国会発言の取得元です。発言の原文は各記録の出典リンクから確認できます。</li>
          <li><SourceLink href="https://www.sangiin.go.jp/japanese/touhyoulist/touhyoulist.html">参議院・本会議投票結果</SourceLink>：案件・採決日を選び、公表された個人の賛否を確認します。</li>
          <li><SourceLink href="https://www.pref.aichi.jp/soshiki/senkyo/071128.html">愛知県選挙管理委員会・2024年（令和6年）分の政治資金収支報告書</SourceLink>：団体名・報告年・収入や支出の項目を、掲載された報告書と照合します。</li>
          <li><SourceLink href="https://www.pref.aichi.jp/senkyo/">愛知県選挙管理委員会</SourceLink>：選挙の確定結果や、市区町村の選挙管理委員会を探す入口です。</li>
          <li><Link href="/methodology/" className="link-ink">本サイトの集計方法</Link>：発言件数や会派多数の算出対象・限界を確認します。</li>
        </ul>
      </Section>

      <Section title="引用のしかた">
        <p>レポート・教材で引用する場合は、次の形を推奨します。</p>
        <p className="border border-line bg-surface p-3 text-xs leading-relaxed text-ink">
          政治のトリセツ あいち・なごや「（ページ名）」https://seiji-torisetsu.pages.dev/（閲覧日）
          ※確認日・収録範囲：各ページの記載をご確認ください
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            スクリーンショットの授業スライド・プリントへの利用は、出典明記のうえで歓迎します。
          </li>
          <li>
            当サイトのデータは公的機関の公開情報に基づきます。論文等の正式な引用では、各ページに
            併記された<span className="font-bold text-ink">一次ソース（原典）にあたって確認</span>
            することを推奨します。
          </li>
        </ul>
      </Section>

      <Section title="ご連絡・ご要望">
        <p>
          授業・調べ学習での活用報告や、「こういうデータの見せ方がほしい」というご要望は、
          <Link href="/about" className="link-ink">
            中立性・運営・財源
          </Link>
          のページにある窓口からお寄せください。誤りのご指摘には訂正で応え、
          <Link href="/corrections" className="link-ink">
            訂正・更新ログ
          </Link>
          として公開します。
        </p>
      </Section>

      <p className="measure border-t border-line pt-5 text-xs text-faint">
        サイト更新日：{LAST_UPDATED}。本ページは教育目的での利用案内であり、特定の政党・候補者への
        投票を呼びかけるものではありません。
      </p>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 rule-thick pt-5 text-sm text-muted">
        <Link href="/start" className="link-ink">
          はじめに
        </Link>
        <Link href="/learn" className="hover:text-accent-deep">
          まなぶ
        </Link>
        <Link href="/vote-guide" className="hover:text-accent-deep">
          投票ガイド
        </Link>
        <Link href="/facts" className="hover:text-accent-deep">
          事実カード
        </Link>
        <Link href="/methodology/" className="hover:text-accent-deep">
          集計方法
        </Link>
      </nav>
    </div>
  );
}
