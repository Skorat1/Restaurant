import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grand Wine Vault & Sommelier Vintages",
  description: "Explore VELORA's subterranean wine cellar housing 2,500+ Grand Cru vintage bottles, rare Champagnes, and sommelier tasting flights.",
  keywords: ["wine cellar", "Grand Cru", "sommelier pairing", "vintage wine", "Champagne vault"],
  openGraph: {
    title: "Grand Wine Vault & Sommelier Vintages | VELORA",
    description: "Explore VELORA's subterranean vault with 2,500+ Grand Cru vintages.",
    images: ["/images/interior.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Wine Vault | VELORA",
    description: "2,500+ Grand Cru vintages and sommelier tasting flights.",
    images: ["/images/interior.jpg"],
  },
};

export default function CellarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
