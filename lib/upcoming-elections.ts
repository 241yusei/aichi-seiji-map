// 「次にあなたが投票できる選挙」（予定）。任期満了日に基づく見込みで、時期は告示により確定する。
// 中立・非誘導：日程の事実のみを示し、投票先には一切ふれない。出典は選管・公式情報の入口。

export interface UpcomingElection {
  name: string;
  timing: string; // 例: "2027年2月ごろ"
  basis: string; // 根拠（任期満了など）
  sourceLabel: string;
  sourceUrl: string;
}

export const UPCOMING_ELECTIONS: UpcomingElection[] = [
  {
    name: "愛知県知事選挙",
    timing: "2027年2月ごろ",
    basis: "現職の任期満了（2023年2月就任・任期4年）に伴う見込み",
    sourceLabel: "愛知県選挙管理委員会",
    sourceUrl: "https://www.pref.aichi.jp/soshiki/senkyo/",
  },
  {
    name: "愛知県議会議員選挙",
    timing: "2027年4月ごろ（統一地方選）",
    basis: "2023年4月当選の任期満了に伴う見込み",
    sourceLabel: "愛知県選挙管理委員会",
    sourceUrl: "https://www.pref.aichi.jp/soshiki/senkyo/",
  },
  {
    name: "名古屋市会議員選挙",
    timing: "2027年4月ごろ（統一地方選）",
    basis: "2023年4月当選の任期満了に伴う見込み",
    sourceLabel: "名古屋市公式サイト",
    sourceUrl: "https://www.city.nagoya.jp/",
  },
  {
    name: "参議院議員通常選挙",
    timing: "2028年夏ごろ",
    basis: "3年ごとの半数改選（前回2025年）",
    sourceLabel: "総務省（選挙）",
    sourceUrl: "https://www.soumu.go.jp/senkyo/",
  },
  {
    name: "名古屋市長選挙",
    timing: "2028年11月ごろ",
    basis: "現職の任期満了（2024年11月就任・任期4年）に伴う見込み",
    sourceLabel: "名古屋市公式サイト",
    sourceUrl: "https://www.city.nagoya.jp/",
  },
  {
    name: "衆議院議員総選挙",
    timing: "時期未定",
    basis: "解散があれば実施（任期満了は2030年2月）",
    sourceLabel: "総務省（選挙）",
    sourceUrl: "https://www.soumu.go.jp/senkyo/",
  },
];
