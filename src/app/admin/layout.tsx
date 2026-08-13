"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/admin/orders", label: "Orders", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
  { href: "/admin/reservations", label: "Reservations", icon: "M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l3 4h12l3-4M8 12h8M8 16h5" },
  { href: "/admin/menu", label: "Menu", icon: "M12 2c1.5 2 4 2.5 4 5.5 0 1.5-1 2-1 3.5 0 1 1 2.5 1 3.5C16 18 13.5 20 12 20s-4-2-4-6.5c0-1 .5-2.5.5-3.5 0-1.5-1-2-1-3.5C7.5 4.5 10 4 12 2z" },
  { href: "/admin/reviews", label: "Reviews", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" },
  { href: "/admin/coupons", label: "Coupons", icon: "M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4z" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0 8 6 8-6" },
  { href: "/admin/users", label: "Users", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/activity", label: "Activity", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isReady = !loading && !!token && user?.role === "admin";

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/login");
      } else if (user && user.role !== "admin") {
        router.replace("/");
      }
    }
  }, [loading, token, user, router]);

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-10">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar Navigation */}
        <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/80 p-3 sm:p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 px-3 py-2.5 border-b border-neutral-800 mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center shrink-0">
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-amber-400 uppercase tracking-wide font-bold">Administrator</p>
              </div>
            </div>

            {/* Horizontal Scrollable Nav on Mobile, Vertical Stack on Desktop */}
            <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 scrollbar-none">
              {NAV_ITEMS.map(({ href, label, icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 shrink-0 rounded-xl text-xs sm:text-sm font-medium transition ${
                      active
                        ? "bg-amber-500 text-black font-bold shadow-sm"
                        : "text-neutral-300 hover:bg-neutral-800 hover:text-white bg-neutral-950/60 lg:bg-transparent border border-neutral-800/60 lg:border-none"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-3 lg:mt-4 pt-2.5 lg:pt-3 border-t border-neutral-800 hidden lg:block">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              View Site
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
