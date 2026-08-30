"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/components/CartContext";
import { useLanguage, Language } from "@/lib/LanguageContext";
import {
  ChevronDown, ShoppingCart, Crown, LayoutDashboard,
  CalendarDays, Package, LogOut, User, Star,
  Wine, Gift, Sparkles, Globe, Calendar, Menu as MenuIcon, X, Image as ImageIcon, Video, Info
} from "lucide-react";

// ── Primary nav (always visible in desktop bar) ───────────────────────────────
const PRIMARY_NAV = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/menu", label: "MENU" },
  { href: "/cellar", label: "CELLAR" },
  { href: "/contact", label: "CONTACT" },

];



export default function Header() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { count, toggleCart } = useCart();
  const { language, setLanguage } = useLanguage();

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close mobile menu on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300">
      <div
        className={`transition-all duration-500 border-b ${scrolled
          ? "backdrop-blur-3xl bg-neutral-950/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-amber-500/20 py-2"
          : "backdrop-blur-lg bg-neutral-950/30 border-white/5 py-4"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* ── Logo & Brand Identity ── */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 flex items-center justify-center text-neutral-950 font-serif font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all duration-500 ring-2 ring-amber-400/30">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-serif tracking-[0.25em] bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent font-black group-hover:from-amber-100 group-hover:to-amber-400 transition-all duration-500 leading-none drop-shadow-lg">
                VELORA
              </span>
              <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 font-sans font-bold mt-1.5 group-hover:text-amber-200/80 transition-colors duration-500">
                HAUTE CUISINE
              </span>
            </div>
          </Link>

          {/* ── Desktop Primary Nav ── */}
          <div className="hidden lg:flex items-center gap-7 text-xs font-bold tracking-[0.15em] uppercase">
            {PRIMARY_NAV.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-2 px-1 transition-all duration-300 group/nav ${isActive
                    ? "text-amber-400 font-black"
                    : "text-neutral-400 hover:text-amber-300"
                    }`}
                >
                  {label}
                  {/* Glowing Underline Effect */}
                  <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)] transition-all duration-300 ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover/nav:scale-x-100 group-hover/nav:opacity-50"}`} />
                </Link>
              );
            })}
          </div>

          {/* ── Desktop Right Controls & User Actions ── */}
          <div className="hidden lg:flex items-center gap-3.5">


            {/* Cart Indicator */}
            <button
              type="button"
              onClick={toggleCart}
              aria-label="View cart"
              className="relative p-2.5 rounded-full border border-neutral-700/80 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 group"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {mounted && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-black text-[11px] font-bold flex items-center justify-center shadow-md shadow-amber-500/30 animate-pulse">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Reserve Table High-Impact CTA */}
            <Link
              href="/reserve"
              className="relative overflow-hidden group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 transition-all duration-300 border border-amber-300/50"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              <Calendar className="w-4 h-4 text-black group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">RESERVE TABLE</span>
            </Link>

            {/* Authentication Triggers / Profile Menu */}
            {!mounted || loading ? (
              <div className="w-24 h-9 rounded-full bg-neutral-800/50 animate-pulse border border-neutral-700/30" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-700/80 bg-neutral-900/60 hover:bg-neutral-800 hover:border-amber-500/40 transition group"
                  aria-label="Profile menu"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black text-xs font-bold flex items-center justify-center ring-2 ring-amber-500/30 group-hover:ring-amber-500/60 transition">
                      {initials}
                    </div>
                    {user.role === "admin" && (
                      <Crown className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-200 max-w-[80px] truncate font-bold">{user.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-amber-500/30 bg-neutral-950/98 backdrop-blur-2xl shadow-2xl shadow-black/70 overflow-hidden z-50 animate-fade-up">
                    <div className="px-4 py-4 border-b border-neutral-800 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black text-sm font-bold flex items-center justify-center ring-2 ring-amber-500/40">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${user.role === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}>
                              {user.role === "admin" ? <Crown className="w-2.5 h-2.5" /> : <Star className="w-2.5 h-2.5" />}
                              {user.role === "admin" ? "Admin" : "VIP Guest"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white transition">
                        <User className="w-4 h-4 text-amber-400" /> My Profile
                      </Link>

                      {user.role === "admin" ? (
                        <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white transition">
                          <LayoutDashboard className="w-4 h-4 text-purple-400" /> Admin Dashboard
                        </Link>
                      ) : (
                        <Link href="/profile#reservations" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white transition">
                          <CalendarDays className="w-4 h-4 text-amber-400" /> My Reservations
                        </Link>
                      )}

                      <Link href="/track" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-900 hover:text-white transition">
                        <Package className="w-4 h-4 text-amber-400" /> My Orders
                      </Link>
                    </div>

                    <div className="border-t border-neutral-800 py-1.5">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-neutral-900 transition">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  suppressHydrationWarning
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-neutral-700/80 text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 hover:border-amber-500/40 hover:shadow-md transition-all duration-200"
                >
                  LOG IN
                </Link>
                <Link
                  href="/signup"
                  suppressHydrationWarning
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 text-amber-300 hover:from-amber-500/30 hover:to-amber-600/30 hover:text-amber-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-200"
                >
                  SIGN UP
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Right Actions ── */}
          <div className="lg:hidden flex items-center gap-2">

            {/* Mobile Cart Button - opens cart drawer */}
            <button
              type="button"
              onClick={toggleCart}
              aria-label="View cart"
              className="relative p-2.5 min-h-[40px] min-w-[40px] rounded-full border border-neutral-700 text-neutral-200 bg-neutral-900/90 active:scale-95 transition-transform flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>

            {/* Hamburger Toggle Button */}
            <button
              aria-label={open ? "Close menu" : "Open navigation menu"}
              aria-expanded={open}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-full border border-neutral-700/80 bg-neutral-900/90 text-neutral-200 hover:text-amber-400 hover:border-amber-500/40 active:scale-95 transition flex items-center justify-center shadow-sm"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-5 h-5 text-amber-400" /> : <MenuIcon className="w-5 h-5 text-neutral-200" />}
            </button>
          </div>

        </nav>
      </div>

      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 z-[9998] lg:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* ── Mobile Full-Height LEFT SIDEBAR DRAWER ── */}
      <aside
        aria-label="Mobile Navigation Sidebar"
        className={`fixed top-0 left-0 bottom-0 h-full w-[85vw] max-w-[320px] z-[9999] lg:hidden transition-transform duration-300 ease-in-out shadow-2xl ${open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
          }`}
      >
        <div className="h-full flex flex-col bg-neutral-950 border-r-2 border-amber-500/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">

          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center text-neutral-950 font-serif font-extrabold text-base shadow-md ring-2 ring-amber-400/40">
                V
              </div>
              <div>
                <span className="text-base font-serif tracking-[0.15em] text-amber-400 font-extrabold leading-none block">VELORA</span>
                <span className="block text-[8px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-0.5">NAVIGATION MENU</span>
              </div>
            </div>

            {/* TOP RIGHT CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-sm"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>CLOSE</span>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">

            {/* User Profile Banner (if logged in) */}
            {!mounted || loading ? (
              <div className="w-full h-14 rounded-2xl bg-neutral-800/50 animate-pulse border border-neutral-700/30" />
            ) : user ? (
              <div className="p-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-neutral-900/80 to-neutral-900/90 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold text-xs flex items-center justify-center ring-2 ring-amber-400/40 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="px-2.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-[10px] font-bold shrink-0"
                >
                  View
                </Link>
              </div>
            ) : null}

            {/* Quick Cart Trigger inside Sidebar */}
            <button
              onClick={() => {
                setOpen(false);
                toggleCart();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-bold uppercase tracking-wider active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>My Dining Bag</span>
              </div>
              <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black">
                {count} {count === 1 ? "Item" : "Items"}
              </span>
            </button>

            {/* All Website Pages Navigation */}
            <div>
              <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400">Pages &amp; Dining</p>
              <div className="space-y-1">
                {[
                  { href: "/", label: "Home", icon: Sparkles },
                  { href: "/menu", label: "Menu & Cuisine", icon: Utensils },
                  { href: "/cellar", label: "Grand Wine Cellar", icon: Wine },
                  { href: "/reserve", label: "Table Reservation", icon: Calendar },
                  { href: "/membership", label: "VIP Velvet Dining Club", icon: Crown },
                  { href: "/about", label: "About VELORA", icon: Info },
                  { href: "/contact", label: "Contact & Concierge", icon: Globe },
                ].map(({ href, label, icon: NavIcon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.98] ${isActive
                        ? "bg-gradient-to-r from-amber-500/25 to-amber-600/15 border border-amber-500/60 text-amber-300 shadow-sm"
                        : "text-neutral-200 bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 hover:text-white"
                        }`}
                    >
                      <NavIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-400" : "text-neutral-400"}`} />
                      <span className="flex-1">{label}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Account & Policies links */}
            <div className="pt-2 border-t border-neutral-800/80">
              <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-400">Guest Services</p>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-neutral-400">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 hover:text-white transition"
                >
                  📍 Location &amp; Valet
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60 hover:text-white transition"
                >
                  📜 Dress Code &amp; Policy
                </Link>
              </div>
            </div>

          </div>

          {/* Sidebar Footer - Fixed bottom CTA & Close */}
          <div className="shrink-0 px-4 py-4 border-t border-neutral-800 bg-neutral-950 space-y-2">
            <Link
              href="/reserve"
              onClick={() => setOpen(false)}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/25 active:scale-[0.97] transition-all"
            >
              <Calendar className="w-4 h-4" />
              Reserve VIP Table
            </Link>

            {!mounted || loading ? (
              <div className="w-full min-h-[40px] rounded-xl bg-neutral-800/50 animate-pulse border border-neutral-700/30" />
            ) : user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full min-h-[40px] rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold text-xs active:scale-[0.97] transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 min-h-[40px] flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 font-bold text-xs uppercase hover:border-neutral-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 min-h-[40px] flex items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold text-xs uppercase hover:bg-amber-500/25 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* SECONDARY BOTTOM CLOSE BUTTON */}
            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 text-center text-[11px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition"
            >
              ✕ Close Sidebar
            </button>
          </div>

        </div>
      </aside>
    </header>
  );
}

