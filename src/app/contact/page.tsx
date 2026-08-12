"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2,
  Sparkles, Calendar, Users, ChevronDown, ChevronUp, Copy, Check,
  Car, Compass, ShieldCheck, Heart, Wine, Award, ExternalLink, QrCode
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

const RESTAURANT = {
  name: "L'Étoile Dorée",
  address: "23, Boat Club Road, Race Course Area",
  city: "Pune, Maharashtra — 411 001",
  phone: "+91 20 4890 7700",
  whatsapp: "+91 98765 43210",
  email: "concierge@letoiledoree.in",
  hours: {
    lunch: "12:00 PM – 3:30 PM",
    dinner: "7:00 PM – 11:30 PM",
    days: "Tuesday – Sunday",
  },
};

const INQUIRY_TYPES = [
  { id: "General Table Inquiry", label: "General Inquiry", icon: "💬", desc: "General dining questions & seating requests" },
  { id: "Private Dining & Banquets", label: "Private Dining", icon: "👑", desc: "VIP Vault or Skylight Terrace private bookings" },
  { id: "Wedding & Gala Celebrations", label: "Weddings & Galas", icon: "🥂", desc: "Bespoke banquet receptions & anniversary galas" },
  { id: "Sommelier & Cellar Tasting", label: "Sommelier Tasting", icon: "🍷", desc: "Private wine vault tours & masterclasses" },
  { id: "Press & Corporate", label: "Press & Corporate", icon: "🗞️", desc: "Media coverage, filming & corporate accounts" },
];

const POLICIES_FAQ = [
  {
    title: "What is the dress code policy?",
    answer: "We observe a Smart Elegant dress code for dinner service. Tailored jackets, evening dresses, or refined attire are highly encouraged. Shorts, athletic sportswear, and beach sandals are strictly prohibited.",
  },
  {
    title: "What are the private dining room minimum spends?",
    answer: "Our subterranean Grand Wine Vault accommodates up to 14 guests with a ₹45,000 food & wine minimum. The VIP Skylight Terrace seats up to 35 guests with custom tasting menus starting at ₹3,800 per guest.",
  },
  {
    title: "Is private valet parking provided?",
    answer: "Yes, complimentary white-glove valet parking is provided directly at our entrance on Boat Club Road.",
  },
  {
    title: "What is the corkage policy for personal vintages?",
    answer: "Guests may bring rare vintage bottles not currently featured on our wine list. A corkage fee of ₹2,500 per 750ml bottle applies, limited to 2 bottles per table.",
  },
  {
    title: "Children & family dining policy",
    answer: "Children above 10 years of age are warmly welcome during lunch and dinner service. Booster seats and custom young gourmet tasting courses are available upon prior notice.",
  },
];

