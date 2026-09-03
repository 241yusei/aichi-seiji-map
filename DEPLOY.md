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
   npm run build:issues                                  # 争点の横串
   ```
3. 検証＋ビルド：
   ```bash
   npm run check        # typecheck → lint → (prebuild: validate) → build
   ```
   `out/` が生成される。

## A. Vercel（旧本番・移行済み）
> 2026-09-03 に本番を Cloudflare Pages へ移行した。Vercel 側を残す場合は、
> 重複インデックスを避けるため Cloudflare へのリダイレクトを設定すること。

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

### 定期再ビルド（**公選法配慮のため必須**）
選挙期間中バナーと「データ基準日」は**ビルド時点で固定**される。告示日を過ぎても再ビルド
しなければガードは表示されない。`.github/workflows/scheduled-rebuild.yml` が毎日 1 回
Cloudflare のデプロイフックを叩いて再ビルドする。有効化には次の設定が要る:

1. Pages プロジェクト → Settings → Builds & deployments → **Deploy hooks** で新規フックを作成
2. 発行された URL を GitHub リポジトリの Secrets に `CLOUDFLARE_DEPLOY_HOOK` として登録

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
