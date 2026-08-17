"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Star, Award, Crown, Utensils, GlassWater, Gift,
  ChevronRight, ShieldCheck, Clock, Eye, X, Compass, MapPin,
  Calendar, Users, Flame, Wine, CheckCircle2, ChevronDown,
  ArrowRight, Search, Info
} from "lucide-react";
import Newsletter from "@/components/Newsletter";
import { useLanguage } from "@/lib/LanguageContext";
import { resolveImg } from "@/lib/image";

// ── STATS STRIP ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "2026", label: "Grand Opening", sub: "New Fine Dining Era" },
  { value: "3 ⭐", label: "Michelin Standard", sub: "Award-Winning Team" },
  { value: "1,400+", label: "VIP Patrons Served", sub: "Verified 4.9/5 Rating" },
  { value: "100%", label: "Organic & Farm Fresh", sub: "Zero-Waste Philosophy" },
];

// ── 360° AMBIENCE ROOMS ─────────────────────────────────────────────────────
const ROOMS_360 = [
  {
    id: "main",
    name: "Main Dining Salon",
    desc: "Warm ambient candlelight, velvet plush booths, and live acoustic jazz evening stage.",
    capacity: "Up to 80 Guests",
    vibe: "Intimate & Romantic",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    badge: "Most Popular",
  },
  {
    id: "terrace",
    name: "VIP Skylight Terrace",
    desc: "Glass skylight ceiling with panoramic moonlit skyline views and private champagne lounge.",
    capacity: "Up to 35 Guests",
    vibe: "Starlit Sky & Luxury",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    badge: "Panoramic Views",
  },
  {
    id: "patio",
    name: "Garden Patio & Rose Lanterns",
    desc: "Alfresco courtyard dining under heated rose lanterns surrounded by botanical water fountains.",
    capacity: "Up to 45 Guests",
    vibe: "Fresh & Botanical",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    badge: "Open Air Dining",
  },
  {
    id: "cellar",
    name: "Grand Wine Vault",
    desc: "Subterranean temperature-controlled cellar surrounded by 2,500+ Grand Cru vintage bottles.",
    capacity: "Up to 14 Guests",
    vibe: "Exclusive Private Tasting",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    badge: "Sommelier Reserve",
  },
];

// ── SIGNATURE DISHES SHOWCASE ───────────────────────────────────────────────
const SIGNATURE_DISHES = [
  {
    id: "wagyu",
    category: "tasting",
    name: "A5 Miyazaki Wagyu Striploin",
    desc: "Seared over Japanese Binchotan charcoal, truffle bone marrow jus, 24K edible gold leaf, and smoked sea salt.",
    price: "₹3,400",
    prepTime: "25 mins",
    dietary: ["Gluten-Free", "Chef Signature"],
    pairing: "2015 Château Margaux Premier Grand Cru",
    rating: 4.95,
    reviews: 142,
    img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "lobster",
    category: "tasting",
    name: "Brittany Blue Lobster Bisque",
    desc: "Butter-poached lobster tail, saffron velvet reduction, Oscietra caviar pearls, and fresh tarragon oil.",
    price: "₹2,850",
    prepTime: "20 mins",
    dietary: ["Seafood Specialty", "Pescatarian"],
    pairing: "2020 Domaine Leflaive Puligny-Montrachet",
    rating: 4.92,
    reviews: 98,
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "souffle",
    category: "dessert",
    name: "Golden Valrhona Soufflé",
    desc: "70% Guanaja dark chocolate soufflé, warm liquid gold praline center, and hand-churned Madagascar vanilla gelato.",
    price: "₹1,450",
    prepTime: "18 mins",
    dietary: ["Vegetarian", "Sweet Masterpiece"],
    pairing: "Château d'Yquem Sauternes 2011",
    rating: 4.98,
    reviews: 186,
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "truffle-pasta",
    category: "tasting",
    name: "Black Winter Truffle Tagliolini",
    desc: "House-made egg yolk pasta, 36-month Parmigiano-Reggiano cream, shaved fresh Périgord black truffles.",
    price: "₹2,600",
    prepTime: "15 mins",
    dietary: ["Vegetarian", "Fresh Truffles"],
    pairing: "2018 Barolo Monfortino Riserva",
    rating: 4.90,
    reviews: 112,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTDA-tAexC8nFu3q5g3cH2nHlsRi0wg1Lp_5LMkuQcjplY0ZGT9SoEewc&s=10",
  },
];

// ── LUXURY EXPERIENCES WITH CLEAR PRICING & INCLUSIONS ───────────────────────
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

