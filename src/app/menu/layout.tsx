import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal Tasting Menu & Fine Dining Dishes",
  description: "Explore VELORA's haute cuisine menu. Featuring Miyazaki Wagyu, Brittany Blue Lobster, Oscietra Caviar, and artisanal Valrhona soufflé.",
  keywords: ["VELORA menu", "tasting menu", "Miyazaki Wagyu", "caviar", "haute cuisine", "fine dining menu"],
  openGraph: {
    title: "Seasonal Tasting Menu | VELORA",
    description: "Miyazaki Wagyu, Brittany Blue Lobster, Oscietra Caviar, and sommelier wine pairings.",
    images: ["/images/dish.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seasonal Tasting Menu | VELORA",
    description: "Explore VELORA's award-winning gastronomic menu and sommelier pairings.",
    images: ["/images/dish.jpg"],
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
