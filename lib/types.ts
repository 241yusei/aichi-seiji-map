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
  totalIncome?: number;
  totalExpense?: number;
  sourceUrl: string; // 総務省 収支報告書へのリンク（必須）
}

export interface Issue {
  id: string; // 例: "linear" "ev-shift"
  title: string; // 例: "リニア中央新幹線 名古屋開業"
  description: string;
  /** 国・県・市の発言を横串で結ぶ SpeechRecord.id の配列。 */
  relatedSpeechIds: string[];
}

/** 収集の対象期間。 */
export interface DateRange {
  from: string; // ISO (YYYY-MM-DD)
  until: string; // ISO (YYYY-MM-DD)
}
