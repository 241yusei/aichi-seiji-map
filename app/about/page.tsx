import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SourceLink } from "@/components/SourceLink";

export const metadata: Metadata = {
  title: "このサイトについて（中立性・出典・免責）",
  description:
    "愛知政治マップの編集方針・中立性・データの出典・AI要約の扱い・公職選挙法への配慮・訂正の受付について。",
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">このサイトについて</h1>
        <p className="mt-2 text-sm text-muted">
          愛知政治マップは、愛知県の有権者が国会（愛知選出）・愛知県議会・名古屋市会の代表者の発言・採決・政治資金を、
          一次ソースに基づいて横断的に確認するための中立的な情報サイトです。
        </p>
      </header>

      <Section title="中立・非投票誘導">
        <p>
          本サイトは特定の政党・候補者への投票／不投票を呼びかけません。比較はすべて事実に基づいて行い、
          「完全な中立」を主張するのではなく、どのような基準でデータを選び表示したかを開示することを方針としています。
        </p>
      </Section>

      <Section title="データの出典">
        <ul className="list-disc pl-5">
          <li>
            国会の発言：
            <SourceLink href="https://kokkai.ndl.go.jp/">国会会議録検索システム</SourceLink>
            （国立国会図書館）のAPIから取得し、各発言に原文へのリンクを併記しています。
          </li>
          <li>
            議員一覧：衆参の選挙結果・各議会の公式議員名簿に基づきます（各議員ページに出典リンク）。
          </li>
          <li>
            愛知県議会・名古屋市会の発言：各サイトの規約・robots.txt に配慮し、本文は転載せず、
            公式の会議録検索システムへの出典リンクで案内しています。
          </li>
          <li>政治資金：総務省の政治資金収支報告書を出典に、主要項目のみを順次掲載します。</li>
        </ul>
      </Section>

      <Section title="AI要約について">
        <p>
          国会発言には、生成AIによる中立・多視点の要約を補助情報として併記する場合があります。
          AI要約は自動生成のため原文と異なる場合があり、判断の際は必ず併記の原文（会議録）をご確認ください。
          要約は意見の評価や投票の誘導を目的としません。
        </p>
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

      <Section title="運営">
        <p>
          運営：愛知政治マップ編集部（ナゴヤ人間）。お問い合わせ先は準備中です。
        </p>
        <p className="text-xs">
          ※ 本ページは Phase 1（国会・愛知県議会・名古屋市会）の内容です。対象範囲は順次拡大します。
        </p>
      </Section>
    </div>
  );
}
