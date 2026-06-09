import { getFactCards } from "@/lib/data";

// 静的エクスポートでも feed.xml を生成する（ビルド時に出力）。
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji-map.vercel.app";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const cards = getFactCards(); // 新着順
  const latest = cards[0]?.publishedAt ?? "2026-01-01";
  const items = cards
    .map(
      (c) => `    <item>
      <title>${esc(c.title)}</title>
      <link>${BASE}/facts/${c.id}/</link>
      <guid isPermaLink="true">${BASE}/facts/${c.id}/</guid>
      <description>${esc(c.hook)}</description>
      <pubDate>${new Date(`${c.publishedAt}T00:00:00+09:00`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>政治のトリセツ あいち・なごや｜事実カード</title>
    <link>${BASE}/facts/</link>
    <description>愛知・名古屋の政治の「記録」から見えるギャップや対比を、一次ソース付きの事実カードで。中立・非投票誘導。</description>
    <language>ja</language>
    <lastBuildDate>${new Date(`${latest}T00:00:00+09:00`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
