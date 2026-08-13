import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Account Profile & Preferences",
  description: "Manage your VELORA VIP profile, dietary preferences, saved addresses, and reward point balance.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