// ── GALA EVENTS ─────────────────────────────────────────────────────────────
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

// ── TESTIMONIALS & PRESS ────────────────────────────────────────────────────
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

// ── FREQUENTLY ASKED QUESTIONS (DYNAMIC ACCORDION) ──────────────────────────
const FAQS = [
  {
    q: "How far in advance should table reservations be booked?",
    a: "For weekend dining and VIP Skylight Terrace seating, we advise booking 1 to 2 weeks in advance. Weekday lunch and dinner slots are available up to 48 hours prior. For same-day VIP seating, please contact our concierge desk directly.",
  },
  {
    q: "Can dietary restrictions or allergies be accommodated?",
    a: "Yes, absolutely. Our culinary team accommodates vegetarian, vegan, gluten-free, dairy-free, and pescatarian preferences. Please specify your requirements when booking so Chef Antoine can tailor your tasting courses.",
  },
  {
    q: "What is the dress code policy at VELORA?",
    a: "We observe a Smart Elegant dress code. Tailored jackets, evening dresses, or refined attire are recommended. Athletic wear, casual beach sandals, and baseball caps are strictly discouraged.",
  },
  {
    q: "Is valet parking available upon arrival?",
    a: "Yes, complimentary private white-glove valet parking is included for all dining guests right at our main entrance.",
  },
  {
    q: "What is the cancellation & modification policy for bookings?",
    a: "Reservations can be modified or cancelled up to 24 hours prior to your seating without charge. For private dining rooms and Chef's Table experiences, cancellations within 48 hours incur a nominal deposit fee.",
  },
  {
    q: "Do you host private corporate events and wedding receptions?",
    a: "Yes. Our VIP Skylight Terrace and Grand Wine Vault can be reserved for private banquets, corporate dinners, or intimate wedding receptions with custom tasting menus and dedicated sommelier service.",
  },
];

