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
      <section className="relative min-h-[85vh] lg:min-h-[90vh] pt-4 sm:pt-6 pb-20 overflow-hidden flex items-center justify-center">
        
        {/* Dynamic Background Carousel */}
        <HeroBackground />

        {/* Glowing Background Ambient Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 blur-[160px] pointer-events-none rounded-full z-0" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-600/15 blur-[160px] pointer-events-none rounded-full z-0" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10 w-full mt-20 lg:mt-10">
          {/* Hero Content including Live Status and Table Finder */}
          <HeroClient />
        </div>
      </section>

      {/* ── REAL-TIME MEMBERSHIP BANNER ─────────────────────────────────── */}
      <div className="-mt-12 relative z-20">
        <MembershipBanner />
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <section className="border-y border-neutral-900 bg-neutral-950/90 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1.5 animate-fade-up">
              <p className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-400 tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-white uppercase tracking-widest">{s.label}</p>
              <p className="text-[11px] text-neutral-400 font-light">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGNATURE DISHES SHOWCASE WITH QUICK CART ────────────────────── */}
      <DishGallery />

      {/* ── LUXURY EXPERIENCES WITH CLEAR PRICING & INCLUSIONS ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">Curated Offerings</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">Unrivaled Dining Experiences</h2>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto font-light">
            All experiences detail complete inclusions, beverage options, and pricing breakdowns for complete clarity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map((exp) => {
            const IconComp = exp.icon;
            return (
              <div
                key={exp.title}
                className="card-glass rounded-3xl p-6 group flex flex-col justify-between border-neutral-800/80 hover:border-amber-500/50 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${exp.bg} pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">
                      {exp.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-[11px] text-amber-400 font-serif font-bold">{exp.price}</p>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    {exp.desc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1">
                      What&apos;s Included:
                    </p>
                    <ul className="space-y-1 text-[11px] text-neutral-300 font-light">
                      {exp.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-neutral-800/80 pt-4 mt-4 text-xs">
                  <Link
                    href={exp.href}
                    className="w-full py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center font-bold hover:bg-amber-500 hover:text-black transition"
                  >
                    Reserve Experience
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CHEF & HERITAGE STORY SECTION ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="card-glass rounded-3xl p-8 sm:p-12 border-amber-500/30 grid lg:grid-cols-12 gap-12 items-center relative overflow-hidden">

          <div className="lg:col-span-5 relative h-96 lg:h-[480px] rounded-2xl overflow-hidden border border-neutral-800">
            <Image
              src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80"
              alt="Executive Chef Antoine"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/30">
              <p className="text-xs font-serif italic text-amber-200">&quot;Haute cuisine is not merely about taste — it is an emotional harmony of memory, passion, and perfection.&quot;</p>
              <p className="text-[11px] font-bold text-white mt-2">— Executive Chef Antoine Laurent</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">Culinary Heritage</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white">The Pursuit of Gastronomic Perfection</h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              Founded on the principles of classic French technique and contemporary culinary innovation, VELORA brings world-class gastronomy to an intimate setting. Every ingredient is sourced directly from artisanal organic farms, local coastal fisheries, and historic wine estates.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 100% Biodynamic Organic Produce
                </div>
                <p className="text-[11px] text-neutral-400">Harvested daily from local partner farms</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> 28-Day Dry Aging Vault
                </div>
                <p className="text-[11px] text-neutral-400">Custom Himalayan salt brick aging room</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Zero-Waste Kitchen
                </div>
                <p className="text-[11px] text-neutral-400">100% sustainable culinary practices</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> French Pastry Laboratory
                </div>
                <p className="text-[11px] text-neutral-400">Artisanal chocolates &amp; soufflés made fresh</p>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/about" className="btn-primary text-xs py-3.5 px-8">
                Read Full Chef Story
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── UPCOMING GALA EVENTS & SOIRÉES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">Limited Capacity</span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white">Upcoming Special Events</h2>
          </div>
          <Link href="/reserve" className="text-xs text-amber-400 font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
            Reserve Event Seats <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {UPCOMING_EVENTS.filter(evt => {
            const eventDate = new Date(evt.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate >= today;
          }).map((evt) => (
            <div key={evt.title} className="card-glass rounded-3xl p-6 space-y-4 flex flex-col justify-between border-neutral-800/80 hover:border-amber-500/40">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                    {evt.tag}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400 font-mono">
                    {evt.seatsLeft}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white">{evt.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">{evt.desc}</p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-300">{evt.date}</p>
                  <p className="text-[10px] text-neutral-400">{evt.time}</p>
                </div>
                <Link
                  href={`/reserve?event=${encodeURIComponent(evt.title)}`}
                  className="px-4 py-2 rounded-full bg-amber-500 text-black text-[11px] font-bold hover:bg-amber-400 transition"
                >
                  Book Event
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS & CRITICAL ACCLAIM ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">Critical Acclaim</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">Recognized Worldwide</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item) => (
            <div key={item.author} className="card-glass rounded-3xl p-8 space-y-6 flex flex-col justify-between border-neutral-800/80">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm italic text-neutral-200 leading-relaxed font-serif">&quot;{item.quote}&quot;</p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80">
                <p className="text-sm font-bold text-white">{item.author}</p>
                <p className="text-xs text-amber-400 font-medium">{item.role}</p>
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
