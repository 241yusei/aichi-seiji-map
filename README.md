# 愛知政治マップ（Aichi Politics Map）

愛知県の有権者が、**国会（愛知選出）・愛知県議会・名古屋市会**の代表者の発言・採決・政治資金を、
一次ソースに基づいて横断的に把握できる中立的な情報サイト。

- 設計思想・スコープ・絶対ルール → [`CLAUDE.md`](./CLAUDE.md)
- Phase 1 仕様（ページ・データモデル・受け入れ条件） → [`SPEC.md`](./SPEC.md)
- 中立・非投票誘導が大原則。すべてのデータに出典URLを付す。

## 技術スタック
Next.js 16 (App Router / 静的エクスポート) / TypeScript (strict) / Tailwind CSS 4 / ESM。
データは収集スクリプト → 正規化JSON（`/data`）→ 静的生成。AI要約は Anthropic API のバッチ。

## セットアップ
```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY 等を設定
npm run dev            # http://localhost:3000
```

## コマンド
| コマンド | 内容 |
|---|---|
| `npm run dev` / `build` / `start` | 開発 / 本番ビルド(→`out/`) / 起動 |
| `npm run lint` / `typecheck` / `validate` | Lint / 型 / データ検証(スキーマ＋相互参照) |
| `npm run seed:legislators` | 愛知選出 国会議員ロスターの seed 検証 |
| `npm run fetch:kokkai` | 国会会議録API → 発言 |
| `npm run fetch:nagoya` | 名古屋市会 議員名簿＋公式会議録リンク（発言本文は要許諾のため未取得） |
| `npm run fetch:kengikai` | 愛知県議会（出典リンクのみ） |
| `npm run fetch:votes` / `fetch:funding` | 採決 / 政治資金 |
| `npm run summarize` | AI要約バッチ（`data/summaries/` にキャッシュ） |
| `npm run build:issues` | 三層横串の争点データ生成 |

## データ取得の作法（重要）
- **国会**：会議録検索API（公開・無料）。直列・数秒間隔・キャッシュを厳守。
- **名古屋市会**：発言本文の外部公開は市へ要許諾のため、現状は**議員名簿＋公式会議録検索への原本リンク（linkout）のみ**。
  抜粋＋AI要約は市の許諾取得後に discussvision アダプタで追加する（それまで `speeches.municipal.json` は空のまま）。
- **愛知県議会**：会議録サイト（dbsr）は robots 実質 Disallow → **スクレイプせず出典リンクのみ**。
- robots.txt 再確認（2026-07-12）：`ssp.kaigiroku.net` は `Allow: /tenant/`（root と js/css/help/stats は Disallow）、
  `www.kensakusystem.jp` は robots.txt なし（HTTP 404）。いずれも robots 上は `/tenant/` 等の取得が可能だが、
  発言本文の再配布は規約・著作権上 要許諾のため取得しない（linkout を維持）。
- 詳細は `CLAUDE.md` の「データソースと取得方法」、運用方針は `~/.claude/aichi_seiji/`。

## ディレクトリ
```
app/         画面（App Router）        lib/         型・データ層・共通ロジック
components/   UIコンポーネント          lib/sources/ ソース・アダプタ（kokkai＝API／linkout＝出典リンク。discussvision等は将来用）
scripts/      収集・要約バッチ          data/        正規化JSON（一次ソースURL保持）
```

## ライセンス / 免責
本サイトは特定政党・候補者への投票／不投票を呼びかけません。AI要約には元発言リンクを併記します。
データの出典・訂正方針は `/about`（実装予定）に明記します。
