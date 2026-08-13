import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seasonal Menu | VELORA",
  description: "Explore our exquisite tasting menus, chef specials, artisan cocktails, and fine wines.",
  openGraph: {
    title: "Seasonal Menu | VELORA",
    description: "Curated fine dining menu featuring local organic ingredients and contemporary French cuisine.",
    images: ["/images/hero-bg.jpg"],
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