export default function Home() {
  const { t } = useLanguage();

  // 360 Tour Modal State
  const [tourModal, setTourModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(ROOMS_360[0]);

  // Dish Quick View Modal State
  const [selectedDish, setSelectedDish] = useState<typeof SIGNATURE_DISHES[0] | null>(null);

  // Dish Category Filter
  const [activeCategory, setActiveCategory] = useState<"all" | "tasting" | "dessert">("all");

  // Quick Table Finder State
  const [quickGuests, setQuickGuests] = useState("2");
  const [quickDate, setQuickDate] = useState("2026-08-10");
  const [quickTime, setQuickTime] = useState("20:00");
  const [quickArea, setQuickArea] = useState("Main Dining Salon");

  // FAQ Accordion Toggle
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const filteredDishes = activeCategory === "all"
    ? SIGNATURE_DISHES
    : SIGNATURE_DISHES.filter((d) => d.category === activeCategory);

  return (
    <main className="space-y-16 sm:space-y-28 overflow-x-hidden pb-16">

      {/* ── 360° VIRTUAL TOUR MODAL ───────────────────────────────────── */}
      {tourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-up">
          <div className="w-full max-w-4xl rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

            <button
              onClick={() => setTourModal(false)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500/40 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  360° Virtual Dining Ambience Tour
                  <span className="text-[10px] uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-sans font-bold">
                    HD Interactive
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">Step inside L&apos;Étoile Dorée luxury spaces before reserving your table</p>
              </div>
            </div>

            {/* Room Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              {ROOMS_360.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${activeRoom.id === room.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                    : "bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
                    }`}
                >
                  <span className="font-serif font-bold text-sm text-white mb-1">{room.name}</span>
                  <span className="text-[10px] text-amber-400/80 font-mono">{room.badge}</span>
                </button>
              ))}
            </div>

            {/* 360 Viewport Display */}
            <div className="w-full h-80 rounded-2xl border border-amber-500/30 relative flex flex-col items-center justify-end p-6 overflow-hidden shadow-2xl group">
              <Image
                src={activeRoom.img}
                alt={activeRoom.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              <div className="relative z-10 text-center space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  360° Panorama · {activeRoom.vibe}
                </div>
                <h4 className="text-2xl font-serif font-bold text-white">{activeRoom.name}</h4>
                <p className="text-xs text-neutral-300 font-light leading-relaxed">{activeRoom.desc}</p>
                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-medium text-amber-300/90">
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> {activeRoom.capacity}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Ground &amp; Skylight Level</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/reserve?area=${encodeURIComponent(activeRoom.name)}`}
                onClick={() => setTourModal(false)}
                className="btn-primary text-center flex-1 py-3.5 text-xs tracking-widest"
              >
                Book Table in {activeRoom.name}
              </Link>
              <button
                type="button"
                onClick={() => setTourModal(false)}
                className="btn-outline py-3.5 text-xs tracking-widest"
              >
                Close Panorama
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISH QUICK VIEW MODAL ─────────────────────────────────────── */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-up">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white transition z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 sm:h-full rounded-2xl overflow-hidden border border-neutral-800">
                <Image
                  src={resolveImg(selectedDish.img)}
                  alt={selectedDish.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {selectedDish.dietary.map((d) => (
                    <span key={d} className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                      {d}
                    </span>
                  ))}
                </div>

                <h3 className="text-2xl font-serif font-bold text-white">{selectedDish.name}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">{selectedDish.desc}</p>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Sommelier Pairing:</span>
                    <span className="font-bold text-amber-300">{selectedDish.pairing}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Preparation Time:</span>
                    <span className="text-white font-mono">{selectedDish.prepTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-neutral-400 block">Price</span>
                    <span className="text-2xl font-serif font-bold text-amber-400">{selectedDish.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/menu"
                      onClick={() => setSelectedDish(null)}
                      className="btn-primary text-xs py-3 px-5"
                    >
                      Order Live
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LUXURY FULL-SCREEN HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] pt-4 sm:pt-6 pb-20 overflow-hidden flex items-center justify-center">

        {/* Full-Screen Luxury Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src={resolveImg("/images/hero.jpg")}
            alt="VELORA Luxury Restaurant Ambience"
            fill
            priority
            className="object-cover object-center scale-105 filter brightness-[0.4] contrast-125 transition-transform duration-1000"
          />
          {/* Dark Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/75 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
        </div>

        {/* Glowing Background Ambient Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/20 blur-[160px] pointer-events-none rounded-full z-0" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-amber-600/15 blur-[160px] pointer-events-none rounded-full z-0" />

        <div className="mx-auto max-w-7xl px-6 relative z-10 space-y-16 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-8 animate-fade-up">

              {/* Status & Michelin Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-emerald-300 backdrop-blur-md shadow-lg shadow-emerald-950/40 badge-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Open Tonight · 4 VIP Tables Remaining
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

            {/* Right Hero Showcase Card */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-amber-500/50 shadow-2xl shadow-amber-500/10 group">
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                  alt="VELORA Fine Dining Ambience"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Floating Glass Badge Overlay 1 */}
                <div className="absolute top-6 left-6 card-glass p-4 rounded-2xl max-w-xs border-amber-500/40 animate-fade-up">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-serif text-lg">
                      7
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Seasonal Tasting Menu</p>
                      <p className="text-[10px] text-amber-300">Curated by Chef Antoine</p>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badge Overlay 2 */}
                <div className="absolute bottom-6 right-6 card-glass p-4 rounded-2xl max-w-xs border-amber-500/40 animate-fade-up">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Wine className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Grand Cru Cellar</p>
                      <p className="text-[10px] text-neutral-400">2,500+ Vintage Bottles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── HIGH PROMINENCE TABLE RESERVATION SEARCH CARD FRAME ───────────── */}
          <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-10 border-2 border-amber-500/60 bg-neutral-950/95 shadow-[0_0_60px_rgba(245,158,11,0.25)] backdrop-blur-2xl ring-1 ring-amber-400/30 transition-all duration-300">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

            <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                  📍
                </span>
                <div>
                  <h2 className="text-xs sm:text-sm font-serif font-bold text-white uppercase tracking-wider sm:tracking-widest flex items-center gap-2 flex-wrap">
                    <span>Instant Table Finder</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Step 1 of 2
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-light">Select your party size, date, time &amp; preferred dining ambience zone</p>
                </div>
              </div>

              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> No Booking Fees
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-end">

              {/* Guests */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-300 block mb-1.5 font-bold">
                  Party Size
                </label>
                <div className="relative">
                  <select
                    value={quickGuests}
                    onChange={(e) => setQuickGuests(e.target.value)}
                    className="input-base py-3.5 pr-8 text-xs font-bold appearance-none cursor-pointer bg-neutral-900 border-amber-500/30 hover:border-amber-400"
                  >
                    <option value="1" className="bg-neutral-900">1 Guest (Solo Dining)</option>
                    <option value="2" className="bg-neutral-900">2 Guests (Couple)</option>
                    <option value="4" className="bg-neutral-900">4 Guests (Group)</option>
                    <option value="6" className="bg-neutral-900">6 Guests (Family)</option>
                    <option value="8" className="bg-neutral-900">8+ Guests (Private Party)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-4 pointer-events-none" />
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
                  className="input-base py-3.5 text-xs font-bold cursor-pointer bg-neutral-900 border-amber-500/30 hover:border-amber-400"
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
                    className="input-base py-3.5 pr-8 text-xs font-bold appearance-none cursor-pointer bg-neutral-900 border-amber-500/30 hover:border-amber-400"
                  >
                    <option value="19:00" className="bg-neutral-900">7:00 PM (Dinner)</option>
                    <option value="20:00" className="bg-neutral-900">8:00 PM (Prime Hour)</option>
                    <option value="21:00" className="bg-neutral-900">9:00 PM (Late Night)</option>
                    <option value="13:00" className="bg-neutral-900">1:00 PM (Lunch Soirée)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-4 pointer-events-none" />
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
                    className="input-base py-3.5 pr-8 text-xs font-bold appearance-none cursor-pointer bg-neutral-900 border-amber-500/30 hover:border-amber-400"
                  >
                    <option value="Main Dining Salon" className="bg-neutral-900">Main Salon</option>
                    <option value="VIP Skylight Terrace" className="bg-neutral-900">Skylight Terrace</option>
                    <option value="Garden Patio" className="bg-neutral-900">Garden Patio</option>
                    <option value="Grand Wine Vault" className="bg-neutral-900">Grand Wine Vault</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-4 pointer-events-none" />
                </div>
              </div>

              {/* Find Table CTA */}
              <Link
                href={`/reserve?guests=${quickGuests}&date=${quickDate}&time=${quickTime}&area=${encodeURIComponent(quickArea)}`}
                className="btn-primary py-3.5 text-xs font-extrabold tracking-widest text-center justify-center shadow-xl shadow-amber-500/30 hover:scale-105 transition-all"
              >
                <Search className="w-4 h-4 mr-2" />
                Find Available Table
              </Link>

            </div>
          </div>

        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <section className="border-y border-neutral-900 bg-neutral-950/90 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1.5">
              <p className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-amber-400 tracking-tight">{s.value}</p>
              <p className="text-xs font-bold text-white uppercase tracking-widest">{s.label}</p>
              <p className="text-[11px] text-neutral-400 font-light">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SIGNATURE DISHES SHOWCASE ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Culinary Artistry
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-white">Chef&apos;s Signature Masterpieces</h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-light">
              Each dish is meticulously crafted using rare seasonal ingredients, French classical reduction techniques, and modern flavor alchemy.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1.5 rounded-full bg-neutral-950 border border-neutral-800">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "all"
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
                }`}
            >
              All Highlights
            </button>
            <button
              onClick={() => setActiveCategory("tasting")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "tasting"
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
                }`}
            >
              Savory Courses
            </button>
            <button
              onClick={() => setActiveCategory("dessert")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "dessert"
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
                }`}
            >
              Artisanal Sweets
            </button>
          </div>
        </div>

        {/* Dish Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              onClick={() => setSelectedDish(dish)}
              className="card-glass rounded-3xl overflow-hidden group flex flex-col justify-between cursor-pointer border-neutral-800/80 hover:border-amber-500/40"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={resolveImg(dish.img)}
                    alt={dish.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3 flex gap-1">
                    {dish.dietary.slice(0, 1).map((d) => (
                      <span key={d} className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-400 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dish.rating}</span>
                    <span className="text-neutral-400 font-normal">({dish.reviews})</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-400 transition">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 font-light">
                    {dish.desc}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-4 text-xs">
                <span className="text-lg font-serif font-bold text-amber-300">{dish.price}</span>
                <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                  Quick View <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link href="/menu" className="btn-outline text-xs py-3.5 px-8 tracking-widest inline-flex items-center gap-2">
            View Complete Seasonal Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

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

                  {/* Explicit Inclusions List */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1">
                      <Info className="w-3 h-3 text-amber-400" /> What&apos;s Included:
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
              Founded on the principles of classic French technique and contemporary culinary innovation, L&apos;Étoile Dorée brings world-class gastronomy to an intimate setting. Every ingredient is sourced directly from artisanal organic farms, local coastal fisheries, and historic wine estates.
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
          {UPCOMING_EVENTS.map((evt) => (
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

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={faq.q}
                className="card-glass rounded-2xl border-neutral-800/80 overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between text-white font-serif font-bold text-base hover:text-amber-400 transition"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-neutral-300 leading-relaxed font-light border-t border-neutral-800/60 pt-4 animate-fade-up">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── VIP NEWSLETTER CLUB & FOOTER FORM ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <Newsletter />
      </section>

    </main>
  );
}
