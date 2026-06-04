import type { MetadataRoute } from "next";

// 静的エクスポートで /robots.txt を生成（本番ドメインは NEXT_PUBLIC_SITE_URL で指定）。
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aichi-seiji.example.jp";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
