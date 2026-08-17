"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Utensils, ArrowRight, Calendar, Eye, ShieldCheck, Star, Clock, Search, CheckCircle2, ChevronDown } from "lucide-react";
import VirtualTourModal from "./VirtualTourModal";

export default function Hero() {
  // 360 Tour Modal State
  const [tourModal, setTourModal] = useState(false);

  // Quick Table Finder State
  const [quickGuests, setQuickGuests] = useState("2");
  const [quickDate, setQuickDate] = useState("2026-08-10");
  const [quickTime, setQuickTime] = useState("20:00");
  const [quickArea, setQuickArea] = useState("Main Dining Salon");

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
      
      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10 w-full animate-fade-up">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-8">

          {/* Status & Michelin Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40 badge-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Open Tonight · {tablesLeft} VIP Tables Remaining
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
              <Award className="w-4 h-4 text-amber-400" />
              Michelin Guide 2026 Recommended
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
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
          <p className="text-neutral-200 max-w-xl leading-relaxed text-base sm:text-lg font-light drop-shadow">
            Experience ultra-modern French culinary heritage redefined. 7-course seasonal tasting menus, 2,500+ Grand Cru cellar vintages, and extraordinary starlit dining ambiances.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 flex-wrap items-center pt-2">
            <Link
              href="/menu"
              className="px-5 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-300/40 flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-black" />
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>

            <Link
              href="/reserve"
              className="px-5 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-amber-400/60 bg-neutral-950/70 text-amber-300 hover:text-white hover:border-amber-400 hover:bg-amber-500/20 font-bold text-[11px] sm:text-xs uppercase tracking-widest backdrop-blur-md shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Reserve a Table</span>
            </Link>

            <button
              type="button"
              onClick={() => setTourModal(true)}
              className="px-4 sm:px-5 py-3.5 sm:py-4 rounded-full border border-neutral-700/80 bg-neutral-900/60 text-neutral-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:border-amber-500/40 hover:text-amber-300 backdrop-blur-md transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-amber-400" /> 360° Tour
            </button>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs text-neutral-300">
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

        {/* HIGH PROMINENCE TABLE RESERVATION SEARCH CARD FRAME */}
        <div className="lg:col-span-5 relative mt-8 lg:mt-0">
          <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-amber-500/60 bg-neutral-950/95 shadow-[0_0_60px_rgba(245,158,11,0.25)] backdrop-blur-2xl ring-1 ring-amber-400/30 transition-all duration-300 h-full flex flex-col justify-between">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

            <div>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                    📍
                  </span>
                  <div>
                    <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest flex items-center gap-2 flex-wrap">
                      <span>Instant Table Finder</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Live Status
                      </span>
                    </h2>
                    <p className="text-xs text-neutral-400 font-light mt-1">Select your party size, date, time &amp; preferred dining ambience</p>
                  </div>
                </div>

                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No Booking Fees
                </span>
              </div>

              <div className="space-y-4">
                {/* Guests */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-300 block mb-1.5 font-bold">
                    Party Size
                  </label>
                  <div className="relative">
                    <select
                      value={quickGuests}
                      onChange={(e) => setQuickGuests(e.target.value)}
                      className="w-full bg-neutral-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-amber-400 outline-none appearance-none cursor-pointer"
                    >
                      <option value="1">1 Guest (Solo Dining)</option>
                      <option value="2">2 Guests (Couple)</option>
                      <option value="4">4 Guests (Group)</option>
                      <option value="6">6 Guests (Family)</option>
                      <option value="8">8+ Guests (Private Party)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-300 block mb-1.5 font-bold">
                    Date
                  </label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-amber-400 outline-none cursor-pointer"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-300 block mb-1.5 font-bold">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <select
                      value={quickTime}
                      onChange={(e) => setQuickTime(e.target.value)}
                      className="w-full bg-neutral-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-amber-400 outline-none appearance-none cursor-pointer"
                    >
                      <option value="19:00">7:00 PM (Dinner)</option>
                      <option value="20:00">8:00 PM (Prime Hour)</option>
                      <option value="21:00">9:00 PM (Late Night)</option>
                      <option value="13:00">1:00 PM (Lunch Soirée)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Seating Area */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-neutral-300 block mb-1.5 font-bold">
                    Ambience Zone
                  </label>
                  <div className="relative">
                    <select
                      value={quickArea}
                      onChange={(e) => setQuickArea(e.target.value)}
                      className="w-full bg-neutral-900 border border-amber-500/30 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-amber-400 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Main Dining Salon">Main Salon</option>
                      <option value="VIP Skylight Terrace">Skylight Terrace</option>
                      <option value="Garden Patio">Garden Patio</option>
                      <option value="Grand Wine Vault">Grand Wine Vault</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-amber-400 absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Find Table CTA */}
            <Link
              href={`/reserve?guests=${quickGuests}&date=${quickDate}&time=${quickTime}&area=${encodeURIComponent(quickArea)}`}
              className="mt-6 w-full flex items-center justify-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold px-8 py-4 rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-300/40"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Available Table
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
