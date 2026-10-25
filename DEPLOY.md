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
