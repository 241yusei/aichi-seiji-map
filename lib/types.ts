// 愛知政治マップ — データモデルの単一の真実（SPEC.md §4 準拠 + 拡張）
// すべてのデータ項目は一次ソースURL（sourceUrl）を必ず保持する。

/** 議会の層。SPEC.md が各議員に必須付与を求めるフィールド。 */
export type Level = "national" | "prefectural" | "municipal";

/** 会議録データの取得元ベンダー。Phase2/3 のアダプタ拡張に備えて型で表現する。 */
export type Vendor =
  | "kokkai" // 国会会議録検索システム API
  | "discussvision" // kaigiroku.net テナント（名古屋市会ほか）
  | "dbsr" // DB-Search（愛知県議会・将来用スタブ）
  | "corpus" // 地方議会会議録コーパス（将来・許諾後）
  | "kensakusystem" // kensakusystem.jp（豊田市ほか・Phase2）
  | "linkout"; // 出典リンクのみ（本文を保持しない）

/** 一次ソースへの参照。すべてのデータが出典を持つ原則の実体。 */
export interface SourceRef {
  url: string;
  vendor: Vendor;
  /** 全国地方公共団体コード（市単位アダプタの識別に使う） */
  govCode?: string;
  /** 取得日時（ISO 8601） */
  retrievedAt?: string;
}

export interface Legislator {
  id: string;
  name: string;
  kana: string;
  level: Level;
  party?: string; // 会派・所属政党
  district: string; // 例: "愛知1区" "比例東海" "名古屋市中区"
  photoUrl?: string;
  sourceUrl: string; // 公式プロフィール等の一次ソース
  govCode?: string; // 市区町村の場合の自治体コード
  vendor?: Vendor; // 主たる取得元
}

export interface Speech {
  legislatorId: string;
  date: string; // ISO 8601
  body: string; // 会議名・議会名
  text: string; // 発言全文または抜粋
  sourceUrl: string; // 会議録の一次ソース（必須）
  aiSummary?: string; // 中立・多視点の要約。元発言リンクを併記して表示する
  summaryModel?: string; // 要約に用いたモデル名（透明性のため記録）
  summaryGeneratedAt?: string; // 要約生成日時（ISO）
  /** 抜粋か全文か。全文転載が許されないソース（名古屋市会等）では true。 */
  isExcerpt?: boolean;
}

/** 安定 ID を持つ発言レコード。争点横串（Issue.relatedSpeechIds）の参照キー。 */
export interface SpeechRecord extends Speech {
  id: string;
}

export type VoteResult = "yea" | "nay" | "absent" | "not_recorded";

export interface Vote {
  legislatorId: string;
  billTitle: string;
  date: string;
  /** 記名投票でなければ "not_recorded"（個人の賛否は非公開）。 */
  result: VoteResult;
  sourceUrl: string;
}

export interface Funding {
  legislatorId: string;
  year: number;
  /** 報告した政治団体名（資金管理団体／後援会／政党支部など）。団体種別で金額規模が変わるため明示する。 */
  teamName?: string;
  totalIncome?: number;
  totalExpense?: number;
  sourceUrl: string; // 総務省・都道府県選管 収支報告書へのリンク（必須）
}

export interface Issue {
  id: string; // 例: "linear" "ev-shift"
  title: string; // 例: "リニア中央新幹線 名古屋開業"
  description: string;
  /** 国・県・市の発言を横串で結ぶ SpeechRecord.id の配列。 */
  relatedSpeechIds: string[];
  /** 横串検索・県市の会議録検索リンクに使うキーワード。 */
  keywords?: string[];
}

/** 争点の「一言でいうと」解説（説明報道カード）。中立・出典つき。 */
export interface IssueStance {
  label: string; // 例: "期待する声" "慎重な声"
  text: string;
}
export interface IssueExplainer {
  id: string; // Issue.id と一致
  subject: string; // 主語：誰の権限の話か（例: "国・県・市"）
  oneLine: string; // 一言でいうと
  youEffect?: string; // あなたに効くポイント（暮らし・財布への接続）
  whyImportant: string; // なぜ重要か
  now: string; // いま何が起きているか
  stances: IssueStance[]; // 立場の併記（賛否を中立に）
  // 論点の核（中立・等量併記）。賛成/反対の「最も強い主張」と「まだ答えの出ていない問い」。
  debate?: { pro: string; con: string; openQuestion: string };
  timeline?: { date: string; event: string; sourceUrl?: string }[]; // 時系列（evergreen運用）
  sources?: { label: string; url: string }[];
}

