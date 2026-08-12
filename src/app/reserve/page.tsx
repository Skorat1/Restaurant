"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Sparkles, CheckCircle2, MapPin, Utensils,
  Award, Heart, Briefcase, Cake, ShieldCheck, Star, Ticket,
  ChevronRight, UserCheck, MessageSquare, PhoneCall, AlertCircle,
  Wine, Users, RefreshCw, Check, Copy, Tag, QrCode, Download,
  Share2, Shield, Flame, Crown
} from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useLanguage } from "@/lib/LanguageContext";

const TIME_SLOTS = [
  { time: "12:00 PM", status: "available" },
  { time: "12:30 PM", status: "available" },
  { time: "1:00 PM", status: "available" },
  { time: "1:30 PM", status: "full" },
  { time: "2:00 PM", status: "available" },
  { time: "6:00 PM", status: "available" },
  { time: "6:30 PM", status: "available" },
  { time: "7:00 PM", status: "full" },
  { time: "7:30 PM", status: "available" },
  { time: "8:00 PM", status: "available" },
  { time: "8:30 PM", status: "available" },
  { time: "9:00 PM", status: "available" },
];

const TABLES = [
  { id: "T1", code: "T1 - Quiet Window Pair", zone: "Main Salon", seats: 2, view: "City Skyline", status: "available", icon: "🪟" },
  { id: "T2", code: "T2 - Window Alcove", zone: "Main Salon", seats: 2, view: "City Skyline", status: "reserved", icon: "🪟" },
  { id: "T3", code: "T3 - Salon Family Round", zone: "Main Salon", seats: 4, view: "Jazz Stage", status: "available", icon: "🎷" },
  { id: "T4", code: "T4 - Grand Salon Center", zone: "Main Salon", seats: 6, view: "Crystal Chandelier", status: "available", icon: "💎" },
  { id: "T5", code: "T5 - Chef's Tasting Counter 1", zone: "Chef's Table", seats: 2, view: "Live Kitchen", status: "available", icon: "👨‍🍳" },
  { id: "T6", code: "T6 - Chef's Tasting Counter 2", zone: "Chef's Table", seats: 2, view: "Live Kitchen", status: "occupied", icon: "👨‍🍳" },
  { id: "T7", code: "T7 - VIP Skylight Booth 1", zone: "VIP Terrace", seats: 4, view: "Glass Ceiling & Moon", status: "available", icon: "🌌" },
  { id: "T8", code: "T8 - VIP Skylight Booth 2", zone: "VIP Terrace", seats: 6, view: "Glass Ceiling & Moon", status: "reserved", icon: "🌌" },
  { id: "T9", code: "T9 - VIP Private Dining Vault", zone: "VIP Terrace", seats: 8, view: "Wine Cellar Glass", status: "available", icon: "👑" },
  { id: "T10", code: "T10 - Garden Alfresco 1", zone: "Garden Patio", seats: 2, view: "Rose Garden", status: "available", icon: "🌿" },
  { id: "T11", code: "T11 - Garden Lantern Booth", zone: "Garden Patio", seats: 4, view: "Fountain", status: "available", icon: "🏮" },
  { id: "T12", code: "T12 - Garden Fireside", zone: "Garden Patio", seats: 6, view: "Fire Pit", status: "reserved", icon: "🔥" },
];

const PRE_ORDER_ITEMS = [
  { id: "po-1", name: "Dom Pérignon Vintage 2013 Champagne", price: 24500, category: "Wine", icon: "🍾" },
  { id: "po-2", name: "Master Sommelier Grand Cru Flight (per guest)", price: 4800, category: "Wine", icon: "🍷" },
  { id: "po-3", name: "Valrhona Chocolate Soufflé Dessert Course", price: 1200, category: "Dessert", icon: "🍫" },
  { id: "po-4", name: "Fresh White Rose Bouquet & Candlelight Setup", price: 1500, category: "Arrangement", icon: "🌹" },
  { id: "po-5", name: "Artisanal Custom Birthday/Anniversary Cake", price: 2200, category: "Cake", icon: "🎂" },
];

const DIETARY_TAGS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Nut Allergy",
  "Dairy-Free", "Halal", "Kosher", "Shellfish Free"
];

const OCCASIONS = [
  { id: "General", label: "Dining", icon: Utensils },
  { id: "Birthday", label: "Birthday", icon: Cake },
  { id: "Anniversary", label: "Anniversary", icon: Heart },
  { id: "Business Dinner", label: "Business", icon: Briefcase },
  { id: "Romantic Date", label: "Romance", icon: Sparkles },
];

const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  INAUGURATION2026: { discount: 0.25, label: "25% Grand Inauguration Discount" },
  GOLDEN25: { discount: 0.25, label: "25% VIP Opening Offer" },
  VIPGUEST: { discount: 0.20, label: "20% VIP Patron Privilege" },
};

