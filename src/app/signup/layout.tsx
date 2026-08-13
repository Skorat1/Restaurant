import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create VIP Account & Join Club",
  description: "Create your VELORA VIP account to receive 100 welcome reward points, instant reservation access, and member perks.",
  openGraph: {
    title: "Create VIP Account | VELORA",
    description: "Register for VELORA VIP Club and receive welcome rewards.",
    images: ["/images/hero.jpg"],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