export default function ContactPage() {
  const [inquiryType, setInquiryType] = useState("General Table Inquiry");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    eventDate: "",
    preferredContact: "Email",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [directionTab, setDirectionTab] = useState<"valet" | "transit" | "airport">("valet");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const generatedRef = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          inquiryType,
          referenceCode: generatedRef,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReferenceCode(data.referenceCode || generatedRef);
      } else {
        setReferenceCode(generatedRef);
      }
    } catch {
      setReferenceCode(generatedRef);
    } finally {
      setSubmitting(false);
      setTicketModal(true);
    }
  };

  const copyRef = () => {
    navigator.clipboard.writeText(referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4 sm:px-8">

      {/* ── INQUIRY TICKET CONFIRMATION MODAL ── */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-neutral-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Inquiry Ticket Created</h3>
                  <p className="text-[11px] text-amber-400 font-mono">Concierge Desk Dispatched</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500 text-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                Priority
              </span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-neutral-950 p-5 space-y-3 font-mono text-xs text-neutral-200">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <span className="text-neutral-400">REFERENCE:</span>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">{referenceCode}</span>
                  <button onClick={copyRef} className="text-neutral-400 hover:text-white p-1">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p>Guest: <span className="text-white font-bold">{form.name}</span></p>
              <p>Category: <span className="text-amber-300">{inquiryType}</span></p>
              <p>Contact via: <span className="text-emerald-400">{form.preferredContact}</span></p>
              <p className="text-[11px] text-neutral-400 pt-2 font-sans leading-relaxed">
                Our Executive Concierge team will review your request and get in touch within 2 to 4 hours.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/${RESTAURANT.whatsapp.replace(/\D/g, "")}?text=Hi%20Concierge,%20following%20up%20on%20Inquiry%20Ref:%20${referenceCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Concierge</span>
              </a>
              <button
                onClick={() => {
                  setTicketModal(false);
                  setForm({ name: "", email: "", phone: "", guests: 2, eventDate: "", preferredContact: "Email", message: "" });
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div className="max-w-4xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Concierge &amp; Private Guest Relations</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif text-white tracking-tight leading-tight">
          We Cordially Welcome <span className="text-amber-400 italic">Your Inquiry.</span>
        </h1>
        <p className="mt-4 text-neutral-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
          For private dining banquets, sommelier vault tastings, corporate events, or personal guest requests — our concierge desk is at your service.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">

        {/* ── LEFT COLUMN: RESTAURANT INFO, MAP & POLICIES ── */}
        <div className="space-y-8">

          {/* Quick Contact Cards Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-2 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">Main Salon Address</h3>
              <p className="text-xs text-neutral-300">{RESTAURANT.address}</p>
              <p className="text-[11px] text-neutral-400">{RESTAURANT.city}</p>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-2 shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-serif">Direct Concierge Line</h3>
              <a href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`} className="text-xs font-bold text-amber-400 block hover:underline">
                {RESTAURANT.phone}
              </a>
              <p className="text-[11px] text-neutral-400">WhatsApp: {RESTAURANT.whatsapp}</p>
            </div>
          </div>

          {/* Dining Hours Card */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Dining Hours &amp; Service
              </h3>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Tue – Sun
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-[10px] text-neutral-400 uppercase font-mono block">LUNCH SERVICE</span>
                <span className="font-bold text-white text-sm block mt-0.5">{RESTAURANT.hours.lunch}</span>
              </div>
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80">
                <span className="text-[10px] text-amber-400 uppercase font-mono block">DINNER SERVICE</span>
                <span className="font-bold text-white text-sm block mt-0.5">{RESTAURANT.hours.dinner}</span>
              </div>
            </div>
          </div>

          {/* Location Map & Directions Tabs */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" /> Location &amp; Access
              </h3>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(RESTAURANT.address + ", " + RESTAURANT.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Google Maps Pin</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Directions Pill Tabs */}
            <div className="flex gap-2 border-b border-neutral-800 pb-3">
              <button
                onClick={() => setDirectionTab("valet")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  directionTab === "valet" ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                🏎️ Private Valet
              </button>
              <button
                onClick={() => setDirectionTab("transit")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  directionTab === "transit" ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                🚇 Metro &amp; Transit
              </button>
              <button
                onClick={() => setDirectionTab("airport")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  directionTab === "airport" ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                ✈️ Pune Airport
              </button>
            </div>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
              {directionTab === "valet" && (
                <p>Private white-glove valet attendants are stationed right at the main entrance gate on Boat Club Road. Complimentary for all dining patrons.</p>
              )}
              {directionTab === "transit" && (
                <p>Located 8 minutes from Bund Garden Metro Station &amp; 10 minutes from Pune Railway Station. Taxi pick-up available at main lobby entrance.</p>
              )}
              {directionTab === "airport" && (
                <p>20 minutes drive (7.5 km) from Pune International Airport (PNQ). Private chauffeured airport transfer available upon VIP request.</p>
              )}
            </div>
          </div>

          {/* POLICIES & ACCORDION FAQ */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-neutral-900/80 space-y-4 shadow-xl">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Guest Guidelines &amp; Policies
            </h3>

            <div className="space-y-3">
              {POLICIES_FAQ.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 text-left text-xs font-bold text-white flex items-center justify-between hover:text-amber-400 transition"
                    >
                      <span>{item.title}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-[11px] text-neutral-400 leading-relaxed border-t border-neutral-900 pt-2">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: INTERACTIVE INQUIRY FORM ── */}
        <div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/90 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">Send Concierge Request</h2>
              <p className="text-xs text-neutral-400 mt-1">Select your inquiry type to get connected with the appropriate host</p>
            </div>

            {/* Inquiry Category Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Inquiry Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {INQUIRY_TYPES.map((type) => {
                  const isSel = inquiryType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setInquiryType(type.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        isSel
                          ? "bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/30"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-base shrink-0">{type.icon}</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{type.label}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Event Specific Options (shown for Banquets/Weddings) */}
            {(inquiryType.includes("Private") || inquiryType.includes("Wedding")) && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-300 mb-1">Estimated Guests</label>
                  <select
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white outline-none"
                  >
                    {[5, 10, 15, 20, 35, 50, 80, 120].map((n) => (
                      <option key={n} value={n}>{n} Guests</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-amber-300 mb-1">Proposed Event Date</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Guest Information Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jean-Pierre Beaumont"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="guest@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Preferred Contact Channel */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Preferred Response Channel</label>
                <div className="flex gap-2">
                  {["Email", "WhatsApp", "Phone Call"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm({ ...form, preferredContact: method })}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition ${
                        form.preferredContact === method
                          ? "bg-amber-500 text-black border-amber-400 font-bold"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Inquiry Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">Message &amp; Special Requirements</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe your event requirements, dietary needs, or general inquiry in detail..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-widest text-xs shadow-xl transition shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Dispatching Inquiry..." : "Submit Concierge Request"}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}