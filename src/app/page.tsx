import Link from "next/link";
import Image from "next/image";
import { Star, Utensils, Crown, GlassWater, Gift, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";

import Newsletter from "@/components/Newsletter";
import { resolveImg } from "@/lib/image";

// Client Components
import HeroClient from "@/components/home/HeroClient";
import HeroBackground from "@/components/home/HeroBackground";
import DishGallery from "@/components/home/DishGallery";
import MembershipBanner from "@/components/home/MembershipBanner";
import FaqAccordion from "@/components/home/FaqAccordion";

const STATS = [
  { value: "2026", label: "Grand Opening", sub: "New Fine Dining Era" },
  { value: "3 ⭐", label: "Michelin Standard", sub: "Award-Winning Team" },
  { value: "1,400+", label: "VIP Patrons Served", sub: "Verified 4.9/5 Rating" },
  { value: "100%", label: "Organic & Farm Fresh", sub: "Zero-Waste Philosophy" },
];

const EXPERIENCES = [
  {
    icon: Utensils,
    title: "Seasonal 7-Course Tasting Menu",
    desc: "A gastronomic journey celebrating rare seasonal harvests, artisanal meats, and molecular French techniques.",
    price: "₹2,800 / Guest",
    inclusions: [
      "7 Amuse-Bouche & Gourmet Courses",
      "Artisanal Sourdough & Cultured Butter",
      "Pre-Dessert Palate Cleanser & Petit Fours",
      "Beverage pairing optional (GST additional)"
    ],
    href: "/menu",
    tag: "Most Popular",
    bg: "from-amber-500/10 via-transparent to-transparent",
  },
  {
    icon: Crown,
    title: "Chef's Table Experience",
    desc: "Sit directly before Executive Chef Antoine's open kitchen. 9-course personalized menu with rare cellar pairings.",
    price: "₹5,400 / Guest",
    inclusions: [
      "9-Course Bespoke Omakase Tasting",
      "Sommelier Grand Cru Wine Pairings Included",
      "Open Kitchen Front-Row Counter Seating",
      "Live Pastry Demo & Complimentary Digestif"
    ],
    href: "/reserve",
    tag: "VIP Exclusive",
    bg: "from-purple-500/10 via-transparent to-transparent",
  },
  {
    icon: GlassWater,
    title: "Virtual Wine Cellar Vault",
    desc: "Explore 2,500+ Grand Cru vintages, vintage Champagnes, and sommelier-guided tasting flights.",
    price: "From ₹3,800 / Bottle",
    inclusions: [
      "2,500+ Curated Vintage Cellar Bottles",
      "Sommelier Tasting Notes & Aeration",
      "Temperature-Controlled In-House Decanting",
      "Private Cellar Vault Guided Tour"
    ],
    href: "/cellar",
    tag: "Sommelier Choice",
    bg: "from-rose-500/10 via-transparent to-transparent",
  },
  {
    icon: Gift,
    title: "Digital Luxury Dining Vouchers",
    desc: "Surprise loved ones or corporate VIP guests with personalized gold-stamped digital gift passes delivered instantly.",
    price: "From ₹2,000 Voucher",
    inclusions: [
      "Gold-Stamped Digital Voucher Code",
      "Custom Personal Greeting Message",
      "1-Year Validity for Dining or Wine",
      "Instant Email & SMS Delivery"
    ],
    href: "/reserve",
    tag: "Instant Delivery",
    bg: "from-emerald-500/10 via-transparent to-transparent",
  },
];

const UPCOMING_EVENTS = [
  {
    title: "White Truffle & Barolo Gala Soirée",
    date: "August 22, 2026",
    time: "7:30 PM",
    desc: "An extravagant 6-course dinner featuring freshly flown Alba white truffles paired with aged Barolo vintages.",
    seatsLeft: "4 Seats Left",
    tag: "Gala Dinner",
  },
  {
    title: "Dom Pérignon Vintage Champagne Tasting",
    date: "August 29, 2026",
    time: "8:00 PM",
    desc: "Guided sommelier tasting of 5 vintage Dom Pérignon Champagnes accompanied by Oscietra caviar blinis.",
    seatsLeft: "6 Seats Left",
    tag: "Sommelier Masterclass",
  },
  {
    title: "Japanese Miyazaki A5 Wagyu Experience",
    date: "September 05, 2026",
    time: "7:00 PM",
    desc: "Live Binchotan charcoal grill presentation showcasing 4 distinct cuts of certified A5 Miyazaki Wagyu beef.",
    seatsLeft: "2 Seats Left",
    tag: "Chef's Table",
  },
];

const TESTIMONIALS = [
  {
    quote: "A flawlessly orchestrated 7-course tasting menu — every dish is a masterwork of texture, aroma, and visual elegance.",
    author: "The Michelin Guide 2026",
    role: "Official Inspector Review",
    rating: 5,
  },
  {
    quote: "Impeccable discreet service, breathtaking skylight terrace ambiance, and the single best Wagyu preparation in the country.",
    author: "Étoile Patron Review",
    role: "Verified VIP Guest",
    rating: 5,
  },
  {
    quote: "VELORA sets the absolute benchmark for modern French luxury dining with an unmissable wine cellar collection.",
    author: "Culinary International",
    role: "Executive Food Editor",
    rating: 5,
  },
];

export default function Home() {
  return (
    <main className="space-y-16 sm:space-y-28 overflow-x-hidden pb-16">

      {/* ── LUXURY FULL-SCREEN HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 overflow-hidden flex flex-col justify-center">
        
        {/* Dynamic Background Carousel */}
        <HeroBackground />

        {/* Glowing Background Ambient Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 blur-[160px] pointer-events-none rounded-full z-0" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-600/15 blur-[160px] pointer-events-none rounded-full z-0" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 w-full">
          {/* Hero Content including Live Status and Table Finder */}
          <HeroClient />
        </div>
      </section>

      {/* ── REAL-TIME MEMBERSHIP BANNER ─────────────────────────────────── */}
      <div className="relative z-20">
        <MembershipBanner />
      </div>

      {/* ── STATS STRIP (Floating Glass Bar) ────────────────────────────── */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-16 mb-16">
        <div className="bg-neutral-950/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] rounded-3xl py-10 px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out" />
          {STATS.map((s, idx) => (
            <div key={s.label} className={`space-y-2 relative z-10 transition-transform duration-300 hover:-translate-y-1 ${idx !== 0 ? 'md:border-l border-white/5' : ''}`}>
              <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-black bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">{s.value}</p>
              <p className="text-xs font-bold text-white uppercase tracking-widest">{s.label}</p>
              <p className="text-[11px] text-neutral-400 font-light">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGNATURE DISHES SHOWCASE WITH QUICK CART ────────────────────── */}
      <DishGallery />

      {/* ── LUXURY EXPERIENCES (BENTO BOX) ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400">Curated Offerings</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">Unrivaled Dining Experiences</h2>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto font-light">
            All experiences detail complete inclusions, beverage options, and pricing breakdowns for complete clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(320px,auto)]">
          {EXPERIENCES.map((exp, idx) => {
            const IconComp = exp.icon;
            // First item spans 8 columns, second spans 4. Third spans 5, fourth spans 7.
            const colSpan = idx === 0 ? "md:col-span-8" : idx === 1 ? "md:col-span-4" : idx === 2 ? "md:col-span-5" : "md:col-span-7";
            return (
              <div
                key={exp.title}
                className={`card-glass rounded-3xl p-8 group flex flex-col justify-between border-white/5 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden transition-all duration-500 ${colSpan}`}
              >
                {/* Background Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${exp.bg} opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
                <div className="absolute -inset-x-full top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-xl">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black/40 text-amber-300 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-inner">
                      {exp.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors duration-300 mb-2 leading-tight">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-amber-400 font-mono font-bold tracking-wider">{exp.price}</p>
                  </div>

                  <p className="text-sm text-neutral-400 leading-relaxed font-light">
                    {exp.desc}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300 font-light">
                      {exp.inclusions.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500/70 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="relative z-10 pt-6 mt-4 flex items-center justify-end">
                  <Link
                    href={exp.href}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 group/btn"
                  >
                    <span>Reserve Experience</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CHEF & HERITAGE STORY (Editorial Layout) ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative rounded-[2.5rem] bg-neutral-900 overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
          
          <div className="grid lg:grid-cols-12 gap-0 relative z-10">
            {/* Left Image Section */}
            <div className="lg:col-span-5 relative h-[500px] lg:h-[600px] group">
              <div className="absolute inset-0 bg-amber-500/10 mix-blend-color z-10 group-hover:bg-transparent transition-colors duration-700" />
              <Image
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80"
                alt="Executive Chef Antoine"
                fill
                className="object-cover transition-transform duration-[10s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-neutral-900/40 lg:to-neutral-900 z-20" />
              
              {/* Floating Quote Badge */}
              <div className="absolute bottom-8 left-8 right-8 lg:right-auto lg:-right-16 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 transform lg:translate-y-12">
                <p className="text-sm sm:text-base font-serif italic text-amber-100 leading-relaxed">&quot;Haute cuisine is not merely about taste — it is an emotional harmony of memory, passion, and perfection.&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-[1px] bg-amber-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Executive Chef Antoine Laurent</p>
                </div>
              </div>
            </div>

            {/* Right Text Section */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-20 flex flex-col justify-center space-y-8 bg-neutral-900">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400">Culinary Heritage</span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-white leading-[1.1]">The Pursuit of <br/><span className="text-gold-gradient italic">Gastronomic Perfection</span></h2>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-light max-w-xl">
                  Founded on the principles of classic French technique and contemporary culinary innovation, VELORA brings world-class gastronomy to an intimate setting. Every ingredient is sourced directly from artisanal organic farms, local coastal fisheries, and historic wine estates.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t border-white/5">
                {[
                  { icon: CheckCircle2, title: "100% Biodynamic Organic Produce", desc: "Harvested daily from local partner farms" },
                  { icon: CheckCircle2, title: "28-Day Dry Aging Vault", desc: "Custom Himalayan salt brick aging room" },
                  { icon: CheckCircle2, title: "Zero-Waste Kitchen", desc: "100% sustainable culinary practices" },
                  { icon: CheckCircle2, title: "French Pastry Laboratory", desc: "Artisanal chocolates & soufflés made fresh" },
                ].map((item) => (
                  <div key={item.title} className="space-y-1.5 group">
                    <div className="flex items-center gap-2 text-white font-serif font-bold text-sm group-hover:text-amber-400 transition-colors">
                      <item.icon className="w-4 h-4 text-amber-500" /> {item.title}
                    </div>
                    <p className="text-[11px] text-neutral-500 font-light pl-6">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <Link href="/about" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-extrabold text-[11px] uppercase tracking-[0.2em] hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300">
                  Read Full Chef Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING GALA EVENTS & SOIRÉES (Glowing Cards) ──────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400">Limited Capacity</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white">Upcoming Special Events</h2>
          </div>
          <Link href="/reserve" className="group flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all duration-300">
            Reserve Event Seats <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {UPCOMING_EVENTS.filter(evt => {
            const eventDate = new Date(evt.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
          }).map((evt) => (
            <div key={evt.title} className="group relative rounded-3xl bg-neutral-900 border border-white/5 p-8 flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(245,158,11,0.15)] transition-all duration-500 hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <Crown className="w-32 h-32 text-amber-500 rotate-12" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20">
                    {evt.tag}
                  </span>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{evt.seatsLeft}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors mb-3 leading-tight">{evt.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-light">{evt.desc}</p>
                </div>
              </div>

              <div className="relative z-10 pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-950 flex flex-col items-center justify-center border border-white/10 shadow-inner">
                    <span className="text-xs text-amber-500 font-bold leading-none">{evt.date.split(" ")[0].slice(0,3)}</span>
                    <span className="text-sm text-white font-black leading-none mt-1">{evt.date.split(" ")[1].replace(',', '')}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{evt.date.split(" ")[2]}</p>
                    <p className="text-xs text-white font-bold">{evt.time}</p>
                  </div>
                </div>
              </div>
              
              {/* Overlay link to make entire card clickable optionally, or leave as is */}
              <Link href={`/reserve?event=${encodeURIComponent(evt.title)}`} className="absolute inset-0 z-20">
                <span className="sr-only">Book {evt.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS & CRITICAL ACCLAIM (Editorial Carousel style) ────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400">Critical Acclaim</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">Recognized Worldwide</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <div key={item.author} className="relative rounded-[2rem] bg-neutral-900 p-8 sm:p-10 flex flex-col justify-between border border-white/5 shadow-2xl group hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
              <div className="absolute -top-6 -right-6 text-[120px] font-serif text-white/5 group-hover:text-amber-500/10 transition-colors duration-500 leading-none select-none">
                &quot;
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex gap-1.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  ))}
                </div>
                <p className="text-lg italic text-neutral-300 leading-relaxed font-serif">&quot;{item.quote}&quot;</p>
              </div>

              <div className="relative z-10 pt-8 mt-8 border-t border-white/5">
                <p className="text-base font-bold text-white uppercase tracking-wider">{item.author}</p>
                <p className="text-xs text-amber-500 font-bold tracking-widest mt-1 uppercase">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS (DYNAMIC ACCORDION) ──────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">Guest Information</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto font-light">
            Click on any question below to expand detailed information regarding bookings, dietary options, dress code, and policies.
          </p>
        </div>

        <FaqAccordion />
      </section>

      {/* ── VIP NEWSLETTER CLUB & FOOTER FORM ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <Newsletter />
      </section>

    </main>
  );
}
