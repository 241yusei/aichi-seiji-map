// 検索インデックス（軽量JSON）をビルド時に生成する。
// 議員・首長・争点・事実カードを横断検索できるよう、最小フィールドだけを public/search-index.json に出力。
// Pagefind 等のバイナリ依存を避け、静的サイトでもクライアント検索が成立する。
//   npm run build:search （prebuild から自動実行）

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getExecutives, getFactCards, getIssues, getLegislators } from "../lib/data";
import { municipalityByGov } from "../lib/municipalities";

interface Entry {
  t: string; // 表示見出し
  s: string; // サブ情報（区分・地域・政党など）
  u: string; // 遷移先URL
  k: "議員" | "首長" | "争点" | "事実カード" | "ページ"; // 種別
  q: string; // 検索対象文字列（小文字化・かな含む）
}

const norm = (s: string) => s.toLowerCase().normalize("NFKC");

const entries: Entry[] = [];

// 議員
for (const l of getLegislators()) {
  const layer =
    l.level === "national"
      ? "国会（愛知選出）"
      : l.level === "prefectural"
        ? "愛知県議会"
        : (municipalityByGov(l.govCode)?.council ?? "市町村議会");
  entries.push({
    t: l.name,
    s: `${layer}・${l.district}${l.party ? `・${l.party}` : ""}`,
    u: `/legislators/${l.id}/`,
    k: "議員",
    q: norm([l.name, l.kana, l.district, l.party ?? "", layer].join(" ")),
  });
}

// 首長
for (const e of getExecutives()) {
  entries.push({
    t: `${e.name}（${e.area}${e.title}）`,
    s: e.level === "prefectural" ? "知事" : "市町村長",
    u: "/executives/",
    k: "首長",
    q: norm([e.name, e.kana ?? "", e.area, e.title].join(" ")),
  });
}

// 争点
for (const i of getIssues()) {
  entries.push({
    t: i.title,
    s: "争点（三層横串）",
    u: `/issues/${i.id}/`,
    k: "争点",
    q: norm([i.title, i.description, ...(i.keywords ?? [])].join(" ")),
  });
}

// 事実カード
for (const f of getFactCards()) {
  entries.push({
    t: f.title,
    s: "事実カード",
    u: `/facts/${f.id}/`,
    k: "事実カード",
    q: norm([f.title, f.hook, f.body].join(" ")),
  });
}

// 主要な機能ページ（検索からも到達できるよう手動で登録）
const PAGES: { t: string; s: string; u: string; q: string }[] = [
  {
    t: "議員をくらべる",
    s: "ページ・2人の議員を並べて比較",
    u: "/compare/",
    q: "議員をくらべる くらべる 比較 ひかく compare 対比",
  },
  {
    t: "選挙カレンダー",
    s: "ページ・次の選挙はいつ・任期満了",
    u: "/elections/",
    q: "選挙カレンダー せんきょ 次の選挙 いつ 任期満了 統一地方選 知事選 市長選 elections",
  },
  {
    t: "政党・会派の勢力図",
    s: "ページ・三層の会派構成",
    u: "/parties/",
    q: "政党 会派 かいは 勢力図 勢力 構成 parties 自民 立憲 公明 共産 減税",
  },
  {
    t: "教育でつかう",
    s: "ページ・主権者教育・調べ学習・ゼミでの活用ガイド",
    u: "/for-education/",
    q: "教育 きょういく 主権者教育 授業 学校 高校 大学 ゼミ 調べ学習 探究 引用 education",
  },
  {
    t: "愛知県知事選挙2027はいつ？",
    s: "ページ・任期満了日と仕組み・現職の記録",
    u: "/elections/aichi-governor-2027/",
    q: "知事選 ちじせん 愛知県知事選挙 2027 いつ 大村 任期 governor",
  },
  {
    t: "統一地方選挙2027（愛知）",
    s: "ページ・県議会・名古屋市会など何が選ばれるか",
    u: "/elections/unified-2027/",
    q: "統一地方選 とういつちほうせん 2027 愛知 県議選 市議選 改選 いつ",
  },
  {
    t: "県政・市政の歴史",
    s: "ページ・歴代知事6人・市長8人・投票率76年の推移",
    u: "/history/",
    q: "歴史 れきし 歴代知事 歴代市長 系譜 投票率 推移 桑原 本山 河村 大村 history",
  },
  {
    t: "財政：県と名古屋市の予算",
    s: "ページ・一般会計の歳入・歳出・税収の内訳",
    u: "/finance/",
    q: "財政 ざいせい 予算 よさん 決算 歳入 歳出 税収 一般会計 減税 finance",
  },
  {
    t: "集計方法の開示",
    s: "ページ・発言統計・会派多数の算出方法と限界",
    u: "/methodology/",
    q: "集計方法 方法論 ほうほうろん 統計 会派多数 乖離 methodology 開示",
  },
];
for (const p of PAGES) entries.push({ ...p, k: "ページ", q: norm(p.q) });

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "search-index.json");
writeFileSync(outPath, JSON.stringify(entries));
console.log(`✓ 検索インデックス生成: ${outPath}（${entries.length} 件）`);
