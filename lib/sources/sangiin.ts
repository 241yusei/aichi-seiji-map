// 参議院「本会議投票結果」ページの解析（純粋関数・取得はしない）。
// 押しボタン投票・記名投票は、議員ごとの賛否が公式に公開されている。
// 一覧: https://www.sangiin.go.jp/japanese/touhyoulist/{回次}/vote_ind.htm
// 個別: https://www.sangiin.go.jp/japanese/touhyoulist/{回次}/{回次}-{MMDD}-v{NNN}.htm

export interface SangiinVoteItem {
  date: string; // ISO (YYYY-MM-DD)
  billTitle: string; // 公式の案件名
  url: string; // 個別の投票結果ページ（絶対URL）
}

export interface SangiinBallot {
  name: string; // 空白を除いた氏名（例: "藤川政人"）
  faction: string; // 投票時の会派名（人数表記を除く）
  vote: "yea" | "nay";
}

export interface SangiinVoteResult {
  total: number;
  yea: number;
  nay: number;
  ballots: SangiinBallot[];
}

const BASE = "https://www.sangiin.go.jp/japanese/touhyoulist";

export function indexUrl(session: number): string {
  return `${BASE}/${session}/vote_ind.htm`;
}

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").trim();
const removeSpaces = (s: string) => s.replace(/[\s　]+/g, "");

/** 「令和08年7月24日」→ "2026-07-24" */
function reiwaToIso(label: string): string | null {
  const m = label.match(/令和\s*0?(\d+)年\s*(\d+)月\s*(\d+)日/);
  if (!m) return null;
  const year = 2018 + Number(m[1]);
  return `${year}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

/** 一覧ページから、日付つきの投票案件を取り出す。日付は rowspan の見出しセルで区切られている。 */
export function parseIndex(html: string, session: number): SangiinVoteItem[] {
  const items: SangiinVoteItem[] = [];
  let currentDate: string | null = null;
  const rowRe = /<TR>([\s\S]*?)<\/TR>/gi;
  for (const row of html.matchAll(rowRe)) {
    const cells = row[1];
    const th = cells.match(/<TH[^>]*class="touhyo_date"[^>]*>([\s\S]*?)<\/TH>/i);
    if (th) currentDate = reiwaToIso(stripTags(th[1]));
    const a = cells.match(/<A\s+HREF="([^"]+)"[^>]*>([\s\S]*?)<\/A>/i);
    // PDF（首相指名の記名投票など）は解析できないので対象外。
    if (!a || !currentDate || !/\.htm$/i.test(a[1])) continue;
    items.push({
      date: currentDate,
      // 「日程第１ 」などの議事日程番号は案件名ではないので外す。
      billTitle: stripTags(a[2])
        .replace(/　/g, " ")
        .replace(/^日程第[0-9０-９]+\s*/, ""),
      url: `${BASE}/${session}/${a[1]}`,
    });
  }
  return items;
}

/** 個別ページから、会派ごとの賛否を取り出す。合計が公式の「投票総数」と一致するか検証できるよう総数も返す。 */
export function parseResult(html: string): SangiinVoteResult {
  const totals = html.match(/投票総数\s*(\d+)[\s\S]*?賛成票\s*(\d+)[\s\S]*?反対票\s*(\d+)/);
  const ballots: SangiinBallot[] = [];
  const blockRe = /<h4 class="party">([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4 class="party">|<\/main>|$)/g;
  for (const block of html.matchAll(blockRe)) {
    const faction = stripTags(block[1]).replace(/\(\s*\d+名\)/, "").trim();
    const giinRe =
      /<span class="pros">([\s\S]*?)<\/span><span class="cons">([\s\S]*?)<\/span><span class="names">([\s\S]*?)<\/span>/g;
    for (const g of block[2].matchAll(giinRe)) {
      const pros = stripTags(g[1]);
      const cons = stripTags(g[2]);
      if (!pros && !cons) continue;
      ballots.push({ name: removeSpaces(stripTags(g[3])), faction, vote: pros ? "yea" : "nay" });
    }
  }
  return {
    total: totals ? Number(totals[1]) : NaN,
    yea: totals ? Number(totals[2]) : NaN,
    nay: totals ? Number(totals[3]) : NaN,
    ballots,
  };
}
