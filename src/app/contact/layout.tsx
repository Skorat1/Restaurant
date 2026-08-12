import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Concierge | L'Étoile Dorée",
  description: "Get in touch with L'Étoile Dorée for inquiries, private dining events, and media requests.",
  openGraph: {
    title: "Contact & Concierge | L'Étoile Dorée",
    description: "Reach out to our concierge team for reservations, private events, and directions.",
    images: ["/images/hero-bg.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
