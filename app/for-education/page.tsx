import type { Metadata } from "next";
import Link from "next/link";
import { LAST_UPDATED } from "@/lib/site-meta";

export const metadata: Metadata = {
  title: "教育でつかう｜主権者教育・調べ学習・ゼミでの活用ガイド",
  description:
    "高校の主権者教育（公共）・大学ゼミ・図書館の調べ学習で「政治のトリセツ」を使うためのガイド。無料・申請不要。中立設計（投票誘導なし・全データ出典つき）なので、そのまま教材に使えます。引用のしかたも解説。",
  alternates: { canonical: "/for-education/" },
};

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
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-accent-deep">For Education</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          教育でつかう
        </h1>
        <p className="measure mt-3 text-muted">
          このサイトは、高校の主権者教育・大学のゼミ・図書館での調べ学習に
          <span className="font-bold text-ink">無料・申請不要</span>
          でお使いいただけます。特定の政党・候補者への投票を呼びかけない中立設計で、
          すべてのデータに一次ソース（出典）が付いています。
        </p>
      </header>

      {/* 教員・司書向けの要点（最初に安心材料を提示） */}
      <section className="card-soft border border-line bg-surface p-5">
        <p className="eyebrow text-accent-deep">教材として使える理由（設計上の担保）</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
          <li>投票／不投票を呼びかけません。評価語（良い・悪い・優劣）を使いません。</li>
          <li>発言・採決・政治資金のすべてに一次ソースURLを併記し、原文に到達できます。</li>
          <li>選挙期間中（告示〜投票日）は、投票誘導と取られうる表示を抑制する仕組みがあります。</li>
          <li>
            運営・財源・編集方針は
            <Link href="/about" className="link-ink">
              「中立性・運営・財源」
            </Link>
            で開示しています（政党・政治家・政治団体からの寄付は受け取りません）。
          </li>
        </ul>
      </section>

      <Section title="① 主権者教育（高校「公共」・18歳選挙権）での使い方">
        <p>
          「自分の地域の代表を知る」からはじめるのが定番です。生徒それぞれの地域で結果が変わるので、
          自分ごとになります。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/area" className="link-ink">
              郵便番号で自分の地域の代表者を調べる
            </Link>
            （衆院・参院・県議会・市町村の代表が一画面に）
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
            賛成・慎重の両論を併記しているので、立場を選んで論じる練習に向きます。
          </li>
          <li>
            <Link href="/learn" className="link-ink">
              まなぶ（全14章）
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
          愛知の国会議員（愛知選出）・県議会・全54市町村の議員と首長を、発言・採決・政治資金まで
          一次ソースリンクごと横断できます。
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
          が入口です。データの由来と限界（起立採決は個人の賛否が非公開、など）は各ページに明記しています。
        </p>
      </Section>

      <Section title="授業で使える「問い」の例（中立）">
        <ul className="list-disc space-y-1 pl-5">
          <li>同じ予算案なのに、衆議院と参議院で愛知の議員の賛否が逆になったのはなぜだろう？</li>
          <li>「記名投票」と「起立採決」——個人の賛否が公開される・されないの違いは、何をもたらすだろう？</li>
          <li>あなたの市の議会の最大会派は？　それは国会の構図と同じだろうか？</li>
          <li>「議員のなり手不足（定数割れ）」は、なぜ町村で先に起きるのだろう？</li>
        </ul>
        <p className="text-xs text-faint">
          いずれも「どちらが正しいか」ではなく、事実から考える問いです。結論はサイトでは示していません。
        </p>
      </Section>

      <Section title="引用のしかた">
        <p>レポート・教材で引用する場合は、次の形を推奨します。</p>
        <p className="border border-line bg-surface p-3 text-xs leading-relaxed text-ink">
          政治のトリセツ あいち・なごや「（ページ名）」https://aichi-seiji-map.vercel.app/（閲覧日）
          ※データ基準日：各ページ下部に記載
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
        情報の基準日：{LAST_UPDATED}。本ページは教育目的での利用案内であり、特定の政党・候補者への
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
      </nav>
    </div>
  );
}
