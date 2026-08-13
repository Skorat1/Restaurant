import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Dining Orders & Delivery Status",
  description: "View your active orders, live preparation status, receipt invoices, and order history at VELORA.",
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
