import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SourceLink } from "@/components/SourceLink";

export const metadata: Metadata = {
  title: "このサイトについて（中立性・出典・免責）",
  description:
    "愛知政治マップの編集方針・中立性・データの出典・AI要約の扱い・公職選挙法への配慮・訂正の受付について。",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t-2 border-ink pt-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="measure mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">About</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">
          このサイトについて
        </h1>
        <p className="measure mt-3 text-muted">
          愛知政治マップは、愛知県の有権者が国会（愛知選出）・愛知県議会・全54市町村の代表者の発言・採決・政治資金を、
          一次ソースに基づいて横断的に確認するための中立的な情報サイトです。
        </p>
      </header>

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
          データは手動バッチで更新しており、リアルタイムではありません。
          内容の誤り（誤った要約・記載など）にお気づきの場合は、出典と併せてご指摘ください。確認のうえ訂正し、履歴を残します。
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

      <Section title="運営・編集の独立性">
        <p>
          運営：愛知政治マップ編集部（個人運営）。運営者は他のメディアも運営していますが、
          本サイトの編集は独立して行い、特定の政党・候補者・団体との利害関係はありません。
          お問い合わせ先は準備中です。
        </p>
      </Section>
    </div>
  );
}
