# デプロイ手順（愛知政治マップ）

静的サイト（Next.js `output: "export"`）。ビルドで `out/` に全ページが書き出されるので、
静的ホスティング（Vercel / Cloudflare Pages 等）に配信する。

## 0. デプロイ前の準備
1. 本番ドメインを決め、環境変数 `NEXT_PUBLIC_SITE_URL` に設定（例 `https://aichi-seiji.jp`）。
   → `sitemap.xml` / `robots.txt` / OGメタの絶対URLに反映される。
2. データを最新化：
   ```bash
   npm run seed:legislators && npm run fetch:kokkai      # 国会
   npm run fetch:nagoya && npm run fetch:kengikai        # 名古屋市会・愛知県議会
   npm run fetch:toyota                                  # 豊田市議会（Phase2）
   # AI要約（任意・要 ANTHROPIC_API_KEY）
   npm run summarize
   npm run build:issues                                  # 未確認候補のみ生成（公開データは保持）
   ```
3. 検証＋ビルド：
   ```bash
   npm run check        # typecheck → lint → (prebuild: validate) → build
   ```
   `out/` が生成される。

## A. Vercel（旧本番・移行済み）
> 2026-09-03 に本番を Cloudflare Pages へ移行した。Vercel 側を残す場合は、
> 重複インデックスを避けるため Cloudflare へのリダイレクトを設定すること。

旧本番ホストは `aichi-seiji-map.vercel.app`。`vercel.json` は、このホストだけを
`https://seiji-torisetsu.pages.dev/:path*` へ308恒久転送する設定。パスを維持し、
クエリはVercelの仕様で引き継ぐ。CloudflareとVercelのプレビュー用ホストは対象外。
同ファイルの `buildCommand` で `NEXT_PUBLIC_SITE_URL` をCloudflare URLに明示し、
Vercel側の既存環境変数が旧URLでも、生成される正規URLを新URLに統一する。
設定ファイルのローカル検証だけでは公開済みとはしない。Vercelへの適用・再デプロイは
本人の公開承認後に行い、実応答の `Location` と検索・比較URLの条件保持を確認する。
確認結果、適用対象、巻戻しは [正規URL移行手順](docs/canonical-migration-2026-10-26.md) を参照。

- リポジトリを Vercel に接続（Framework Preset: Next.js）。
- Environment Variables に `NEXT_PUBLIC_SITE_URL`（と要約を運用するなら `ANTHROPIC_API_KEY` をビルド前のデータ生成で使う場合のみ）。
- Build Command: `npm run build` / Output: `out`（`output: export` のため自動。必要なら Output Directory を `out` に）。
- CLI: `npm i -g vercel && vercel --prod`（初回はログイン要）。

## B. Cloudflare Pages（**現在の本番**）

本番URL: https://seiji-torisetsu.pages.dev （Pages プロジェクト名 `seiji-torisetsu`）

### 手動デプロイ（CLIから即時反映）
```bash
NEXT_PUBLIC_SITE_URL="https://seiji-torisetsu.pages.dev" npm run build
npx wrangler pages deploy out --project-name=seiji-torisetsu
```

### Git連携（推奨・pushで自動デプロイ）
- Cloudflare ダッシュボード → Workers & Pages → 対象プロジェクト → Settings → Builds & deployments
  → GitHub リポジトリを接続。
- Build command: `npm run build` ／ Build output directory: `out`
- 環境変数: `NEXT_PUBLIC_SITE_URL=https://seiji-torisetsu.pages.dev`

### 選挙期間の注意書き（再ビルド不要）
選挙期間中の注意書き（`components/ElectionPeriodBanner.tsx`）は、`data/election-windows.json` の
期間を**閲覧時にブラウザが日本時間で判定**して表示する。静的サイトでも再ビルドに依存しない
（ビルド日が期間内なら、JSが動かない環境でも表示される）。新しい選挙は告示日より前に
`data/election-windows.json` へ登録し、一度デプロイしておけばよい。
SNS自動投稿（`scripts/buffer_post.py`）も同じファイルで期間中の投稿を止める。

> 旧方式（Cloudflare デプロイフックで毎日再ビルド）は、Pages が Git 未連携のため
> フックを発行できず動作しなかったので 2026-09-25 に廃止した。

