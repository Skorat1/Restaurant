import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Real-Time Order Tracker & Kitchen Progress",
  description:
    "Track your VELORA fine dining order status in real time from kitchen preparation to delivery.",
  alternates: {
    canonical: `${SITE_URL}/track`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/track`,
    title: "Order Status Tracker | VELORA",
    description: "Trace your food order status live in real time.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "VELORA Order Tracker" }],
  },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
