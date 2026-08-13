import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Gold & Platinum Membership Club",
  description: "Join VELORA's VIP Club for priority terrace seating, complimentary sommelier wine flights, secret tasting previews, and birthday perks.",
  keywords: ["VIP membership", "gold club", "platinum club", "dining perks", "VELORA VIP"],
  openGraph: {
    title: "VIP Gold & Platinum Membership Club | VELORA",
    description: "Unlock exclusive dining privileges, priority reservations, and secret wine tasting access.",
    images: ["/images/hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIP Membership Club | VELORA",
    description: "Join VELORA VIP Club for exclusive luxury dining privileges.",
    images: ["/images/hero.jpg"],
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
