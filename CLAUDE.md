# 愛知政治マップ（Aichi Politics Map）

愛知県の有権者が、**国会・愛知県議会・名古屋市会**の代表者の発言・投票・政治資金を、
一次ソースに基づいて横断的に把握できるサイト。中立・非投票誘導が大原則。
「国会議員マップ（kokkaimap.jp）」の設計思想を、愛知の地方政治まで広げた地域特化版。

このファイルは Claude Code が毎セッションの冒頭で読む。実装の前に必ず `SPEC.md` も読むこと。

---

## スコープ（Phase 1）

対象に**含む**：
- 国会：愛知の衆院小選挙区（1〜16区）／比例東海のうち愛知関係議員／参院愛知県選挙区
- 県：愛知県議会議員
- 市：名古屋市会議員

対象に**含まない**（Phase 2 以降）：
- 名古屋市以外の市町村議会（豊田・岡崎・一宮 等）
- リアルタイム更新、ネイティブアプリ、ログイン機能
- 口コミ投稿・応援金（製品判断が未確定。Phase 1 では実装しない）

スコープを勝手に広げないこと。新しい範囲が必要なら、まず提案して確認を取る。

---

## 技術スタック

- フレームワーク：Next.js（App Router）／静的生成（SSG）中心
- 言語：TypeScript
- スタイル：Tailwind CSS
- データ：収集スクリプト → 正規化 → JSON（`/data` 配下）にコミット。Phase 1 はDB不要
- AI要約：Anthropic API のバッチ処理。中立・多視点の要約方針
- ホスティング：Vercel もしくは Cloudflare Pages を想定

---

## ディレクトリ構成（想定）

```
/app            … 画面（ルーティング）
/components     … UIコンポーネント
/lib            … 共通ロジック（取得・整形・型）
/scripts        … データ収集・要約バッチ（手動実行）
/data           … 収集済みの正規化JSON（一次ソースURLを必ず保持）
SPEC.md         … Phase 1 仕様書
CLAUDE.md       … このファイル
```

---

## コマンド

開発・検証：
- `npm run dev`        … 開発サーバ
- `npm run build`      … 本番ビルド（静的生成 → `out/`）
- `npm run lint`       … Lint（ESLint flat config）
- `npm run typecheck`  … 型チェック（`tsc --noEmit`）
- `npm run validate`   … `/data` の検証（スキーマ＋相互参照。ビルド前ゲート）

データ収集（手動バッチ・`/scripts`。レート制御を厳守）：
- `npm run seed:legislators` … 愛知選出 国会議員ロスターの seed 検証 → `legislators.aichi.json`
- `npm run fetch:kokkai`     … 国会会議録API → `speeches.national.json`
- `npm run fetch:nagoya`     … 名古屋市会（discussvision）→ 抜粋＋原本リンク
- `npm run fetch:kengikai`   … 愛知県議会（linkout）→ 出典リンクのみ
- `npm run fetch:votes`      … 採決（参院記名・他は not_recorded）
- `npm run fetch:funding`    … 政治資金（出典リンク＋主要項目）
- `npm run summarize`        … AI要約バッチ（Anthropic API。要約は `data/summaries/` にキャッシュ）
- `npm run build:issues`     … 争点シード → 三層横串の `issues.json`

（コマンドは実装に合わせて随時このファイルを更新する）

---

## データソースと取得方法（重要）

### 国会（発言）— API あり
- 国会会議録検索システム API: https://kokkai.ndl.go.jp/api.html
- エンドポイント：`/api/meeting_list`（会議単位簡易）`/api/meeting`（会議単位）`/api/speech`（発言単位）
- 主なパラメータ：`speaker` `nameOfHouse` `from` `to` `maximumRecords` `recordPacking=json`
- **手続き不要・無料**。ただし以下のレート制御を厳守すること：
  - 短時間の大量アクセス禁止／並列リクエスト禁止
  - 1リクエスト取得後、**数秒空けてから**次を実行
  - 取得済みデータはローカルにキャッシュし、再取得を最小化

### 国会（採決）
- 衆議院・参議院 公式サイトの本会議投票結果
- 注意：すべての採決が記名投票ではない（**記名投票**と**起立採決**がある）。
  記名でない採決は個人の賛否が公開されない旨を、UIで明示すること。

### 政治資金
- 総務省「政治資金収支報告書」（公表データ／PDF）
- パースが難しいため Phase 1 では「出典リンク掲示＋主要項目のみ」に留めてよい。

### 愛知県議会（発言）— API なし → スクレイピング
- 会議録検索システム：https://www.pref.aichi.dbsr.jp/

### 名古屋市会（発言）— API なし → スクレイピング
- 会議録・委員会記録検索システム：https://ssp.kaigiroku.net/tenant/nagoya/SpTop.html

### スクレイピングの作法（県・市で必須）
- 着手前に各サイトの `robots.txt` と利用規約を確認し、許可範囲でのみ取得する
- アクセスは低頻度・直列、適切な User-Agent を付け、結果はキャッシュする
- 規約上問題がありそうな場合は、勝手に進めず必ず報告して確認を取る

---

## コーディング規約

- TypeScript の `strict` を有効にする
- import は ES Modules（`import`/`export`）。CommonJS は使わない
- データ型（議員・発言・採決・政治資金・テーマ）は `/lib/types.ts` に集約
- 各データ項目は **一次ソースURL** を必ずフィールドとして保持する
- 巨大コンポーネント禁止。1ファイル1責務を基本とする

---

## 絶対ルール（妥協しない）

1. **中立性**：特定政党・候補者・議員への投票/不投票を呼びかけない。比較は事実ベース。
2. **公職選挙法への配慮**：特に選挙期間中の表示は投票誘導と取られない設計にする。
   不明な点は実装前に必ず確認する。
3. **一次ソース主義**：すべての発言・採決・資金データに出典URLを付ける。
   出典のない断定をしない。AI要約にも元発言へのリンクを併記する。
4. **法令・規約遵守**：robots.txt と各サイト利用規約を守る。違反の恐れがあれば停止して報告。
5. **秘密情報をコミットしない**：APIキー等は `.env`（`.gitignore` 済み）に置く。

---

## ワークフロー

- いきなり実装しない。まず `SPEC.md` と本ファイルを読み、**計画を提示**してから着手する
  （plan mode / Shift+Tab を活用）
- データモデル → 収集スクリプト → 画面、の順で機能単位に進める
- 一区切りごとに `npm run typecheck` と `npm run lint` を通し、こまめに commit する
- 大きな仕様変更や新スコープは、実装前に提案・確認する
