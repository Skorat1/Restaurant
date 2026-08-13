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
  { href: "/menu", label: "MENU" },
  { href: "/reserve", label: "RESERVE" },
  { href: "/contact", label: "CONTACT" },
];

// ── Secondary nav shown inside "More ▾" dropdown ─────────────────────────────
const MORE_NAV = [
  { href: "/about", label: "About Us", icon: Info },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/cellar", label: "Wine Cellar", icon: Wine },
  { href: "/membership", label: "Membership", icon: Crown },
  { href: "/track", label: "Track Order", icon: Package },
];

export default function Header() {
  const [open, setOpen] = useState(false);          // mobile menu
  const [moreOpen, setMoreOpen] = useState(false);  // "More" desktop dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { language, setLanguage } = useLanguage();

  const moreRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [pathname, open]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
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

  const isMoreActive = MORE_NAV.some((l) => pathname === l.href);

  return (
    <header className="fixed top-0 w-full z-50">
      <div
        className={`transition-all duration-300 border-b ${scrolled
            ? "backdrop-blur-2xl bg-neutral-950/95 shadow-2xl shadow-black/60 border-amber-500/20 py-1"
            : "backdrop-blur-xl bg-neutral-950/85 border-neutral-800/80 py-2.5"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* ── Logo & Brand Identity ── */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center text-neutral-950 font-serif font-bold text-lg shadow-md shadow-amber-500/25 group-hover:scale-105 group-hover:shadow-amber-500/40 transition-all duration-300 ring-2 ring-amber-400/30">
              É
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif tracking-widest text-amber-400 font-bold group-hover:text-amber-300 transition leading-none">
                L&apos;Étoile Dorée
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-400 font-sans font-semibold mt-1">
                FINE DINING · HAUTE CUISINE
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
                  className={`relative py-1.5 transition-colors duration-200 ${isActive
                      ? "text-amber-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-amber-400 after:to-amber-500 after:shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                      : "text-neutral-300 hover:text-amber-400"
                    }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* More ∨ Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1 py-1.5 transition-colors duration-200 ${isMoreActive
                    ? "text-amber-400 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-amber-400 after:to-amber-500 after:shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                    : "text-neutral-300 hover:text-amber-400"
                  }`}
              >
                <span>MORE</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180 text-amber-400" : ""}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-60 rounded-2xl border border-amber-500/30 bg-neutral-950/98 backdrop-blur-2xl shadow-2xl shadow-black/70 overflow-hidden z-50 animate-fade-up">
                  <div className="py-2">
                    {MORE_NAV.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition ${pathname === href
                            ? "text-amber-400 bg-amber-500/15 font-bold"
                            : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-amber-400" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop Right Controls & User Actions ── */}
          <div className="hidden lg:flex items-center gap-3.5">

            {/* Language Selector (EN ∨) */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-700/80 bg-neutral-900/60 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 hover:border-amber-500/40 transition-all uppercase tracking-wider shadow-sm group"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>{language.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${langOpen ? "rotate-180 text-amber-400" : ""}`} />
              </button>

              {langOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 rounded-2xl border border-amber-500/30 bg-neutral-950/98 backdrop-blur-2xl shadow-2xl shadow-black/70 overflow-hidden py-1.5 z-50">
                  {[
                    { code: "en" as Language, name: "English" },
                    { code: "gu" as Language, name: "ગુજરાતી" },
                    { code: "hi" as Language, name: "हिन्दी" },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                      className={`flex items-center justify-between w-full px-4 py-2 text-xs font-semibold transition ${language === l.code ? "text-amber-400 bg-amber-500/10 font-bold" : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                        }`}
                    >
                      <span>{l.name}</span>
                      {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Indicator */}
            <Link
              href="/menu"
              aria-label="View cart"
              className="relative p-2.5 rounded-full border border-neutral-700/80 bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-200 group"
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {mounted && count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-black text-[11px] font-bold flex items-center justify-center shadow-md shadow-amber-500/30 animate-pulse">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* Reserve Table High-Impact CTA */}
            <Link
              href="/reserve"
              className="relative group inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300 border border-amber-300/40"
            >
              <Calendar className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
              <span>RESERVE TABLE</span>
            </Link>

            {/* Authentication Triggers / Profile Menu */}
            {mounted && user ? (
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

            {/* Mobile Reserve CTA Button */}
            <Link
              href="/reserve"
              className="px-3.5 py-2 min-h-[40px] rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20 active:scale-95 transition-transform flex items-center"
            >
              RESERVE
            </Link>

            {/* Mobile Cart Button */}
            {mounted && count > 0 && (
              <Link href="/menu" className="relative p-2.5 min-h-[40px] min-w-[40px] rounded-full border border-neutral-700 text-neutral-200 bg-neutral-900/90 active:scale-95 transition-transform flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              </Link>
            )}

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

      {/* ── Touch Backdrop Overlay for Mobile Drawer ── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 top-[65px] sm:top-[81px] bg-black/80 backdrop-blur-md transition-opacity duration-300 z-40 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── Mobile Slide-down Touch Menu ── */}
      <div
        className={`fixed left-0 right-0 top-[65px] sm:top-[81px] z-50 lg:hidden overflow-y-auto max-h-[calc(100vh-80px)] transition-all duration-300 ease-out shadow-2xl ${
          open ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-neutral-950/98 border-b border-amber-500/30 backdrop-blur-2xl px-5 py-6 space-y-5 shadow-2xl rounded-b-3xl max-w-xl mx-auto">

          {/* User Profile Banner (if logged in) */}
          {mounted && user && (
            <div className="p-3.5 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-neutral-900/80 to-neutral-900/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold text-sm flex items-center justify-center ring-2 ring-amber-400/40 shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold shrink-0 hover:bg-amber-500/20 transition"
              >
                Profile
              </Link>
            </div>
          )}

          {/* Primary Navigation Grid */}
          <div>
            <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-400">Navigation</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PRIMARY_NAV.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-center min-h-[48px] px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-center transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/25 to-amber-600/20 border-2 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10"
                        : "bg-neutral-900/80 border border-neutral-800 text-neutral-200 hover:border-amber-500/40 hover:text-white"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* More Experiences Accordion Section */}
          <div className="pt-1 border-t border-neutral-800/80">
            <p className="px-1 pb-2 text-[10px] uppercase tracking-[0.25em] font-bold text-amber-400">More Experiences</p>
            <div className="grid grid-cols-2 gap-2">
              {MORE_NAV.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                      isActive
                        ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold"
                        : "bg-neutral-900/50 border border-neutral-800/90 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Language Switcher Bar */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" /> Language:
            </span>
            <div className="flex gap-1.5">
              {[
                { code: "en" as Language, name: "English" },
                { code: "gu" as Language, name: "ગુજરાતી" },
                { code: "hi" as Language, name: "हिन्दी" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                    language === l.code
                      ? "bg-amber-500 text-black shadow-sm font-extrabold"
                      : "bg-neutral-900 text-neutral-300 border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Call-to-Action Bar */}
          <div className="pt-2 flex gap-2.5 border-t border-neutral-800">
            <Link
              href="/reserve"
              onClick={() => setOpen(false)}
              className="flex-1 min-h-[48px] flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
            >
              Reserve Table
            </Link>

            {mounted && user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="px-5 min-h-[48px] rounded-2xl border border-red-500/40 bg-red-500/10 text-red-400 font-bold text-xs active:scale-98 transition"
              >
                Sign Out
              </button>
            ) : (
              <div className="flex gap-2 flex-1">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 min-h-[48px] flex items-center justify-center rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-200 font-bold text-xs uppercase hover:border-neutral-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 min-h-[48px] flex items-center justify-center rounded-2xl border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold text-xs uppercase hover:bg-amber-500/25 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

