import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Guest Dashboard & Experience Manager",
  description: "Access your VIP guest portal, upcoming table reservations, reward point redemptions, and exclusive perks.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