### 静的配信の設定
`public/_headers` で、セキュリティヘッダ（nosniff / Referrer-Policy / X-Frame-Options /
Permissions-Policy）と、`/_next/static/*` の長期キャッシュを指定している。

## C. データ更新の自動化（`.github/workflows/data-refresh.yml`）

国会発言（国会会議録API）は毎週火曜 朝6時（JST）に自動取得し、差分があればPRを作成する
（**自動マージはしない**。中立性・出典の最終確認は人が行う）。2026年7月〜9月に手動運用へ
依存して約2か月分のデータが欠落した反省から追加した。

- `workflow_dispatch` で手動実行も可能（`from` 入力で取得開始日を指定できる。省略時は直近90日）
- PRには typecheck / lint / validate 済みの差分が乗る（`npm run build` は含まれないため、
  マージ前に一度ローカルかCIでビルド確認をすること）
- 対象は国会（API提供・低頻度アクセスが明文で許可されている）のみ。県議会・市議会のスクレイピング
  は規約確認の重みが異なるため、無人の定期実行には含めていない（手動 `npm run fetch:*` を継続）
- 新規発言のAI要約（`npm run summarize`）は含まれない。要 `ANTHROPIC_API_KEY`、別途手動実行

## 注意
- 上記以外のデータ更新は手動バッチ（リアルタイム更新なし）。更新後に再ビルド→再デプロイ。
- `data/raw/`・`.env` はコミットしない（`.gitignore` 済み）。
- 県議会(dbsr)・各市会の本文は転載せず会議録検索へリンクする方針を維持すること（規約・robots遵守）。


## データの確認日と編集確認（2026-10-22）

- `lib/site-meta.ts` の `LAST_UPDATED` はサイトの編集内容の更新日。国会発言の取得だけで名簿・所属・役職の確認日を更新しない。
- 国会発言の照会成否・対象期間は `data/speech-collection-status.json` に保存する。一部失敗の場合は全件成功日を進めず、非ゼロ終了する。収録発言の最古・最新日は収録範囲であり、全発言の網羅性を示さない。
- `npm run build:issues` は `data/raw/issue-candidates/latest.json` に未確認候補を出す。公開する `data/issues.json` は変更しない。原文を確認した関連付けのみを手で追記し、`npm run validate` と回帰テストを通したPRで扱う。
- 暮らしの3テーマは `data/living-topics.json`。具体案件・確認日・記述別の出典IDを保持する。未確認の費用や予定日は未確認と書き、推測で補わない。
- 過去の事実カードは集計時点 `asOf` と保存版 `historical`、訂正日 `updatedAt` を分ける。
- `npm test` は外部通信を差し替えた使い捨てfixtureのみ。収集API・本番・要約APIには接続しない。


## 名簿照合の更新手順（2026-10-23）

- 対象の公式現職一覧と、政党/会派・委員会・役職資料を個別に照合する。国の所属政党と議会会派を混同しない。現職数・欠員数と既存IDを確認する。
- `verification` は名簿とseedの双方に保存する。`checkedAt` は実際の資料確認日。`sourceAsOf` は本文に明示された資料基準日のみとし、ページ更新日から推定しない。役職・委員会はプロフィール側に根拠を付ける。
- 全項目を一括で確認済みにせず、確認できない項目は理由付きで `unconfirmed`、指定した公式資料に掲載がない項目は理由付きで `not_listed` にする。経歴・当選回数の再確認を意味しない。
- 国会・県議会・名古屋市会ごとの調査記録 `data/roster-verification-*.json` を更新。取得条件、対象ID、修正点と未確認事項を残し、`npm run validate` で個別記録との整合を確認する。
- `seed:legislators` と共通名簿生成処理は明示IDと確認記録を保持する。氏名訂正時にハッシュを再付番せず、既存の発言・採決・資金の参照を保つ。試験は使い捨てfixtureで行う。
- `data/speech-import-pr93.json` はPR #93取込時点の履歴。将来の発言追加で件数が増えても、この履歴を現在件数へ書き換えない。今回の取得ログを根拠とする照会成功日は10月20日、資料の取込確認日は10月23日。

## 利用段階の件数計測（2026-10-23実装・2026-10-30本番有効化）

静的Next exportは維持し、`functions/api/usage.ts` をPages Functionsとして併設する。
`public/_routes.json` はビルド時に `out/_routes.json` へコピーされ、`/api/usage` と末尾スラッシュ付きの同パスだけをFunctionsへ渡す。通常ページや静的アセットはFunctionsを起動しない。

