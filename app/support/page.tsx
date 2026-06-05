import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "支援・寄付（運営を続けるために）",
  description:
    "愛知政治マップは中立を守るためほぼ自費で運営しています。運営費（サーバー・ドメイン・データ取得）の支援を受け付けます。政党・政治家・政治団体からの寄付は受け取りません。",
};

// Stripe Payment Links（金額選択の寄付・毎月の継続支援）。Stripeダッシュボードで作成したURLを貼る。
// 静的サイト（output: export）でもリンクを置くだけで成立する（サーバー不要）。未設定なら「準備中」を表示。
const STRIPE_ONE_TIME = ""; // 例: https://buy.stripe.com/xxxxxxxx （一度の寄付・金額選択）
const STRIPE_MONTHLY = ""; // 例: https://buy.stripe.com/yyyyyyyy （毎月の継続支援）

// 補完チャネル（任意。空なら非表示）。
const GITHUB_SPONSORS = ""; // 例: https://github.com/sponsors/xxxx
const OFUSE = ""; // 例: https://ofuse.me/xxxx
const NOTE_MEMBERSHIP = ""; // 例: https://note.com/xxxx/membership

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-ink px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-accent"
    >
      {children}
    </a>
  );
}

export default function SupportPage() {
  const others = [
    { url: GITHUB_SPONSORS, label: "GitHub Sponsors" },
    { url: OFUSE, label: "OFUSE（一度の応援）" },
    { url: NOTE_MEMBERSHIP, label: "note メンバーシップ" },
  ].filter((o) => o.url);

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-6">
        <p className="eyebrow text-faint">Support</p>
        <h1 className="font-display mt-2 text-[clamp(2rem,6vw,3.5rem)] leading-tight">支援・寄付</h1>
        <p className="measure mt-3 text-muted">
          愛知政治マップは、中立を守るためほぼ自費で運営しています。
          サーバー代・ドメイン代・データ取得の実費を、運営を続けるための支援でまかないます。
          黒字化ではなく「続けること」が目的です。
        </p>
      </header>

      {/* 中立ガードレール（支援の透明性＝中立の証明として最初に置く） */}
      <section className="border-l-2 border-accent bg-subtle px-5 py-4">
        <h2 className="eyebrow text-accent-deep">支援を受けるうえでの約束（中立のために）</h2>
        <ul className="measure mt-2 space-y-1.5 text-sm text-muted">
          <li>
            <span className="font-bold text-ink">
              政党・政治家・政治団体からの寄付は受け取りません。
            </span>
          </li>
          <li>支援は「サイト運営」への支援であり、特定の政治活動への支援ではありません。</li>
          <li>誰が支援しても、掲載する内容・順序・表示は一切変わりません（編集の独立）。</li>
          <li>支援の使途は、可能な範囲で公開します。</li>
        </ul>
      </section>

      <section className="border-t-2 border-ink pt-5">
        <h2 className="font-display text-xl">寄付で応援する</h2>
        {STRIPE_ONE_TIME || STRIPE_MONTHLY ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {STRIPE_ONE_TIME && <PrimaryLink href={STRIPE_ONE_TIME}>一度だけ寄付する</PrimaryLink>}
            {STRIPE_MONTHLY && (
              <a
                href={STRIPE_MONTHLY}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-ink px-5 py-2.5 text-sm font-bold transition-colors hover:bg-subtle"
              >
                毎月支援する
              </a>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            寄付の受付（Stripe）を準備中です。決済は Stripe Payment Links
            を用い、クレジットカードで金額を選んで寄付できるようにします。
          </p>
        )}
        <p className="measure mt-3 text-xs text-faint">
          決済は Stripe を通じて行われ、当サイトはカード情報を保持しません。
        </p>
      </section>

      {others.length > 0 && (
        <section className="border-t-2 border-ink pt-5">
          <h2 className="font-display text-xl">その他の応援</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {others.map((o) => (
              <li key={o.label}>
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="link-ink">
                  {o.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="measure border-t border-line pt-5 text-sm text-muted">
        中立性・運営・財源の方針は
        <Link href="/about" className="link-ink">
          このサイトについて
        </Link>
        に記載しています。
      </p>
    </div>
  );
}
