import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Location Directions",
  description: "Contact VELORA Fine Dining. Inquire about private banquets, corporate dining, white-glove valet parking, or location directions.",
  keywords: ["contact VELORA", "location", "valet parking", "private banquets", "restaurant contact"],
  openGraph: {
    title: "Contact Us & Location Directions | VELORA",
    description: "Get directions, contact our sommelier team, or book private banquets at VELORA.",
    images: ["/images/event.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | VELORA",
    description: "Contact VELORA Fine Dining for inquiries and directions.",
    images: ["/images/event.jpg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
