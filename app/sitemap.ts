import type { MetadataRoute } from "next";
import { getFactCards, getIssues, getLegislators } from "@/lib/data";
import { MUNICIPALITIES } from "@/lib/municipalities";

// 静的エクスポート（output: export）で sitemap.xml を生成するために必要。
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp";

// 静的サイトマップ。地域名・議員名での検索流入を意識して全ページを列挙する。
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/area",
    "/legislators",
    "/executives",
    "/issues",
    "/facts",
    "/search",
    "/municipalities",
    "/about",
    "/support",
  ].map(
    (p) => ({
      url: `${BASE}${p}/`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    }),
  );

  const legislatorRoutes = getLegislators().map((l) => ({
    url: `${BASE}/legislators/${l.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const issueRoutes = getIssues().map((i) => ({
    url: `${BASE}/issues/${i.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const factRoutes = getFactCards().map((f) => ({
    url: `${BASE}/facts/${f.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const municipalityRoutes = MUNICIPALITIES.map((m) => ({
    url: `${BASE}/municipalities/${m.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...legislatorRoutes,
    ...issueRoutes,
    ...factRoutes,
    ...municipalityRoutes,
  ];
}
