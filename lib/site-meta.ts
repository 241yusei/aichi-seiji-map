// サイトの編集・公開内容の更新日。各名簿・役職・資料の確認日を意味しない。
// 発言の照会日は data/speech-collection-status.json、収録期間は各データから求める。
export const LAST_UPDATED = "2026-10-24";

// 本番URL（JSON-LD・OGP等の絶対URL組み立てに使う）。
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://seiji-torisetsu.pages.dev";

// 公式SNSアカウント。設定するとフッターに導線が出る（中立ブランド「政治のトリセツ」名義）。
export const SITE_X = "https://x.com/seiji_torisetsu";
export const SITE_X_HANDLE = "@seiji_torisetsu"; // Xカード（twitter:site）用
export const SITE_THREADS = "https://www.threads.com/@seiji.torisetsu.aichi";
export const SITE_INSTAGRAM = "https://www.instagram.com/seiji.torisetsu.aichi/";
