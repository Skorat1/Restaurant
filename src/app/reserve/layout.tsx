import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Reserve a Table",
  description:
    "Book a dinner reservation at L'Étoile Dorée. Choose your date, time, and party size for a crafted fine-dining experience. Reserve online in seconds.",
  alternates: {
    canonical: `${SITE_URL}/reserve`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/reserve`,
    title: "Reserve a Table | L'Étoile Dorée",
    description:
      "Book your table at L'Étoile Dorée for fine dining. Select date, time, and guests — we confirm by email.",
    images: [{ url: "/images/hero.svg", width: 1200, height: 630, alt: "L'Étoile Dorée reservation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reserve a Table | L'Étoile Dorée",
    description: "Book a fine-dining reservation at L'Étoile Dorée. Confirm by email.",
    images: ["/images/hero.svg"],
  },
};

export default function ReserveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
