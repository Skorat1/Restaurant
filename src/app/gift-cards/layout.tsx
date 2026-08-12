import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Digital Dining Gift Cards & Vouchers",
  description:
    "Surprise loved ones with an exclusive L'Étoile Dorée digital gift pass redeemable for fine dining, tasting menus, and rare wines.",
  alternates: {
    canonical: `${SITE_URL}/gift-cards`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/gift-cards`,
    title: "Digital Gift Passes | L'Étoile Dorée",
    description: "Gift an unforgettable fine dining experience with digital vouchers.",
    images: [{ url: "/images/hero.svg", width: 1200, height: 630, alt: "L'Étoile Dorée Gift Cards" }],
  },
};

export default function GiftCardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
