// 生活テーマ逆引き（/themes）。生活の言葉から国会発言（一次ソース付き）へ。
// タグ付けはビルド時のキーワード一致のみ（AI分類は使わない＝再現可能・捏造なし・低保守）。

import type { SpeechRecord } from "./types";

export interface Theme {
  id: string;
  label: string;
  blurb: string; // 1行・中立
  keywords: string[];
}

export const THEMES: Theme[] = [
  { id: "bukka", label: "物価・くらし", blurb: "物価高・生活費・光熱費など、毎日の家計にかかわる話。", keywords: ["物価", "生活費", "値上げ", "家計", "光熱費", "電気代", "ガソリン", "燃料価格"] },
  { id: "kosodate", label: "子育て・教育", blurb: "保育・学校・給食・奨学金など、子どもと学びの話。", keywords: ["子育て", "保育", "教育", "学校", "給食", "児童", "奨学金", "不登校", "待機児童"] },
  { id: "iryo", label: "医療・介護", blurb: "病院・介護・健康保険など、健康と老後の支えの話。", keywords: ["医療", "介護", "病院", "看護", "認知症", "健康保険", "医師", "薬価"] },
  { id: "hataraku", label: "働き方・賃金", blurb: "賃上げ・雇用・人手不足など、働くことの話。", keywords: ["賃金", "賃上げ", "雇用", "労働", "働き方", "最低賃金", "人手不足", "非正規"] },
  { id: "zeikin", label: "税金・財政", blurb: "減税・増税・予算など、集めたお金と使い道の話。", keywords: ["減税", "増税", "税制", "財政", "消費税", "国債", "課税"] },
  { id: "bosai", label: "防災・安全", blurb: "南海トラフ地震・豪雨・避難など、命を守る備えの話。", keywords: ["防災", "地震", "南海トラフ", "津波", "避難", "耐震", "豪雨", "治水", "減災"] },
  { id: "kotsu", label: "交通・まち", blurb: "鉄道・バス・道路・リニア・空港など、移動とまちの話。", keywords: ["交通", "鉄道", "バス", "道路", "リニア", "新幹線", "空港", "公共交通"] },
  { id: "sangyo", label: "産業・ものづくり", blurb: "自動車・中小企業・EVなど、愛知の仕事と経済の話。", keywords: ["製造業", "中小企業", "自動車", "EV", "半導体", "サプライ", "ものづくり", "産業"] },
  { id: "nogyo", label: "農業・漁業", blurb: "農家・漁業・食料など、食をつくる現場の話。", keywords: ["農業", "農家", "漁業", "食料", "農地", "畜産", "農林"] },
  { id: "kankyo", label: "環境・エネルギー", blurb: "脱炭素・再エネ・気候変動など、環境とエネルギーの話。", keywords: ["環境", "脱炭素", "再生可能エネルギー", "気候", "カーボン", "原子力", "エネルギー"] },
  { id: "kyosei", label: "外国人・共生", blurb: "外国人材の受け入れと、地域でともに暮らす話。", keywords: ["外国人", "多文化", "共生", "入管", "技能実習", "特定技能"] },
  { id: "digital", label: "デジタル・行政", blurb: "DX・マイナンバー・AIなど、行政と技術の話。", keywords: ["デジタル", "DX", "マイナンバー", "AI", "行政手続", "オンライン化"] },
];

export function themeById(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id);
}

/** テーマに合致する発言（キーワード一致・新しい順）。 */
export function matchThemeSpeeches(theme: Theme, speeches: SpeechRecord[]): SpeechRecord[] {
  return speeches
    .filter((s) => theme.keywords.some((k) => s.text.includes(k)))
    .sort((a, b) => b.date.localeCompare(a.date));
}
