# 旧Vercel URLからCloudflareへの正規URL統一

確認日：2026-10-26 JST（2026-10-25 22時台 UTC）。基準：`cf75381` / PR #100。
下記の確認結果は公開前の調査記録。初回調査時点ではGitHub push、マージ、再デプロイ、
公開設定変更は未実施。実際の適用状態は公開コミットとHTTP応答で確認する。

## 確認できたこと

- 旧URL：`https://aichi-seiji-map.vercel.app/`。
  追跡中の `.env.example` と公開HTTPで特定。元checkoutの `.vercel/project.json` は
  プロジェクト名 `aichi-seiji-map` を指す。
- 現本番：`https://seiji-torisetsu.pages.dev/`。
- 両ホストの `/`、`/start/`、`/themes/bukka/`、`/municipalities/oharu/`、
  `/search/?q=横井&kind=executive` が200。各ホスト自身を指すcanonicalが1つずつある。
  この5標本はscript/styleを除いた表示テキストが一致。旧→新への転送はない。
  `kind=executive` は現行検索では無効値なので、このHTTP標本から種別フィルターの動作を
  確認したとはしない。公開後のUI確認には下表の有効値 `首長` を使う。
- 両方の `robots.txt` はクロールを許可し、それぞれのホストのサイトマップを指定。
  両方のサイトマップは1,430 URLで、それぞれ自身のホストのみを掲載。
- `/start` は両ホストとも同じホストの `/start/` へ308。架空パスは404かつnoindex。
  404にはホームcanonicalが残るが、実在ページの誤継承ではない。
- GitHubの本番デプロイ記録 `7297265197` は `cf75381` を指し、Vercel側のstatusはsuccess。
  デプロイ固有URLは `https://aichi-seiji-avuuwnr98-y1007usei-5506s-projects.vercel.app/`。
  これは302でSSO認証へ進むため、認証を追わず停止した。公開aliasとは区別する。
- 正常な静的26ルートと動的7系統をソースで点検。通常ページのcanonical欠落と
  サイトマップ対象不足は見つからなかった。ホームの `/` 継承は意図通り。

二重公開と相反する正規URL指定は確認済み。Google通知の原因候補として根拠は強いが、
通知対象URL、Googleが選択したcanonical、最終クロール時点は未確認。
検索条件や末尾スラッシュ違いなど別の重複URLが通知対象の可能性もある。
Search Consoleでの個別確認なしに原因を断定しない。

## 用意した修正

1. `app/sitemap.ts` がcanonical・robotsと同じ `SITE_URL` を参照する。
   旧コードの未設定時fallback `aichi-seiji.example.jp` を除く。
   公開中Cloudflareのサイトマップはすでに正しかったため、このfallbackを本番原因とはしない。
2. `lib/site-meta.ts` で設定値末尾のスラッシュを除き、絶対URLの二重スラッシュを防ぐ。
   `.env.example` の本番URLをCloudflareに更新。明示的な環境変数の上書きは保持する。
3. ルートの `vercel.json` に旧本番ホスト完全一致の308転送を用意。
   CloudflareでVercel設定は使用されない。プレビューや別aliasを無差別に転送しない。
   Vercel予約の `/.well-known` は通常の転送設定の対象外であり、設定変更しない。
4. 同ファイルの `buildCommand` で本番の `NEXT_PUBLIC_SITE_URL` を明示する。
   Vercelプロジェクトに残った旧URLの値に左右されず、生成HTML・サイトマップ・robotsを
   Cloudflare URLへ揃える。既存Git連携による通常ビルドを使い、管理画面の認証は変更しない。

## 公開承認後の適用対象・手順

1. Search Consoleに既存ログインで入れる場合、通知対象URLとGoogle選択canonicalを読み取る。
   新規認証・権限追加はしない。今回はMac画面ロックのためブラウザ操作を進めなかった。
2. Vercelの既存プロジェクトとDomainsで旧本番aliasを確認し、適用前の設定と本番デプロイIDを保存。
   公開HTTPで指定されるURLと環境変数の実設定は別物。Vercel環境変数の値は未読取。
3. 本修正をレビューし、通常のGitHub手順で反映する。既存Git連携はVercelにもデプロイするため、
   push時点から公開処理が起動し得る点を扱う。Cloudflare本番も通常手順で再ビルド・配信する。
4. リポジトリ内の `buildCommand` でCloudflare URLを指定して通常再ビルドする。
   Vercel管理画面の環境変数は今回読み書きせず、ビルド時の実効値を統一する。
   認証、Deployment Protection、費用、権限は変更しない。
5. 旧ホストのトップだけでなく下記をGETし、旧ホストが200を返さず308と正しいLocationを返すこと、
   転送先が200で自己canonicalを持つこと、ループやホームへの一括転送がないことを確認。

