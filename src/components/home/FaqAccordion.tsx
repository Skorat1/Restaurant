"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
  );
}
