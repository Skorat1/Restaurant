"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Calendar, ShoppingBag, Sparkles, User, Wine } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/lib/AuthContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { count, toggleCart } = useCart();
  const { user } = useAuth();

  // Don't show in admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Menu",
      href: "/menu",
      icon: UtensilsCrossed,
      isActive: pathname === "/menu",
    },
    {
      label: "Reserve",
      href: "/reserve",
      icon: Calendar,
      isSpecial: true,
      isActive: pathname === "/reserve",
    },
    {
      label: "Cellar",
      href: "/cellar",
      icon: Wine,
      isActive: pathname === "/cellar",
    },
    {
      label: user ? "Profile" : "VIP Club",
      href: user ? "/profile" : "/membership",
      icon: user ? User : Sparkles,
      isActive: pathname === "/profile" || pathname === "/membership",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2"
    >
      <div className="mx-auto max-w-lg rounded-2xl bg-neutral-950/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] px-2 py-1.5 flex items-center justify-around relative">
        
        {/* Floating Cart Quick Access Pill (Right above bar if items in cart) */}
        {count > 0 && (
          <button
            onClick={toggleCart}
            className="absolute -top-11 right-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(245,158,11,0.5)] active:scale-95 animate-bounce transition-all z-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{count} {count === 1 ? "Item" : "Items"}</span>
          </button>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group active:scale-95 transition-transform"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-full bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-neutral-950 shadow-[0_0_24px_rgba(245,158,11,0.65)] ring-4 ring-neutral-950 ${
                    item.isActive ? "scale-105 ring-amber-400/40" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 mt-1 drop-shadow-md">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
                item.isActive
                  ? "text-amber-400 font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]" />
                )}
              </div>
              <span className="text-[10px] tracking-wide mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Quick Cart Trigger icon tab */}
        <button
          onClick={toggleCart}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-neutral-400 hover:text-amber-300 transition-all duration-200 active:scale-90 relative"
          aria-label="Open Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide mt-1 font-medium">
            Bag
          </span>
        </button>

      </div>
    </nav>
  );
}
