import type { MetadataRoute } from "next";

// 静的エクスポートで /robots.txt を生成（本番ドメインは NEXT_PUBLIC_SITE_URL で指定）。
export const dynamic = "force-static";

import { SITE_URL } from "@/lib/site-meta";

const BASE = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
