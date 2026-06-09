import type { Metadata } from "next";
import Link from "next/link";
import { SourceLink } from "@/components/SourceLink";

export const metadata: Metadata = {
  title: "投票ガイド｜はじめての投票",
  description:
    "投票の流れと、判断材料の集め方をやさしく。だれに入れるべきとは言いません。自分の選挙区の調べ方、候補者・現職の記録の見方、投票の基本（期日前・持ち物）まで。",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-ink pt-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="measure mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function VoteGuidePage() {
  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-accent-deep">投票ガイド</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          はじめての投票
        </h1>
        <p className="measure mt-3 text-muted">
          投票の流れと、判断材料の集め方をやさしくまとめました。
          <span className="font-bold text-ink">だれに入れるべきとは言いません。</span>
          決めるのはあなたです。
        </p>
      </header>

      <Section title="① まず、投票の基本">
        <ul className="list-disc space-y-1 pl-5">
          <li>投票できるのは、18歳以上の有権者（住んでいる自治体に登録がある人）。</li>
          <li>投票日に行けなくても、期日前投票ができます（投票日の前の決められた期間）。</li>
          <li>会場は、入場券に書かれた投票所。入場券が見当たらなくても、本人確認で投票できます。</li>
          <li>正確な投票日・期日前の期間・場所は、必ず選挙管理委員会の公式情報で確認してください。</li>
        </ul>
      </Section>

      <Section title="② 自分の選挙区・代表を調べる">
        <p>
          まずは「自分の地域の代表がだれか」から。
          <Link href="/area" className="link-ink">
            郵便番号で調べる
          </Link>
          か、
          <Link href="/municipalities" className="link-ink">
            市町村から探す
          </Link>
          で確認できます。
        </p>
      </Section>

      <Section title="③ 候補者・現職の「記録」を見る">
        <p>
          人物の印象ではなく、記録で見るのがおすすめです。
          <Link href="/legislators" className="link-ink">
            議員の発言・採決・政治資金
          </Link>
          、
          <Link href="/issues" className="link-ink">
            争点ごとの立場
          </Link>
          、
          <Link href="/facts" className="link-ink">
            事実カード
          </Link>
          を、すべて出典つきで確認できます。
        </p>
      </Section>

      <Section title="④ 仕組みから知りたいなら">
        <p>
          「選挙のしくみ」「二元代表制」などは
          <Link href="/learn" className="link-ink">
            まなぶ
          </Link>
          でゼロから。言葉に迷ったら
          <Link href="/glossary" className="link-ink">
            用語集
          </Link>
          へ。
        </p>
      </Section>

      <Section title="このガイドの立場">
        <p>
          本サイトは特定の政党・候補者への投票や不投票を呼びかけません。提供するのは判断材料（事実と出典）だけです。
          選挙期間中は、投票誘導と取られうる表示をさらに控えます。
        </p>
        <p className="mt-2">
          投票の手続き・日程の出典：
          <SourceLink href="https://www.soumu.go.jp/senkyo/">総務省 選挙</SourceLink>
          ／お住まいの選挙管理委員会の公式情報。
        </p>
      </Section>
    </div>
  );
}
