"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Utensils, Award, Clock, Users, Calendar, CheckCircle2, ChevronRight, MessageSquare, GlassWater, Heart, Cake } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface ServiceItem {
  id: string;
  category: "Private Dining" | "Sommelier" | "Masterclasses" | "Special Events";
  title: string;
  desc: string;
  price: string;
  features: string[];
  icon: typeof Sparkles;
}

const SERVICES: ServiceItem[] = [
  {
    id: "serv-1",
    category: "Private Dining",
    title: "Seasonal 7-Course Tasting Menu",
    desc: "A rotating gastronomic menu crafted around peak seasonal produce, paired with rare vintage wines.",
    price: "From $95 per guest",
    features: ["7 Courses", "Vegetarian Tasting Option", "Sommelier Wine Pairing Add-on"],
    icon: Utensils,
  },
  {
    id: "serv-2",
    category: "Private Dining",
    title: "Chef's Table Private Experience",
    desc: "An intimate private dining experience at the Executive Chef's table — watch your meal created live.",
    price: "From $180 per guest",
    features: ["Up to 8 guests", "Live open kitchen view", "Custom menu consultation"],
    icon: Award,
  },
  {
    id: "serv-3",
    category: "Special Events",
    title: "Exclusive Venue Buyouts",
    desc: "Host your milestone celebration, corporate dinner, or wedding reception in our main dining salon.",
    price: "From $2,500",
    features: ["Full venue buyout (up to 120 guests)", "Custom tasting menus", "Dedicated event manager"],
    icon: Sparkles,
  },
  {
    id: "serv-4",
    category: "Sommelier",
    title: "Sommelier Grand Flight Pairing",
    desc: "Our head sommelier curates a bespoke 5-glass vintage flight to complement every course.",
    price: "From $65 per guest",
    features: ["5-glass Grand Cru flight", "Natural & biodynamic options", "Private cellar access"],
    icon: GlassWater,
  },
  {
    id: "serv-5",
    category: "Special Events",
    title: "Romantic & Proposal Dining",
    desc: "Private candlelight booth with champagne welcome, rose petal decor, and custom menu cards.",
    price: "From $210 per couple",
    features: ["Private skylight booth", "Champagne toast", "Custom printed menu"],
    icon: Heart,
  },
  {
    id: "serv-6",
    category: "Masterclasses",
    title: "Culinary & Pastry Masterclass",
    desc: "Learn the secrets behind fine-dining sauces, plating, and French pastry in a hands-on kitchen workshop.",
    price: "From $120 per guest",
    features: ["2-hour hands-on session", "Chef recipe booklet", "Complimentary lunch"],
    icon: Cake,
  },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", guests: 2, message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("");

  const filteredServices = SERVICES.filter((s) =>
    activeCategory === "All" ? true : s.category === activeCategory
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: `[SERVICE BOOKING: ${selectedService?.title}] Date: ${form.date}, Guests: ${form.guests}, Phone: ${form.phone} — ${form.message}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setStatus("Enquiry submitted successfully! Our events coordinator will contact you shortly.");
      } else {
        setStatus("Failed to submit enquiry. Please try again.");
      }
    } catch {
      setStatus("Unable to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4 sm:px-8">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Dining Services</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight">
          Experiences Crafted <span className="text-amber-400 italic">For Every Occasion.</span>
        </h1>
        <p className="mt-3 text-neutral-400 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
          From intimate tasting menus to full venue buyouts and masterclasses, every service is tailored to create lasting culinary memories.
        </p>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {["All", "Private Dining", "Sommelier", "Special Events", "Masterclasses"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map((service) => {
          const IconComp = service.icon;
          return (
            <div
              key={service.id}
              className="group relative rounded-3xl border border-neutral-800 bg-neutral-900/80 p-8 flex flex-col justify-between transition hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500 group-hover:text-black transition">
                  <IconComp className="w-6 h-6" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {service.category}
                </span>

                <h3 className="text-xl font-serif text-white mt-1 group-hover:text-amber-400 transition">
                  {service.title}
                </h3>

                <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
                  {service.desc}
                </p>

                <ul className="mt-6 space-y-2">
                  {service.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-400">{service.price}</span>

                <button
                  onClick={() => setSelectedService(service)}
                  className="rounded-full bg-neutral-800 hover:bg-amber-500 hover:text-black border border-neutral-700 text-white px-5 py-2 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Book Experience</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SERVICE BOOKING INQUIRY MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-6">
            <button
              onClick={() => {
                setSelectedService(null);
                setSubmitted(false);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">{selectedService.category}</span>
              <h3 className="text-2xl font-serif text-white mt-1">{selectedService.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">{selectedService.price}</p>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-xl font-serif text-white">Enquiry Received!</h4>
                <p className="text-xs text-neutral-300">
                  Our private events coordinator will reach out to you within 24 hours to confirm availability and custom menu options.
                </p>
                <button
                  onClick={() => {
                    setSelectedService(null);
                    setSubmitted(false);
                  }}
                  className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-amber-400 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Your Full Name</label>
                  <input
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Phone</label>
                    <input
                      placeholder="+1 (555) 000-0000"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Preferred Date</label>
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Expected Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      value={form.guests}
                      onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })}
                      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Special Requests / Event Details</label>
                  <textarea
                    rows={3}
                    placeholder="Dietary requests, event timing, custom decor..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {status && <p className="text-amber-300 text-center font-medium bg-amber-500/10 p-2.5 rounded-xl">{status}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-amber-500 py-3.5 text-xs font-bold uppercase text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/25 disabled:opacity-50"
                >
                  {submitting ? "Sending Enquiry…" : "Submit Experience Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
