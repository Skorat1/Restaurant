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

          {/* ── ALIGNED CTA BUTTONS ── */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center pt-2 animate-fade-up [animation-delay:450ms]">
            {/* 1. Explore Menu */}
            <Link
              href="/menu"
              className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 h-[50px] px-7 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-amber-300/40 text-center whitespace-nowrap"
            >
              <Utensils className="w-4 h-4 text-black shrink-0" />
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 text-black shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* 2. Reserve a Table */}
            <Link
              href="/reserve"
              className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 h-[50px] px-7 rounded-full bg-neutral-950/80 hover:bg-neutral-900 border-2 border-amber-400/60 hover:border-amber-400 text-amber-300 hover:text-white font-extrabold text-xs uppercase tracking-widest shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center whitespace-nowrap backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>Reserve a Table</span>
            </Link>

            {/* 3. 360° Tour */}
            <button
              type="button"
              onClick={() => setTourModal(true)}
              className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 h-[50px] px-6 rounded-full bg-neutral-900/70 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/50 text-neutral-300 hover:text-amber-300 font-extrabold text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-center whitespace-nowrap backdrop-blur-md"
            >
              <Eye className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
              <span>360° Tour</span>
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
