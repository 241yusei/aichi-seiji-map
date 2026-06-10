// 寄付（Stripe Payment Links）の一元管理。本番化のときはここのURLを live モードのものに差し替える。
// ※現状は Stripe テストモードのリンク（URLに test_ を含む）。実カードの決済はできない。
//   live で受け付けるには Stripe アカウントの本番有効化（KYC）→ live の Payment Link を発行して差し替える。

export interface DonationOption {
  amountLabel: string;
  url: string;
}

// 一度の寄付（金額プリセット）。空配列なら /support は「準備中」を表示する。
// ※Stripeはアカウント審査中（寄付＝クラウドファンディング扱いの可能性で異議申し立て中）のため、
//   本番リンクは未掲載。承認されたら live の Payment Link URL を下に入れる（テスト用URLは出さない）。
//   不可となった場合は OFUSE / note メンバーシップ等の補完チャネル（app/support の定数）に切り替える。
export const DONATION_ONE_TIME: DonationOption[] = [];

// 毎月の継続支援（サブスク）。未作成なら空文字。
export const DONATION_MONTHLY = "";

// リンクが Stripe のテストモード（URLに test_ を含む）かどうか。true の間は注意書きを出す。
export const DONATION_IS_TEST =
  DONATION_ONE_TIME.some((o) => o.url.includes("/test_")) || DONATION_MONTHLY.includes("/test_");
