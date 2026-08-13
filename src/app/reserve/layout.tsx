import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book A Table & VIP Skylight Terrace",
  description: "Reserve your fine dining table online at VELORA. Select Main Dining Salon, VIP Skylight Terrace, or subterranean Grand Wine Vault.",
  keywords: ["reserve table", "VELORA reservation", "VIP dining booking", "skylight terrace", "private room booking"],
  openGraph: {
    title: "Book A Table & VIP Skylight Terrace | VELORA",
    description: "Instant online table reservations for Main Salon, Skylight Terrace, and Grand Wine Vault.",
    images: ["/images/interior.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book A Table | VELORA",
    description: "Instant online table reservations at VELORA Fine Dining.",
    images: ["/images/interior.jpg"],
  },
};

export default function ReserveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