| 旧URLのパス・条件 | 期待する新URLのパス・条件 |
| --- | --- |
| `/` | `/` |
| `/themes/bukka/` | `/themes/bukka/` |
| `/municipalities/oharu/` | `/municipalities/oharu/` |
| `/search/?q=%E6%A8%AA%E4%BA%95&kind=%E9%A6%96%E9%95%B7` | 同じパスと両クエリ（横井・首長） |
| `/compare/?a=fixture-a&b=fixture-b` | 同じパスと両クエリ（実際の表示確認は実在IDを使う） |
| `/start` | `/start` → 新ホストで `/start/` に正規化してよい |
| 存在しないパス | 同じパスへ転送後、新ホストで404。ホームに偽装しない |

6. 正常な既存IDの検索・比較共有URLをMacのブラウザで開き、検索条件・比較対象を確認。
   旧hostのrobots・sitemapも転送、新hostのサイトマップが新URLだけであることを確認する。
   転送に必要な旧URLのクロールをrobotsで禁止したり、検索削除申請を行ったりしない。
7. Search ConsoleではURL検査の正規URLと再クロール状況を記録する。インデックス登録リクエスト・
   検証開始・サイトマップ再送信は外部操作なので今回未実施。再評価の即時完了は約束しない。

## 影響と巻戻し

- 旧本番ホストへの訪問は同じ内容の新URLへ移動。検索・比較の共有条件を維持する。
  すべてをホームへ転送しない。新サイトの政治データ・表示内容は変更しない。
- 旧固有デプロイURLの認証保護は維持。他の未確認aliasまで転送対象を広げない。
- 承認後に転送誤りが出た場合は、本変更前のVercel本番デプロイへ通常の巻戻しを行い、
  `vercel.json` と変更した環境変数を保存済み値へ戻して通常のレビュー・再配信を行う。
  Cloudflareは本変更前のPages本番デプロイ `130b49d6-f3b1-4365-a7d4-88b7319159c2` に戻せる。
  308はクライアントにキャッシュされ得るため、サーバー巻戻しだけで即時取消とは限らない。
  旧プロジェクト・ドメイン・認証は削除しない。

## 適用時の追加確認（2026-10-26）

- PR #101 / `552ffd7` はGitHubと両ホストへのビルド配信に成功した。
  Cloudflareの24成果物はローカル生成物と一致。VercelもcanonicalはCloudflareへ揃ったが、
  旧ホストは200のままであり、308転送完了とは扱わなかった。
- Next同梱のVercel向けルート変換で、元の `/:path*` は `/` や末尾 `/` 付き詳細パスに
  一致しなかった。`/:path(.*)` なら空のパス部分と末尾 `/` も含めて保持できるため修正し、
  変換後のルートを使う回帰テストを追加する。ホスト条件は変更せず、全ホスト転送には広げない。
  実際のEdge反映は通常のPR・公開・実応答検証で扱い、ローカル変換だけで完了とはしない。

## 検証の限界と根拠

- ローカル：typecheck、lint（警告0）、81件のテスト、`NEXT_PUBLIC_SITE_URL` 未設定の
  静的ビルドを通過。生成したサイトマップ全1,430 URLで自己canonicalが1個あり、
  noindexがないこと、robots・RSSのCloudflare URL一致、エラーHTML3件のnoindexを確認。
  未設定・末尾スラッシュ付き・別環境URLのfixtureと、旧ホスト限定条件を検査した。
- ローカル設定・ビルドの確認と、Vercel Edgeに実適用したHTTP確認は別。
  初回配信は上記PR #101の記録を参照。追加パス修正も既承認の範囲で公開し、
  各公開コミットに対する実応答で最終判定する。
  Vercelの `has` 条件は `vercel dev` でもローカル実行に対応していないため、
  ホスト条件のfixture検証を本番転送の実証とは呼ばない。
- Macの通常Chromeを調査用に列挙したが、ネイティブ操作は画面ロックで利用不能。
  ロックは迂回せず、Search Console・認証済みVercelダッシュボードは未読取。
- HTTP標本は上記のみ。全1,430ページへのネットワーク巡回は行わない。
  生成ファイルの検査はローカルで行う。Googleが現在選んだcanonicalは未確認。
- [Google: 正規URL指定方法](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
  — 転送・canonical・サイトマップを一貫させる。
- [Vercel: 旧vercel.appホストの限定転送](https://vercel.com/docs/routing/redirects#redirect-the-production-vercelapp-hostname)
  — パスとクエリの引継ぎ、正確なホスト限定。
- [Vercel: Configuration Redirects](https://vercel.com/docs/routing/redirects/configuration-redirects)
  — `permanent: true` は308、`has` のローカル検証制限。
- [Vercel: ファイルによるProject Configuration](https://vercel.com/docs/project-configuration)
  — リポジトリの `buildCommand` でビルドコマンドを指定する。
- 実測記録（ローカル）：`/tmp/seiji-canonical-audit-20261026/http-audit.json`、
  同ディレクトリのHTTPヘッダ・本文、`content-comparison.json`、GitHubデプロイ記録。
