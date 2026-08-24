"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Utensils, ArrowRight, Calendar, Eye, ShieldCheck, Star, Clock } from "lucide-react";
import VirtualTourModal from "./VirtualTourModal";

export default function Hero() {
  // 360 Tour Modal State
  const [tourModal, setTourModal] = useState(false);

  // Quick Table Finder State
  const [reserveDate, setReserveDate] = useState("");
  const [reserveTime, setReserveTime] = useState("7:30 PM");
  const [reserveGuests, setReserveGuests] = useState(2);

  // Live Table Status Mock
  const [tablesLeft, setTablesLeft] = useState(4);
  useEffect(() => {
    // Simulate real-time table status updates
    const interval = setInterval(() => {
      setTablesLeft(prev => prev > 1 ? prev - 1 : 4);
    }, 45000); // changes every 45s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <VirtualTourModal isOpen={tourModal} onClose={() => setTourModal(false)} />
      
      <div className="flex flex-col md:flex-row gap-12 items-center relative z-10 w-full">
        {/* Left Hero Content */}
        <div className="w-full max-w-3xl space-y-8">
          {/* Status & Michelin Badges */}
          <div className="flex items-center gap-3 flex-wrap animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40 badge-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Open Tonight · {tablesLeft} VIP Tables Remaining
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md hover:bg-amber-500/30 transition-all duration-300">
              <Award className="w-4 h-4 text-amber-400" />
              Michelin Guide 2026 Recommended
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 animate-fade-up [animation-delay:150ms]">
            <span className="text-xs uppercase tracking-[0.4em] font-mono text-amber-400 font-bold block">
              VELORA HAUTE CUISINE
            </span>
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-serif leading-[1.08] text-white tracking-tight drop-shadow-2xl font-bold">
              Where Taste Meets <br className="hidden sm:block" />
              <span className="text-gold-gradient font-italic font-semibold drop-shadow-[0_4px_24px_rgba(245,158,11,0.4)]">
                Elegance &amp; Luxury
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-neutral-200 max-w-xl leading-relaxed text-base sm:text-lg font-light drop-shadow animate-fade-up [animation-delay:300ms]">
            Experience ultra-modern French culinary heritage redefined. 7-course seasonal tasting menus, 2,500+ Grand Cru cellar vintages, and extraordinary starlit dining ambiances.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 flex-wrap items-center pt-2 animate-fade-up [animation-delay:450ms]">
            <Link
              href="/menu"
              className="group relative overflow-hidden px-5 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-widest shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:shadow-[0_0_60px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all duration-500 border border-amber-300/40 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-white/30 -translate-x-[150%] skew-x-12 group-hover:animate-[swipe_1s_ease-in-out_forwards]" />
              <Utensils className="w-4 h-4 text-black relative z-10" />
              <span className="relative z-10">Explore Menu</span>
              <ArrowRight className="w-4 h-4 text-black relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/reserve"
              className="group relative overflow-hidden px-5 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-amber-400/60 bg-neutral-950/70 text-amber-300 hover:text-white hover:border-amber-400 font-bold text-[11px] sm:text-xs uppercase tracking-widest backdrop-blur-md shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Calendar className="w-4 h-4 text-amber-400 relative z-10" />
              <span className="relative z-10">Reserve a Table</span>
            </Link>

            <button
              type="button"
              onClick={() => setTourModal(true)}
              className="group px-4 sm:px-5 py-3.5 sm:py-4 rounded-full border border-neutral-700/80 bg-neutral-900/60 text-neutral-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:border-amber-500/40 hover:text-amber-300 hover:bg-neutral-800/80 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" /> 360° Tour
            </button>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs text-neutral-300 animate-fade-up [animation-delay:600ms]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Instant Confirmation</span>
                <span className="text-[10px] text-neutral-400">Direct Email Voucher</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">4.9 / 5 Rating</span>
                <span className="text-[10px] text-neutral-400">1,400+ Verified Guests</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
