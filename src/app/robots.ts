import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://letoiledoree.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/profile/", "/orders/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