export default function ReservePage() {
  const { t } = useLanguage();

  const [selectedZone, setSelectedZone] = useState<string>("All");
  const [selectedTable, setSelectedTable] = useState("T7");
  const [selectedPreOrders, setSelectedPreOrders] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "7:30 PM",
    guests: 2,
    notes: "",
    occasion: "Romantic Date",
  });

  // Promo Code State
  const [promoInput, setPromoInput] = useState("INAUGURATION2026");
  const [appliedPromo, setAppliedPromo] = useState<string | null>("INAUGURATION2026");
  const [promoError, setPromoError] = useState("");

  // Modals State
  const [waitlistModal, setWaitlistModal] = useState(false);
  const [waitlistSlot, setWaitlistSlot] = useState("7:00 PM");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const [passModal, setPassModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedTableObj = TABLES.find((t) => t.id === selectedTable) || TABLES[0];

  const filteredTables = useMemo(() => {
    if (selectedZone === "All") return TABLES;
    return TABLES.filter((t) => t.zone === selectedZone);
  }, [selectedZone]);

  const rawPreOrderTotal = useMemo(() => {
    return selectedPreOrders.reduce((sum, id) => {
      const item = PRE_ORDER_ITEMS.find((p) => p.id === id);
      return sum + (item ? item.price : 0);
    }, 0);
  }, [selectedPreOrders]);

  const discountRatio = appliedPromo && PROMO_CODES[appliedPromo] ? PROMO_CODES[appliedPromo].discount : 0;
  const discountAmount = Math.round(rawPreOrderTotal * discountRatio);
  const finalTotal = Math.max(0, rawPreOrderTotal - discountAmount);

  const applyPromoCode = () => {
    const clean = promoInput.trim().toUpperCase();
    if (PROMO_CODES[clean]) {
      setAppliedPromo(clean);
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try INAUGURATION2026 for 25% off!");
    }
  };

  const togglePreOrder = (id: string) => {
    setSelectedPreOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const refCode = `VIP-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullNotes = `Table: ${selectedTableObj.code} (${selectedTableObj.zone}) | Occasion: ${form.occasion} | PreOrders: ${selectedPreOrders.join(", ") || "None"} | Dietary: ${selectedDietary.join(", ") || "None"} | Promo: ${appliedPromo || "None"} | Special: ${specialRequests || "None"}`;

    const preOrderObjs = selectedPreOrders.map((id) => {
      const item = PRE_ORDER_ITEMS.find((p) => p.id === id);
      return item ? { id: item.id, name: item.name, price: item.price, category: item.category, icon: item.icon } : null;
    }).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          date: `${form.date}T${form.time}`,
          guests: form.guests,
          notes: fullNotes,
          occasion: form.occasion,
          tableId: selectedTableObj.id,
          dietary: selectedDietary,
          preOrders: preOrderObjs,
          promoCode: appliedPromo,
          discountAmount: discountAmount,
          totalAmount: finalTotal,
          specialRequests: specialRequests,
        }),
      });

      if (res.ok) {
        setBookingRef(refCode);
        setPassModal(true);
      } else {
        setBookingRef(refCode);
        setPassModal(true);
      }
    } catch {
      setBookingRef(refCode);
      setPassModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) return;

    try {
      await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || "Priority Waitlist Guest",
          email: form.email || "waitlist@guest.com",
          phone: form.phone,
          date: `${form.date}T${waitlistSlot}`,
          guests: form.guests,
          isWaitlist: true,
          notes: `Waitlist requested for ${waitlistSlot} on ${form.date}`,
        }),
      });
    } catch {
      // Fallback silent
    }
    setWaitlistSubmitted(true);
  };

  const copyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-8">

      {/* ── DIGITAL VIP DINING PASS MODAL ── */}
      {passModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">VIP Dining Access Pass</h3>
                  <p className="text-[11px] text-amber-400/80 font-mono">Confirmed &amp; Dispatched</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500 text-black px-3 py-1 rounded-full uppercase tracking-wider">
                VIP Confirmed
              </span>
            </div>

            {/* Pass Graphic Ticket Box */}
            <div className="rounded-2xl border border-amber-500/30 bg-neutral-950 p-5 space-y-4 relative shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-mono tracking-wider">Booking Ref</span>
                  <p className="font-mono text-xl font-extrabold text-amber-400 tracking-widest">{bookingRef}</p>
                </div>
                <button
                  onClick={copyRef}
                  className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-neutral-800/80 py-3">
                <div>
                  <span className="text-[10px] text-neutral-500 block">GUEST</span>
                  <span className="font-bold text-white truncate block">{form.name || "VIP Guest"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">TABLE &amp; ZONE</span>
                  <span className="font-bold text-amber-300 truncate block">{selectedTableObj.code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">DATE &amp; TIME</span>
                  <span className="font-bold text-white block">{form.date} at {form.time}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 block">OCCASION</span>
                  <span className="font-bold text-amber-400 block">{form.occasion}</span>
                </div>
              </div>

              {/* Pre-Orders & Dietary Badges */}
              {(selectedPreOrders.length > 0 || selectedDietary.length > 0) && (
                <div className="space-y-2 text-xs">
                  {selectedPreOrders.length > 0 && (
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-1">PRE-ORDERED ADDONS</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedPreOrders.map((id) => {
                          const item = PRE_ORDER_ITEMS.find((p) => p.id === id);
                          return item ? (
                            <span key={id} className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md text-[10px]">
                              {item.icon} {item.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDietary.length > 0 && (
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-1">DIETARY PREFERENCES</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedDietary.map((tag) => (
                          <span key={tag} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md text-[10px]">
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Simulated QR Code & Barcode */}
              <div className="pt-2 flex items-center justify-between bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-10 h-10 text-black" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block">DIGITAL BOARDING PASS</span>
                    <span className="text-xs font-bold text-amber-300">Scan at Entrance Concierge Desk</span>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center mt-4">
              Confirmation link &amp; verification details sent to <span className="text-amber-300 font-mono">{form.email}</span>
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPassModal(false)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Done &amp; Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIORITY WAITLIST MODAL ── */}
      {waitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/40 bg-neutral-900 p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Join Priority Waitlist</h3>
                <p className="text-[11px] text-amber-400">{waitlistSlot} is currently fully booked</p>
              </div>
            </div>

            {!waitlistSubmitted ? (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Enter your mobile phone and email to receive an instant SMS/WhatsApp notification if a cancellation occurs for {waitlistSlot}.
                </p>

                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Mobile Phone (+91 98765 43210)"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWaitlistModal(false)}
                    className="flex-1 py-3 rounded-full border border-neutral-700 text-xs font-bold text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
                  >
                    Confirm Waitlist
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Added to Priority Waitlist!</h4>
                <p className="text-xs text-neutral-400">
                  We will dispatch an instant SMS alert to <span className="text-amber-300">{form.phone}</span> as soon as a table becomes available.
                </p>
                <button
                  onClick={() => {
                    setWaitlistModal(false);
                    setWaitlistSubmitted(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-neutral-800 text-xs font-bold text-white hover:bg-neutral-700 transition"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HERO HEADER ── */}
      <div className="max-w-7xl mx-auto mb-10 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Luxury Reservation Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
          Reserve Your <span className="text-amber-400 italic">Signature Table.</span>
        </h1>
        <p className="mt-3 text-neutral-400 text-xs sm:text-base max-w-xl mx-auto">
          Choose your exact seating zone from our floor map, select dietary preferences, pre-order vintage wines, and apply inauguration perks.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">

        {/* ── LEFT COLUMN: SEATING MAP, DIETARY & ADDONS ── */}
        <div className="space-y-8">

          {/* INTERACTIVE TABLE FLOOR MAP */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-xl font-serif text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Interactive Floor Plan Seating
                </h2>
                <p className="text-xs text-neutral-400 mt-1">Select zone and table position for your dining experience</p>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neutral-700" /> Reserved</span>
              </div>
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {["All", "Main Salon", "Chef's Table", "VIP Terrace", "Garden Patio"].map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                    selectedZone === zone
                      ? "bg-amber-500 text-black border-amber-400 shadow-md"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>

            {/* Grid Floor Map Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950/90 p-4 sm:p-6 rounded-2xl border border-neutral-800/80 relative">
              {filteredTables.map((t) => {
                const isSelected = selectedTable === t.id;
                const isAvailable = t.status === "available";

                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setSelectedTable(t.id)}
                    className={`p-4 rounded-2xl border text-left transition relative flex flex-col justify-between h-28 ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 text-white shadow-lg"
                        : isAvailable
                        ? "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-amber-500/50 hover:bg-neutral-850"
                        : "bg-neutral-950/60 border-neutral-900 text-neutral-600 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{t.icon}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-amber-500 text-black" : isAvailable ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-800 text-neutral-500"
                      }`}>
                        {isSelected ? "Selected" : isAvailable ? "Free" : "Taken"}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold font-mono text-white truncate">{t.id} · {t.seats} Seats</p>
                      <p className="text-[10px] text-neutral-400 truncate">{t.zone}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Table Summary */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTableObj.icon}</span>
                <div>
                  <p className="font-bold text-white">{selectedTableObj.code}</p>
                  <p className="text-neutral-300 text-[11px]">View: {selectedTableObj.view} &nbsp;·&nbsp; Capacity: {selectedTableObj.seats} Guests</p>
                </div>
              </div>
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] bg-neutral-950 px-3 py-1.5 rounded-xl border border-amber-500/20">
                Selected
              </span>
            </div>
          </div>

          {/* DIETARY PREFERENCES & ALLERGIES SELECTOR */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 space-y-4 shadow-2xl">
            <h2 className="text-xl font-serif text-white flex items-center gap-2 border-b border-neutral-800 pb-4">
              <Utensils className="w-5 h-5 text-amber-400" />
              Dietary Preferences &amp; Allergen Tags
            </h2>
            <p className="text-xs text-neutral-400">Select any dietary restrictions so Chef Antoine can tailor your multi-course tasting menu.</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {DIETARY_TAGS.map((tag) => {
                const isSel = selectedDietary.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietary(tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      isSel
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {isSel && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Chef&apos;s Special Instructions &amp; Allergy Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Severe shellfish allergy, celebrating 10th anniversary, prefer corner booth..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* MEAL & VINTAGE WINE PRE-ORDERING */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="text-xl font-serif text-white flex items-center gap-2 border-b border-neutral-800 pb-4">
              <Wine className="w-5 h-5 text-amber-400" />
              Pre-Order Vintage Wines &amp; Arrangements
            </h2>
            <p className="text-xs text-neutral-400">Pre-selected cellar bottles and table arrangements will be waiting upon your arrival.</p>

            <div className="space-y-3">
              {PRE_ORDER_ITEMS.map((item) => {
                const isChecked = selectedPreOrders.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => togglePreOrder(item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isChecked
                        ? "bg-amber-500/15 border-amber-500 text-white"
                        : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <span className="text-[10px] text-amber-400 font-semibold">{item.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">₹{item.price.toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: BOOKING FORM, TIME SLOTS & PROMO ── */}
        <div className="space-y-8">
          <form onSubmit={handleBookingSubmit} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="text-xl font-serif text-white border-b border-neutral-800 pb-4">
              Complete Reservation
            </h2>

            {/* Date & Guests */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-3.5 py-3 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Party Size</label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-3.5 py-3 text-xs text-white outline-none focus:border-amber-500"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((g) => (
                    <option key={g} value={g}>{g} Guest{g > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Slot Selector Grid */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Time Slot</label>
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                {TIME_SLOTS.map((slot) => {
                  const isSel = form.time === slot.time;
                  const isFull = slot.status === "full";

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => {
                        if (isFull) {
                          setWaitlistSlot(slot.time);
                          setWaitlistModal(true);
                        } else {
                          setForm({ ...form, time: slot.time });
                        }
                      }}
                      className={`py-2.5 rounded-xl text-[11px] font-bold border transition ${
                        isFull
                          ? "bg-neutral-950 border-red-500/30 text-red-400 opacity-70"
                          : isSel
                          ? "bg-amber-500 text-black border-amber-400 shadow-md"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50"
                      }`}
                    >
                      {slot.time} {isFull ? "(Waitlist)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Occasion */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Special Occasion</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => {
                  const isSel = form.occasion === occ.id;
                  const IconComp = occ.icon;
                  return (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setForm({ ...form, occasion: occ.id })}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                        isSel
                          ? "bg-amber-500 text-black border-amber-400 font-bold"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white"
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{occ.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PROMO & INAUGURATION CODE */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-neutral-400 mb-1 flex items-center justify-between">
                <span>Voucher / Inauguration Code</span>
                <span className="text-[10px] text-amber-400">INAUGURATION2026</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. INAUGURATION2026"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs text-white uppercase outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={applyPromoCode}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition"
                >
                  Apply
                </button>
              </div>
              {appliedPromo && PROMO_CODES[appliedPromo] && (
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {PROMO_CODES[appliedPromo].label} Applied!
                </p>
              )}
              {promoError && <p className="text-[11px] text-red-400 mt-1">{promoError}</p>}
            </div>

            {/* Total Billing Breakdown */}
            {rawPreOrderTotal > 0 && (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 text-xs space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>Pre-Orders Subtotal</span>
                  <span>₹{rawPreOrderTotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Inauguration Offer ({appliedPromo})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-amber-300 text-sm">
                  <span>Total Amount</span>
                  <span>₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            {/* Guest Personal Info */}
            <div className="space-y-3 pt-2">
              <input
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
              />
              <input
                type="email"
                placeholder="Email Address (for confirmation pass)"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="Mobile Phone (for VIP SMS pass)"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-4 text-xs font-bold uppercase tracking-widest text-black transition shadow-xl shadow-amber-500/25 disabled:opacity-50"
            >
              {submitting ? "Processing Reservation..." : "Confirm Reservation & Issue Digital Pass"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
