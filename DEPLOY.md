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

## A. Vercel
- リポジトリを Vercel に接続（Framework Preset: Next.js）。
- Environment Variables に `NEXT_PUBLIC_SITE_URL`（と要約を運用するなら `ANTHROPIC_API_KEY` をビルド前のデータ生成で使う場合のみ）。
- Build Command: `npm run build` / Output: `out`（`output: export` のため自動。必要なら Output Directory を `out` に）。
- CLI: `npm i -g vercel && vercel --prod`（初回はログイン要）。

## B. Cloudflare Pages
- プロジェクト作成 → Build command: `npm run build` / Build output directory: `out`。
- 環境変数に `NEXT_PUBLIC_SITE_URL`。
- もしくは `npx wrangler pages deploy out`（要ログイン）。

## 注意
- データ更新は手動バッチ（リアルタイム更新なし）。更新後に再ビルド→再デプロイ。
- `data/raw/`・`.env` はコミットしない（`.gitignore` 済み）。
- 県議会(dbsr)・各市会の本文は転載せず会議録検索へリンクする方針を維持すること（規約・robots遵守）。
