import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserve a Table | VELORA",
  description: "Book your fine dining experience online. Select your date, time, and table preferences.",
  openGraph: {
    title: "Reserve a Table | VELORA",
    description: "Reserve your seat for an extraordinary culinary journey at VELORA.",
    images: ["/images/hero-bg.jpg"],
  },
};

export default function ReserveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
