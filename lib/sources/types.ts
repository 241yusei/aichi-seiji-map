// ソース・アダプタ抽象化の核。
// Phase2/3（県内主要市→54市町村）は、本インターフェイスを満たすアダプタを
// 足すだけで拡張できる。収集ロジックを「市単位（ベンダー単位）」に分離する。

import type { DateRange, Legislator, Level, Speech, Vendor } from "../types";

/** ソースが提供できるデータ種別と、取得物の再配布可否。 */
export interface SourceCapabilities {
  speeches: boolean;
  votes: boolean;
  funding: boolean;
  /**
   * 取得した発言「全文」を自サイトに転載・再配布してよいか。
   * 名古屋市会などは規約上 false（抜粋＋AI要約＋原本リンクに留める）。
   * 国会会議録 API（公開API）は true。
   */
  fulltextRedistribution: boolean;
}

/**
 * 発言ソースの共通インターフェイス。
 * - kokkai: 国会会議録検索 API
 * - discussvision: kaigiroku.net テナント（名古屋市会、将来は他市も tenant 名で追加）
 * - linkout: 出典リンクのみ（愛知県議会＝dbsr のように本文取得が許されないソース）
 * - corpus / dbsr / kensakusystem: 将来用
 */
export interface SpeechSource {
  id: string;
  vendor: Vendor;
  level: Level;
  /** 市区町村の自治体コード（市単位アダプタの識別） */
  govCode?: string;
  capabilities: SourceCapabilities;
  /** 当該ソースが扱う議員一覧を返す。 */
  fetchLegislators(): Promise<Legislator[]>;
  /**
   * 指定議員の発言を期間で返す。
   * 本文を保持しないソース（linkout）は空配列を返し、出典は Legislator.sourceUrl で示す。
   */
  fetchSpeeches(legislator: Legislator, range: DateRange): Promise<Speech[]>;
}