/** 収集の対象期間。 */
export interface DateRange {
  from: string; // ISO (YYYY-MM-DD)
  until: string; // ISO (YYYY-MM-DD)
}

/** 事実カードの数値・対比の1項目（カード表面に並べる）。 */
export interface FactCardPoint {
  label: string; // 例: "今枝宗一郎（自民・選挙区支部）" "リニア"
  value: string; // 例: "約1億547万円" "0件"
}

/** 事実カードの一次ソース（複数のPDF・公式ページを引けるよう配列で持つ）。 */
export interface FactCardSource {
  label: string;
  url: string;
}

/**
 * 矛盾・ギャップ型の一次事実カード（拡散の主砲）。
 * 中立を仕組みで担保するため caveat（誤解を避ける注記）と sources（一次ソース1件以上）を必須にする。
 * 評価語を使わず「記録」を見せるのが原則。
 */
export interface FactCard {
  id: string; // 例: "gap-funding-scale-2024"
  title: string; // 見出し（客観・評価語なし）
  hook: string; // ギャップの核を1行で
  cardType: "gap" | "contradiction" | "comparison";
  body: string; // 事実の説明（複数視点を含めてよい）
  caveat: string; // 中立注記（必須・誤解回避）
  points?: FactCardPoint[]; // カード表面に並べる数値・対比
  sources: FactCardSource[]; // 一次ソース（1件以上必須）
  relatedIssueIds?: string[]; // 関連する争点ID（Issue.id）
  relatedLegislatorIds?: string[]; // 関連する議員ID（Legislator.id）
  publishedAt: string; // 公開日（ISO 8601）
  updatedAt?: string; // 更新日（ISO 8601）
}

/** 議員の補足プロフィール（当選回数・役職・委員会）。出典つき。議員IDで結合する。 */
export interface LegislatorProfile {
  id: string; // Legislator.id
  electionCount: number; // 当該院での当選回数（0=未確認）
  positions: string[]; // 主な役職（大臣/副大臣/委員長/党役職など）
  committees: string[]; // 直近の所属委員会
  sourceUrl: string; // 公式プロフィール等の出典
  summary?: string; // 中立・客観の一言略歴
  homepage?: string; // 本人の公式サイト
  x?: string; // 本人の公式X（旧Twitter）
}

/**
 * 議会の議決（会期×主要議案）。県市の「何を可決/否決したか」を一次ソース付きで示す。
 * 個々の議員の賛否は原則非公開（多くは会派単位）。会派別の賛否は出典資料で確認する設計。
 */
export interface CouncilDecision {
  id: string;
  level: "prefectural" | "municipal";
  council: string; // 例: "名古屋市会" "愛知県議会"
  session: string; // 例: "令和8年2月定例会"
  billNumber?: string; // 例: "第1号"
  billTitle: string;
  category?: string; // 例: "予算" "条例" "意見書"
  result: string; // 例: "可決" "否決" "修正可決" "附帯決議を付して修正可決"
  /** 会派ごとの態度（公式の会派態度資料がある場合のみ）。stance例: "賛成" "反対" "賛成8・反対1" */
  factions?: { name: string; stance: string }[];
  note?: string;
  sourceUrl: string; // 公式の審議結果ページ（必須）
}

/** 首長（知事・市町村長）。議員とは別レイヤー。一次ソース（公式サイト）必須。 */
export interface Executive {
  id: string; // 例: "exec-23100"（govCode 由来）
  name: string;
  kana?: string;
  title: string; // 知事 / 市長 / 町長 / 村長
  level: "prefectural" | "municipal";
  govCode: string; // 23000（県）または市町村コード
  area: string; // "愛知県" "名古屋市" など
  party?: string;
  termStart?: string; // 就任日（ISO・任意）
  homepage?: string;
  sourceUrl: string; // 首長名を確認できた公式ページ（必須）
}
