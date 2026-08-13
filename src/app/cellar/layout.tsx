import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Virtual Wine Cellar & Sommelier Pairings",
  description:
    "Explore VELORA's private collection of Grand Cru vintages, rare Champagnes, and sommelier-curated dish pairings.",
  alternates: {
    canonical: `${SITE_URL}/cellar`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/cellar`,
    title: "Virtual Wine Cellar | VELORA",
    description: "Curated Grand Cru vintages and sommelier food pairings.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "VELORA Wine Cellar" }],
  },
};

export default function CellarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
