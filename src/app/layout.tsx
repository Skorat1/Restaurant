import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import InaugurationRibbon from "@/components/InaugurationRibbon";
import { AuthProvider } from "@/lib/AuthContext";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import PageWrapper from "@/components/PageWrapper";
import ChatWidget from "@/components/ChatWidget";
import { LanguageProvider } from "@/lib/LanguageContext";
import API_BASE_URL from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://restaurant-psi-henna-35.vercel.app";


export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VELORA | High Gastronomy & Modern Fine Dining",
    template: "%s | VELORA",
  },
  description:
    "Experience ultra-modern fine dining at VELORA. 7-course seasonal tasting menus, private skylight terrace, 2,500+ Grand Cru cellar vintages, and sommelier pairings.",
  keywords: ["VELORA", "fine dining", "luxury restaurant", "tasting menu", "table reservation", "wine cellar", "sommelier", "private dining"],
  authors: [{ name: "VELORA Fine Dining" }],
  creator: "VELORA",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "VELORA",
    title: "VELORA | High Gastronomy & Modern Fine Dining",
    description: "7-course seasonal tasting menus, private skylight terrace, and 2,500+ Grand Cru vintages.",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "VELORA Fine Dining" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VELORA | High Gastronomy & Modern Fine Dining",
    description: "7-course seasonal tasting menus, private skylight terrace, and sommelier pairings.",
    images: ["/images/hero.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: [{ url: "/icon.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
};

// JSON-LD structured data for Restaurant
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "VELORA",
  description: "Premium fine dining restaurant with seasonal tasting menus and private dining experiences.",
  url: SITE_URL,
  telephone: "+1-894-578-3489",
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Main Street",
    addressLocality: "Downtown",
    addressCountry: "US",
  },
  servesCuisine: ["French", "Contemporary", "Fine Dining"],
  priceRange: "$$$",
  openingHours: ["Mo-Su 18:00-23:00"],
  hasMenu: `${SITE_URL}/menu`,
  acceptsReservations: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to API for faster first requests */}
        <link rel="preconnect" href={API_BASE_URL} />
        <link rel="dns-prefetch" href={API_BASE_URL} />

      </head>
      <body className="bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-500 selection:text-black">
        <AuthProvider>
          <LanguageProvider>
              <CartProvider>
                {/* Skip to main content for accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-black focus:font-semibold"
                >
                  Skip to main content
                </a>
                <PageWrapper
                  footer={
                    <footer className="border-t border-neutral-900 bg-neutral-950 py-6 sm:py-10 text-sm text-neutral-400" role="contentinfo">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4 sm:gap-6 sm:flex-row sm:justify-between text-center sm:text-left">
                        <div className="space-y-1">
                          <p className="text-amber-500 font-serif font-bold text-lg tracking-wider">VELORA</p>
                          <p className="text-neutral-400 text-xs">23, Boat Club Road, Pune · +91 20 4890 7700</p>
                        </div>
                        <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-wider">
                          <a href="#" className="text-neutral-400 hover:text-amber-400 transition">Privacy</a>
                          <a href="#" className="text-neutral-400 hover:text-amber-400 transition">Terms</a>
                          <a href="/contact" className="text-neutral-400 hover:text-amber-400 transition">Contact</a>
                        </nav>
                        <p className="text-neutral-500 text-xs">© 2026 VELORA. All rights reserved.</p>
                      </div>
                    </footer>
                  }
                >
                  {children}
                </PageWrapper>
                <ChatWidget />
              </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
