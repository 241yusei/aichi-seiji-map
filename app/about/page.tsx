import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SourceLink } from "@/components/SourceLink";

export const metadata: Metadata = {
  title: "このサイトについて（中立性・出典・免責）",
  description:
    "「政治のトリセツ あいち・なごや」の編集方針・中立性・データの出典・AI要約の扱い・公職選挙法への配慮・訂正の受付について。",
  alternates: { canonical: "/about/" },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rule-thick pt-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="measure mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="border-b-[3px] border-ink pb-6">
        <p className="eyebrow text-faint">About</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          このサイトについて
        </h1>
        <p className="measure mt-3 text-muted">
          「政治のトリセツ あいち・なごや」は、政治をはじめて知る人でも、愛知県の国会（愛知選出）・愛知県議会・全54市町村の代表者の発言・採決・政治資金を、
          一次ソースに基づいて確認できる中立的な情報サイトです。むずかしい言葉はやさしく解説し、判断は呼びかけません。
        </p>
      </header>

      <Section title="なぜ作ったか">
        <p>
          愛知県の政治は、国会（愛知選出）・愛知県議会・名古屋市会・県内54市町村議会という複数の層に分かれています。
          それぞれの公式サイトを見れば個別の情報は得られますが、「自分の地域の代表者が、国・県・市それぞれで
          何を言い、どう投票し、どんな政治資金なのか」を一次ソース付きで横断して確認できる場所がありませんでした。
          そこで、地域メディアの運営・取材編集の経験を持つ個人が、この横断把握の仕組みを作りました。
        </p>
        <p>
          サイトの構築・データ収集には生成AI（Claude／Anthropic）を活用しています。1,000人を超える議員の
          プロフィールや発言・採決データを人手だけで継続的に整備するのは個人運営では現実的でないため、
          収集・整形の一部をAIに任せつつ、出典URLの併記と事実確認は必ず人が行う体制にしています。
        </p>
      </Section>

      <Section title="何をカバーしているか">
        <p>
          国会（愛知選出）・愛知県議会・県内全54市町村議会という三つの層を、ひとつのサイトで横断して扱っています。
          議員一覧・名簿にとどまらず、発言・採決・政治資金・事実カード・選挙カレンダー・基礎から学べるカリキュラム
          までを一次ソース付きでそろえ、「調べる」だけでなく「わかる」まで届く設計にしています。
        </p>
        <p>
          特定の市区町村や国政だけを扱う類似のサービスも存在しますが、本サイトは
          <span className="font-bold text-ink">愛知県全体を、国・県・市町村の縦のつながりごと</span>
          見られることを目指しています。
        </p>
      </Section>

      <Section title="中立・非投票誘導">
        <p>
          本サイトは特定の政党・候補者への投票／不投票を呼びかけません。比較はすべて事実に基づいて行い、
          「完全な中立」を主張するのではなく、どのような基準でデータを選び表示したかを開示することを方針としています。
        </p>
      </Section>

      <Section title="編集方針・データの選定基準">
        <p>中立を「掲げる」だけでなく、仕組みとして示すための運用ルールです。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>すべての発言・採決・政治資金・事実カードに、一次ソースURLを必ず併記します。</li>
          <li>評価語（良い／悪い等）を使わず、「記録」をそのまま並べます。</li>
          <li>
            事実カードの題材は争点を起点に選び、特定の政党・議員を狙い撃ちしないよう複数の会派を横断して扱います。
          </li>
          <li>
            数値が誤解を生みうる場合（団体種別で規模が変わる等）は、必ず「読み方の注意」を併記します。
          </li>
          <li>掲載しなかった事項がある場合は、その理由を可能な範囲で示します。</li>
        </ul>
      </Section>

      <Section title="データの出典">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            国会の発言：
            <SourceLink href="https://kokkai.ndl.go.jp/">国会会議録検索システム</SourceLink>
            （国立国会図書館）のAPIから取得し、各発言に原文へのリンクを併記しています。
          </li>
          <li>議員一覧：衆参の選挙結果・各議会の公式議員名簿に基づきます（各議員ページに出典リンク）。</li>
          <li>
            愛知県議会・市町村議会の発言：各サイトの規約・robots.txt に配慮し、本文は転載せず、
            公式の会議録検索システムへの出典リンクで案内しています。
          </li>
          <li>
            政治資金：総務省・各都道府県選管の政治資金収支報告書を出典に、収入・支出の総額のみを掲載します。
            数値は報告書PDFからの転記のため、各項目の出典PDFで照合できます（価値判断はしません）。
          </li>
        </ul>
      </Section>

      <Section title="AI要約について（検証手順）">
        <p>
          国会発言には、生成AIによる中立・多視点の要約を補助情報として併記する場合があります。
          AI要約は自動生成のため原文と異なる場合があり、判断の際は必ず併記の原文（会議録）をご確認ください。
          要約は意見の評価や投票の誘導を目的としません。
        </p>
        <p>透明性のため、要約は次の手順で扱います。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>入力は会議録の原文のみ。要約には必ず元発言へのリンクを併記します。</li>
          <li>中立・多視点・低温度のプロンプトで生成し、用いたモデル名と生成日時を記録します。</li>
          <li>要約は本文の「補助」であり、一次ソース（原文）が常に優先されます。</li>
          <li>誤要約の指摘を受け付け、確認のうえ訂正します。</li>
        </ul>
      </Section>

      <Section title="公職選挙法への配慮">
        <p>
          発言・投票記録の客観的な表示を目的とし、投票の呼びかけは行いません。
          選挙期間中は、投票誘導と受け取られうる表示を抑制する設計とします。
          記名投票でない採決は「個人の賛否は非公開」と明示します。
        </p>
      </Section>

      <Section title="データの鮮度・訂正の受付">
        <p>
          データは手動バッチで更新しており、リアルタイムではありません。各ページに「データ基準日」を表示します。
          内容の誤り（誤った要約・記載など）にお気づきの場合は、出典と併せてご指摘ください。確認のうえ訂正し、履歴を残します。
        </p>
        <p>
          ご指摘の窓口：
          <SourceLink href="https://github.com/241yusei/aichi-seiji-map/issues">
            GitHub Issues（公開）
          </SourceLink>
          。訂正・更新の履歴は
          <Link href="/corrections" className="link-ink">
            訂正・更新ログ
          </Link>
          で公開します。
        </p>
      </Section>

      <Section title="財源・寄付の方針">
        <p>
          本サイトはサーバー代・ドメイン代・データ取得の実費でほぼ自費運営しています。運営を続けるための
          <Link href="/support" className="link-ink">支援・寄付</Link>
          を受け付けますが、中立性を守るため次のガードレールを設けます。
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <span className="font-bold text-ink">政党・政治家・政治団体からの寄付は受け取りません。</span>
          </li>
          <li>支援は「サイト運営」への支援であり、特定の政治活動への支援ではありません。</li>
          <li>誰が支援しても、掲載する内容・順序・表示は一切変わりません（編集の独立）。</li>
          <li>支援の使途（サーバー・ドメイン・データ取得）は、可能な範囲で公開します。</li>
        </ul>
      </Section>

      <Section title="運営者と編集の独立性">
        <p>
          運営：「政治のトリセツ あいち・なごや」編集部（個人運営）。
          本サイトは、<span className="font-bold text-ink">地域メディアの運営・取材編集の経験がある個人</span>
          が、中立を方針として運営しています。具体的には、名古屋の情報メディア
          <SourceLink href="https://note.com/citypod_nagoya">「ナゴヤ人間」</SourceLink>
          と同一の運営者です。中立性は運営者を隠すことではなく、方法の開示
          （一次ソース主義・論評を載せない・出典明記）で担保する方針です。本サイトの編集は、運営者が関わる他の媒体からは
          <span className="font-bold text-ink">独立して</span>行います。
        </p>
        <p className="mt-3 font-bold text-ink">利益相反についての方針</p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>特定の政党・候補者・政治団体と、組織的な関係や利害関係を持ちません。</li>
          <li>
            <span className="font-bold text-ink">政党・政治家・政治団体からの寄付・広告は受け取りません。</span>
          </li>
          <li>支援者・寄付者によって、掲載する内容・順序・評価は一切変わりません（編集の独立）。</li>
          <li>掲載は争点を起点に複数の会派を横断して選び、評価語を使わず、必ず一次ソースを併記します。</li>
        </ul>
        <p className="mt-3">
          ご連絡・誤りのご指摘は
          <SourceLink href="https://github.com/241yusei/aichi-seiji-map/issues">
            GitHub Issues
          </SourceLink>
          へ。訂正の履歴は
          <Link href="/corrections" className="link-ink">
            訂正・更新ログ
          </Link>
          で公開します。
        </p>
      </Section>
    </div>
  );
}
