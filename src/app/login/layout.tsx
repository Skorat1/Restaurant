import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VIP Sign In | Member Access",
  description: "Sign in to your VELORA account to access reservations and VIP rewards.",
  openGraph: {
    title: "VIP Sign In | VELORA",
    description: "Access your VELORA member portal and exclusive dining rewards.",
    images: ["/images/hero.jpg"],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
