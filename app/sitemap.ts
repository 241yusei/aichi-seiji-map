import type { MetadataRoute } from "next";
import { getFactCards, getIssues, getLegislators } from "@/lib/data";
import { MUNICIPALITIES } from "@/lib/municipalities";
import { NAGOYA_WARDS } from "@/lib/area";
import { THEMES } from "@/lib/themes";
import { getLearnChapters } from "@/lib/learn";
import { SITE_URL } from "@/lib/site-meta";

// 静的エクスポート（output: export）で sitemap.xml を生成するために必要。
export const dynamic = "force-static";

const BASE = SITE_URL;
// ページ単位の実質的な変更日を保持する契約は未整備。
// サイト全体の編集日や資料確認日を流用せず、lastModified は省略する。

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
    "/finance",
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
    "/usage",
    "/corrections",
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

  const themeRoutes = THEMES.map((t) => ({
    url: `${BASE}/themes/${t.id}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const areaRoutes = NAGOYA_WARDS.map((w) => ({
    url: `${BASE}/area/${w.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const learnRoutes = getLearnChapters().map((c) => ({
    url: `${BASE}/learn/${c.slug}/`,
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
