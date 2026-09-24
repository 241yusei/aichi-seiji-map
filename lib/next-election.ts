// 議員ごとの「次の選挙」の目安（純関数）。議員ページで「この人をいつ選び直せるか」を示す。
// 確実に言えることだけを書く。時期が決まっていない・データがない議会は null を返す（推測で埋めない）。

import type { Legislator } from "./types";

export interface NextElection {
  when: string; // 例: "2027年4月ごろ"
  what: string; // 例: "統一地方選挙（愛知県議会議員選挙）"
  note: string; // 時期の根拠と、確定のしかた
  href: string; // サイト内の詳しい説明
}

// 参議院 愛知県選挙区（定数4を3年ごとに半数改選）。任期は6年で、任期満了の月に通常選挙が行われる。
// 2022年7月当選の4人は2028年7月、2025年7月当選の4人は2031年7月に任期満了。
const SANGIIN_TERM_END: Record<string, string> = {
  "nat-4dd7b521": "2028年7月", // 藤川政人（2022年当選）
  "nat-2b393eda": "2028年7月", // 里見隆治（2022年当選）
  "nat-40de2cf3": "2028年7月", // 斎藤嘉隆（2022年当選）
  "nat-301067c0": "2028年7月", // 伊藤孝恵（2022年当選）
  "nat-b0189eb4": "2031年7月", // 酒井庸行（2025年当選）
  "nat-5c52b577": "2031年7月", // 田島麻衣子（2025年当選）
  "nat-fe2d66ba": "2031年7月", // 水野孝一（2025年当選）
  "nat-942cc447": "2031年7月", // 杉本純子（2025年当選）
};

const NAGOYA_GOV_CODE = "23100";

export function nextElectionFor(l: Legislator): NextElection | null {
  if (l.level === "national") {
    const sangiin = SANGIIN_TERM_END[l.id];
    if (sangiin) {
      return {
        when: `${sangiin}（任期満了）`,
        what: "参議院議員通常選挙（愛知県選挙区）",
        note: "参議院には解散がなく、任期は6年です。任期満了にあわせて通常選挙が行われます。",
        href: "/vote-guide/",
      };
    }
    return {
      when: "最長で2030年2月まで（解散があれば早まる）",
      what: "衆議院議員総選挙",
      note: "衆議院議員の任期は4年で、直近の総選挙は2026年2月8日でした。解散されると、その時点で任期が終わります。",
      href: "/vote-guide/",
    };
  }
  if (l.level === "prefectural") {
    return {
      when: "2027年4月ごろ",
      what: "統一地方選挙（愛知県議会議員選挙）",
      note: "今の任期は2027年4月29日まで。投票日は国の特例法と選挙管理委員会の告示で確定します。",
      href: "/elections/unified-2027/",
    };
  }
  if (l.level === "municipal" && l.govCode === NAGOYA_GOV_CODE) {
    return {
      when: "2027年4月ごろ",
      what: "統一地方選挙（名古屋市会議員選挙）",
      note: "前回は2023年4月の統一地方選挙でした。投票日は国の特例法と選挙管理委員会の告示で確定します。",
      href: "/elections/unified-2027/",
    };
  }
  return null;
}
