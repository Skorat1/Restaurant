"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Utensils, ArrowRight, Calendar, Eye, ShieldCheck, Star, Clock, Sparkles } from "lucide-react";
import VirtualTourModal from "./VirtualTourModal";

export default function Hero() {
  // 360 Tour Modal State
  const [tourModal, setTourModal] = useState(false);

  // Live Table Status Mock
  const [tablesLeft, setTablesLeft] = useState(4);
  useEffect(() => {
    // Simulate real-time table status updates
    const interval = setInterval(() => {
      setTablesLeft((prev) => (prev > 1 ? prev - 1 : 4));
    }, 45000); // changes every 45s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <VirtualTourModal isOpen={tourModal} onClose={() => setTourModal(false)} />

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-center relative z-10 w-full">
        {/* Left Hero Content */}
        <div className="w-full max-w-3xl space-y-6 sm:space-y-8">
          {/* Status & Michelin Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Open Tonight · {tablesLeft} VIP Tables Left
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-amber-300 backdrop-blur-md hover:bg-amber-500/25 transition-all duration-300">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Michelin Guide 2026 Recommended
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2 sm:space-y-3 animate-fade-up [animation-delay:150ms]">
            <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] font-mono text-amber-400 font-bold block">
              VELORA HAUTE CUISINE
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-serif leading-[1.1] text-white tracking-tight drop-shadow-2xl font-bold">
              Where Taste Meets <br className="hidden sm:block" />
              <span className="text-gold-gradient font-italic font-semibold drop-shadow-[0_4px_24px_rgba(245,158,11,0.4)]">
                Elegance &amp; Luxury
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-neutral-200 max-w-xl leading-relaxed text-sm sm:text-base lg:text-lg font-light drop-shadow animate-fade-up [animation-delay:300ms]">
            Experience ultra-modern French culinary heritage redefined. 7-course seasonal tasting menus, 2,500+ Grand Cru cellar vintages, and extraordinary starlit dining ambiances.
          </p>

          {/* ── LUXURY HERO CTA BUTTONS ── */}
          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-stretch sm:items-center pt-2 animate-fade-up [animation-delay:450ms]">
            {/* 1. Explore Menu (Primary Gold Shimmer CTA) */}
            <Link
              href="/menu"
              className="group relative inline-flex items-center justify-center gap-3 h-[52px] px-8 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-bold text-xs sm:text-[13px] uppercase tracking-[0.14em] shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden border border-amber-200/60 text-center whitespace-nowrap"
            >
              {/* Shimmer sweep effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              
              <div className="relative flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-neutral-950 group-hover:rotate-12 transition-transform duration-300 shrink-0" />
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 text-neutral-950 group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
              </div>
            </Link>

            {/* 2. Reserve a Table (Luxury Obsidian Glass CTA) */}
            <Link
              href="/reserve"
              className="group relative inline-flex items-center justify-center gap-3 h-[52px] px-7 rounded-full bg-neutral-950/80 hover:bg-neutral-900/90 backdrop-blur-xl border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-white font-bold text-xs sm:text-[13px] uppercase tracking-[0.14em] shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 overflow-hidden text-center whitespace-nowrap"
            >
              {/* Subtle gold ambient glow */}
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 group-hover:scale-110 group-hover:border-amber-400 transition-all duration-300">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span>Reserve a Table</span>
              </div>
            </Link>

            {/* 3. 360° Tour (Frosted Glass Interactive CTA) */}
            <button
              type="button"
              onClick={() => setTourModal(true)}
              className="group relative inline-flex items-center justify-center gap-2.5 h-[52px] px-6 rounded-full bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-lg border border-white/15 hover:border-amber-400/50 text-neutral-300 hover:text-white font-semibold text-xs sm:text-[13px] uppercase tracking-[0.14em] shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-center whitespace-nowrap"
            >
              <div className="relative flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400/90 group-hover:text-amber-300 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                <span>360° Tour</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </div>
            </button>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 text-xs text-neutral-300 animate-fade-up [animation-delay:600ms]">
            <div className="flex items-center gap-2.5 bg-neutral-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl border border-neutral-800/40 sm:border-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Instant Confirmation</span>
                <span className="text-[10px] text-neutral-400">Direct Email Voucher</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-neutral-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl border border-neutral-800/40 sm:border-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">4.9 / 5 Rating</span>
                <span className="text-[10px] text-neutral-400">1,400+ Verified Guests</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-neutral-900/40 sm:bg-transparent p-2.5 sm:p-0 rounded-2xl border border-neutral-800/40 sm:border-0">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Private Valet</span>
                <span className="text-[10px] text-neutral-400">Complimentary Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
