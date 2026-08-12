import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://letoiledoree.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,               lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/menu`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/reserve`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/order`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/cellar`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/gift-cards`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/track`,      lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/about`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/services`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/gallery`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/membership`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