### 保存する内容と限界

POSTは `application/json` の厳密な `{version:1,event:UsageEventName}` のみ、実体256bytes以下、クエリなし、設定したOriginとリクエスト先Originの一致を必須とする。受信処理はリクエスト・本文・例外をログ出力しない。
Analytics Engineへ渡すのは固定index `journey-v1`、blob1の許可イベント名、double1の固定値1だけ。
地域名・郵便番号・議員・政党・テーマ・URL・検索語・利用者ID・IP・UA・Refererは保存項目に含めない。
これはアプリ独自の計測データの扱いであり、配信基盤がHTTP通信を処理することや既存のプラットフォームログを無効化することを意味しない。

イベントは `region_step_viewed` / `region_selected` / `representative_viewed` / `living_topic_viewed` / `source_reference_opened` / `source_external_opened` の6種。
ブラウザ内の段階状態から発生するイベント件数を比較する。利用者を追跡しないため、人数・ユニークユーザー・個人単位の遷移率・完全な閲覧数は測れない。中断、拒否、失敗、重複・偽装リクエストの影響を受ける概数として扱う。

### 有効化と配信の境界

2026-10-23のPR作成時はdataset作成、課金契約、本番設定変更、デプロイ、実イベント送信を行っていない。
2026-10-30の本番反映依頼に合わせ、`wrangler.toml` の本番だけを `USAGE_ENABLED="true"` とした。開発・Previewは無効、Previewはbindingなし・Origin空を維持する。
本番の `USAGE_ANALYTICS` bindingはdataset `seiji_usage` を指定するが、無効状態では書き込まない。datasetは最初の書込時に作成される。
未設定・無効・bindingなしではPOSTを破棄して204、GETは `{enabled:false}` を返す。有効時も受信・保存の失敗で本体操作を止めない。
GETは同じ配信Originからだけ有効状態を返し、応答はすべて `Cache-Control: no-store`。

初回の**承認済みデプロイ時**に、以下を確認する。

1. 既存Pagesプロジェクトの本番branch、build command/output、環境変数、binding、互換日付を照合する。Wrangler設定は指定項目のsource of truthとなるため、既存設定を無確認で上書きしない。既存のbuild設定や秘密情報をこのファイルへ転記しない。
2. 本番Originが `https://seiji-torisetsu.pages.dev` のままか確認する。独自ドメインへ変更する場合は `env.production.vars.USAGE_SITE_ORIGIN` を正確なOrigin（末尾`/`なし）へ変更する。Previewは無効を維持する。
3. 料金・無料枠と実アカウントのWorkers契約を再確認する。有効化が承認された場合のみ `env.production.vars.USAGE_ENABLED` を `"true"` へ変更してレビューする。設定ファイルで管理する変数はダッシュボード側での変更に依存しない。無効化も同値を `"false"` に戻した承認済み再デプロイで行う。
4. 通常の検証・静的ビルド後、リポジトリのルートから既存の `wrangler pages deploy out --project-name=seiji-torisetsu` 手順でFunctionsとbinding設定を一緒に配信する。出力フォルダだけのダッシュボードへのドラッグ＆ドロップではFunctionsは配信できない。production branchとPreviewの区別を確認して実行する。

2026-10-30の再確認：既存プロジェクトはproduction branch `main`、Git未連携、既存の環境変数・外部bindingなし、compatibility date `2026-09-03`、usage model `standard`。既存の秘密情報やbindingを上書きする変更はない。新しいFunctionsはPRの `2026-10-23` 互換日付で配信する。公式料金頁はAEを現在未課金・将来の料金表を予告中とし、保存期間は3か月のまま。契約一覧APIは現在の認証では403のため、実アカウントのFree/Paid区分は未確認。`standard` だけから無料契約と判断せず、今回の作業で有料プランへの変更・新規契約は行わない。Functionsは既存Workers契約の利用枠へ算入される。課金や契約変更を要求された場合はその変更を行わず、計測を無効として配信できる。

公開後は本番 `/api/usage` のGETが `{enabled:true}`、固有デプロイURL・PreviewのGETが `{enabled:false}` であることを確認する。本番に試験イベントをPOSTしない。GETの有効応答は設定とbindingの存在確認であり、実イベントの保存成功や利用実績の証明ではない。実際の保存・集計は運用開始後の集計結果で別に確認する。

