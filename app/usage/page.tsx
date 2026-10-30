import type { Metadata } from "next";
import Link from "next/link";
import { UsagePreferences } from "@/components/UsagePreferences";

export const metadata: Metadata = {
  title: "利用状況の計測と停止",
  description: "初めて使う人の導線を改善するための計測内容と、端末で停止する方法。",
  alternates: { canonical: "/usage/" },
};

export default function UsagePage() {
  return (
    <article className="mx-auto max-w-2xl">
      <p className="eyebrow text-muted">サイトについて</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">利用状況の計測と停止</h1>
      <p className="mt-5 leading-relaxed text-muted">地域選択から代表者、暮らしのテーマ、一次資料まで進みやすくするために、各段階への到達件数を集計します。このページで送信を停止できます。</p>
      <section className="mt-8" aria-labelledby="usage-setting">
        <h2 id="usage-setting" className="mb-3 font-display text-xl">この端末の設定</h2>
        <UsagePreferences />
      </section>
      <section className="mt-8 space-y-3" aria-labelledby="usage-scope">
        <h2 id="usage-scope" className="font-display text-xl">送信する内容</h2>
        <p className="text-sm leading-relaxed text-muted">地域選択欄の表示、選択欄・郵便番号・保存した地域・区の一覧から進む操作、代表者ページの表示、暮らしのテーマの表示、出典一覧を開く操作、そこから公式資料へのリンクを開く操作の6種類です。順に進んだ場合を、同じタブで段階フラグが残っている間は各段階1回まで数えます。停止・再許可や保存の消失でフラグが消えると再び数えます。</p>
        <p className="text-sm leading-relaxed text-muted">送信内容は段階の名前と形式のバージョンだけです。地域名、郵便番号、検索語、議員名、政党、テーマ名、閲覧先のURL、個人や端末の識別子は送信しません。計測用Cookieは使いません。</p>
        <p className="text-sm leading-relaxed text-muted">重複を抑える段階フラグは、このブラウザのタブ内に保存します。ブラウザがタブを復元するとフラグも残ることがあります。個人を識別せず、利用者数・初めて使う人数・内容を理解した人数を測るものではありません。地図や他の一覧から直接入るなど、今回の順次導線に含めない経路もあります。公式資料のクリックも、資料が表示されたことや読まれたことを保証しません。</p>
      </section>
      <section className="mt-8 space-y-3" aria-labelledby="usage-handling">
        <h2 id="usage-handling" className="font-display text-xl">送信先と保存期間</h2>
        <p className="text-sm leading-relaxed text-muted">本サイトと同じ接続先で受け取り、Cloudflare Analytics Engineで段階ごとの件数を集計します。記録は3か月間保持されます。HTTP接続の基盤ではIPアドレスなどを扱いますが、この計測の記録にはIPアドレス、User-Agent、参照元を含めません。</p>
        <p className="text-sm leading-relaxed text-muted">ブラウザのDNT（追跡拒否）またはGPCが有効な場合は送信しません。開発・プレビュー環境や、本番で計測が有効になっていない場合も送信しません。</p>
        <p className="text-sm leading-relaxed text-muted">停止設定は送信前に反映します。すでに受け取った記録には利用者の識別子がないため、特定の人の記録を取り出すことはできません。</p>
      </section>
      <Link href="/#region-picker" className="link-ink mt-8 inline-flex min-h-11 items-center">地域から探す →</Link>
    </article>
  );
}
