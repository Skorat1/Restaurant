"use client";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
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

export default function FaqAccordion() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="space-y-3.5 max-w-4xl mx-auto">
      {FAQS.map((faq, index) => {
        const isOpen = expandedFaq === index;
        return (
          <div
            key={faq.q}
            className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
              isOpen
                ? "bg-neutral-900/90 border-amber-500/50 shadow-xl shadow-black/40"
                : "bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700"
            }`}
          >
            <button
              type="button"
              onClick={() => setExpandedFaq(isOpen ? null : index)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-white font-serif font-bold text-sm sm:text-base hover:text-amber-400 transition"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3">
                <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? "text-amber-400" : "text-neutral-500"}`} />
                <span>{faq.q}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-300 ease-out ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            {/* Smooth CSS Grid Accordion Transition */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light border-t border-neutral-800/50">
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