### オフライン検証

`npm test` の `tests/usage-server.test.ts` は使い捨てfake bindingだけを使う。許可イベント以外・余分キー・異Origin・クエリ・大きい本文を拒否し、保存値が固定index/イベント名/1だけであること、無効状態と保存失敗でも204であることを検証する。
Cloudflare公式資料ではPagesのAnalytics Engine bindingはローカル利用不可。`wrangler pages dev out` だけで本番datasetへの保存成功を確認したことにはしない。`--remote`、実SQL API、実bindingへの試験書込はこのオフライン検証に含めない。

### 集計・料金・保持期間

確認日2026-10-30の公式資料では、FunctionsはWorkers Freeと合算100,000requests/日、AEはFreeの100,000writes/日・10,000read queries/日が含まれる。PaidのAEは月10,000,000writes・1,000,000read queriesが含まれる料金表。AE料金頁は現在未課金・今後課金開始予定と記載しており、実契約のFree/Paid区分や恒久無料を保証しない。AEの保存期間は3か月。
本番有効化後の必要な集計は、Account Analytics Read権限のtokenを運用者の安全な環境だけで使い、`POST https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql` に次のSQLを送る。tokenをクライアント・リポジトリ・公開環境変数へ置かない。

```sql
SELECT
  formatDateTime(timestamp, '%Y-%m-%d', 'Asia/Tokyo') AS day,
  blob1 AS event,
  SUM(_sample_interval) AS event_count
FROM seiji_usage
WHERE timestamp >= NOW() - INTERVAL '30' DAY
GROUP BY day, event
ORDER BY day, event
FORMAT JSON
```

AEにはサンプリングがあるため、件数は `COUNT()` ではなく `SUM(_sample_interval)` で集計する。長期比較が必要なら、個別イベントを持ち出さず日別イベント件数だけを保存する運用を別途判断する。この実装ではSQL実行・自動exportは行わない。

根拠: [Pages binding](https://developers.cloudflare.com/pages/functions/bindings/)、[Functions routing](https://developers.cloudflare.com/pages/functions/routing/)、[Wrangler設定](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)、[Functions料金](https://developers.cloudflare.com/pages/functions/pricing/)、[AE料金](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)、[AE保持期間](https://developers.cloudflare.com/analytics/analytics-engine/limits/)、[AE SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)、[サンプリング](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)。


## 検索向けの説明・静的リンク・サイトマップ（2026-10-31）

- 名簿の対象地域と、発言本文・採決・政治資金の個人記録の収録範囲を分ける。共通紹介・比較・地域案内でも全議員に同じ記録が揃うと説明しない。議員descriptionは収録データの有無から記述し、未収録を活動なしと扱わない。
- `/legislators/` はクライアントの絞り込みに加え、県議を選挙区別に探せる通常リンクを静的HTMLへ出力する。折りたたみを閉じた初期状態でも氏名リンクを保持する。
- サイトマップの `lastmod` は、ページ単位の実質的変更日を保持できるまで省略する。`LAST_UPDATED`（サイトの編集更新日）や資料確認日、ビルド時刻を全URLへ流用しない。確認日・集計基準日等のデータは編集日と独立して保持する。
- `npm run build` 後に `npm run check:seo` を実行する。生成済み `out/` とローカル収録データを読み、正規URL・サイトマップ整合、ホーム起点のHTMLリンク到達性、地方議員descriptionの未収録表示を検査する。外部通信・ファイル書込は行わない。
- この検査は検索エンジンの登録・順位・AI回答での引用を証明するものではない。Search Console等の観測と公開後の確認は別に行う。


## 地域入口・暮らしテーマの検索説明（2026-10-31）

- 3テーマの見出しとmetadataは `data/living-topics.json` の具体案件名・`pageTitle`・対象地域・対象年度から組み立てる。既存URL・canonicalと出典アンカーを保持し、一般的な争点の背景解説も残す。
- `confirmedAt` は解説全体の確認日。特定資料の再確認は `sources[].checkedAt` と確認範囲 `checkNote` に記録する。案内ページの更新日、計画修正日、実績年度を同じ日付として扱わない。
- `npm run check:seo` は3テーマのH1・検索/OG説明・地域・対象年度・確認日・公式出典リンクも生成HTMLで検査する。検索掲載・AI引用の実績とは別の確認。
