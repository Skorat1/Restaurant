import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Concierge | VELORA",
  description: "Get in touch with VELORA for inquiries, private dining events, and media requests.",
  openGraph: {
    title: "Contact & Concierge | VELORA",
    description: "Reach out to our concierge team for reservations, private events, and directions.",
    images: ["/images/hero-bg.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
