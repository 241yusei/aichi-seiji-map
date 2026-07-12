import type { MetadataRoute } from "next";
import { getFactCards, getIssues, getLegislators } from "@/lib/data";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { NAGOYA_WARDS } from "@/lib/area";
import { THEMES } from "@/lib/themes";
import { getLearnChapters } from "@/lib/learn";
import { LAST_UPDATED } from "@/lib/site-meta";

// 静的エクスポート（output: export）で sitemap.xml を生成するために必要。
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp";
// 全データはこの基準日を境にまとめて更新される（1ページ単位のタイムスタンプは持たない）ため、
// lastModified はデータ基準日を一律で使う。捏造・推測にならない、実態に即した値。
const LAST_MOD = new Date(LAST_UPDATED);

// 静的サイトマップ。地域名・議員名での検索流入を意識して全ページを列挙する。
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/start",
    "/learn",
    "/glossary",
    "/vote-guide",
    "/area",
    "/legislators",
    "/executives",
    "/issues",
    "/decisions",
    "/themes",
    "/facts",
    "/search",
    "/municipalities",
    "/compare",
    "/elections",
    "/elections/aichi-governor-2027",
    "/elections/unified-2027",
    "/history",
    "/parties",
    "/for-education",
    "/methodology",
    "/about",
    "/support",
    "/corrections",
  ].map(
    (p) => ({
      url: `${BASE}${p}/`,
      lastModified: LAST_MOD,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    }),
  );

  const legislatorRoutes = getLegislators().map((l) => ({
    url: `${BASE}/legislators/${l.id}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const issueRoutes = getIssues().map((i) => ({
    url: `${BASE}/issues/${i.id}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const factRoutes = getFactCards().map((f) => ({
    url: `${BASE}/facts/${f.id}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const municipalityRoutes = MUNICIPALITIES.map((m) => ({
    url: `${BASE}/municipalities/${m.slug}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const themeRoutes = THEMES.map((t) => ({
    url: `${BASE}/themes/${t.id}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const areaRoutes = NAGOYA_WARDS.map((w) => ({
    url: `${BASE}/area/${w.slug}/`,
    lastModified: LAST_MOD,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const learnRoutes = getLearnChapters().map((c) => ({
    url: `${BASE}/learn/${c.slug}/`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...themeRoutes,
    ...areaRoutes,
    ...learnRoutes,
    ...legislatorRoutes,
    ...issueRoutes,
    ...factRoutes,
    ...municipalityRoutes,
  ];
}
