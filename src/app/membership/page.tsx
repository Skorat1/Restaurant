"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Newsletter from "@/components/Newsletter";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

interface MembershipStatus {
  tier: "gold" | "platinum" | null;
  active: boolean;
  startedAt?: string;
  expiresAt?: string;
  daysLeft?: number;
}

type TierId = "gold" | "platinum";

interface Tier {
  id: TierId;
  name: string;
  price: number;
  tagline: string;
  features: string[];
}

const TIERS: Record<TierId, Tier> = {
  gold: {
    id: "gold",
    name: "Gold",
    price: 499,
    tagline: "The essential member experience",
    features: [
      "Priority table reservations",
      "Complimentary welcome glass on arrival",
      "One seasonal tasting menu per year",
      "Early access to ticketed events",
      "Monthly newsletter with chef notes",
      "10% off à la carte dining",
    ],
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    price: 999,
    tagline: "The ultimate fine-dining membership",
    features: [
      "Everything in Gold",
      "Two chef's table experiences per year",
      "Priority access to private events",
      "Complimentary sommelier pairing (2×/yr)",
      "Dedicated concierge line",
      "20% off à la carte dining",
      "Personalized tasting menu invitations",
    ],
  },
};

const FAQS = [
  {
    q: "How does the membership work?",
    a: "Once you select a tier and complete payment, your membership is activated immediately for 12 months. You'll see your active status and expiry date on your profile.",
  },
  {
    q: "Can I upgrade from Gold to Platinum?",
    a: "Yes. You can upgrade at any time — the remaining value of your Gold membership is credited toward your Platinum upgrade.",
  },
  {
    q: "Is payment secure?",
    a: "Yes. Payments are processed securely through Razorpay, which encrypts your payment details. We never store your card information.",
  },
  {
    q: "Can I cancel my membership?",
    a: "You can cancel anytime. Perks remain active until the end of your 12-month term. No automatic renewals unless you opt in.",
  },
];

const TESTIMONIALS = [
  { name: "Anjali M.", tier: "Platinum", quote: "The chef's table experience alone is worth it. Worth every rupee." },
  { name: "Rajesh K.", tier: "Gold", quote: "Priority reservations have changed how we dine out. Effortless." },
  { name: "Sara D.", tier: "Platinum", quote: "The concierge line is a game-changer for planning special occasions." },
];

export default function Membership() {
  const { user, token, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selected, setSelected] = useState<"gold" | "platinum">("platinum");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ tier: string; expiresAt: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Fetch membership status for logged-in users
  useEffect(() => {
    if (!authLoading && token) {
      setStatusLoading(true);
      fetch(`${API_BASE_URL}/api/membership/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setStatus(data))
        .catch(() => {})
        .finally(() => setStatusLoading(false));
    }
  }, [authLoading, token]);

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePurchase = async () => {
    setError("");
    setProcessing(true);
    try {
      // 1. Create payment intent
      const res = await fetch(`${API_BASE_URL}/api/membership/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: selected }),
      });
      const data = await res.json();

      if (data.simulated) {
        // Simulated (no Razorpay keys) — activated directly
        setSuccess({ tier: data.tier, expiresAt: data.expiresAt });
        setCheckoutOpen(false);
        await refreshUser();
        return;
      }

      if (!res.ok) {
        setError(data.msg || "Failed to start payment.");
        setProcessing(false);
        return;
      }

      // 2. Load Razorpay and open checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Unable to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "L'Étoile Dorée",
        description: `${data.name} Membership (1 year)`,
        order_id: data.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#f59e0b" },
        handler: async (response: any) => {
          // Verify signature & activate
          const verifyRes = await fetch(`${API_BASE_URL}/api/membership/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              tier: selected,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setSuccess({ tier: verifyData.tier, expiresAt: verifyData.expiresAt });
            setCheckoutOpen(false);
            await refreshUser();
          } else {
            setError(verifyData.msg || "Payment verification failed.");
          }
          setProcessing(false);
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch {
      setError("Unable to reach the payment server.");
      setProcessing(false);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

  const activeMembership = status?.active && status.tier;

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-400/90">Membership</p>
        <h1 className="mt-4 text-4xl font-serif text-white sm:text-5xl lg:text-6xl leading-tight">
          Elevate every dining experience.
        </h1>
        <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-7">
          Join the L&apos;Étoile Dorée membership for priority reservations, exclusive chef&apos;s table experiences,
          sommelier pairings, and members-only events throughout the year.
        </p>
      </div>

      {/* Active membership banner */}
      {!authLoading && !token && (
        <div className="mt-12 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <p className="text-neutral-300">
            Ready to join?{" "}
            <Link href="/login" className="text-amber-400 font-semibold hover:text-amber-300">Log in</Link>{" "}
            or{" "}
            <Link href="/signup" className="text-amber-400 font-semibold hover:text-amber-300">create an account</Link>{" "}
            to purchase a membership.
          </p>
        </div>
      )}

      {token && (
        <div className="mt-12">
          <EmailVerificationBanner />
        </div>
      )}

      {activeMembership && (
        <div className="mt-12 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Your membership</p>
          <h2 className="mt-2 text-3xl font-serif text-white capitalize">{activeMembership} Member</h2>
          <p className="mt-2 text-neutral-300">
            {status.daysLeft !== undefined && status.daysLeft > 0
              ? `${status.daysLeft} day${status.daysLeft === 1 ? "" : "s"} remaining`
              : "Expires soon"}
            {status.expiresAt && <> · Valid until {formatDate(status.expiresAt)}</>}
          </p>
          <p className="mt-4 text-sm text-neutral-400">
            You&apos;re enjoying members-only perks.{" "}
            <Link href="/profile" className="text-amber-400 hover:text-amber-300">View your account</Link>.
          </p>
        </div>
      )}

      {/* Pricing cards */}
      <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {Object.values(TIERS).map((tier) => {
          const isPlatinum = tier.id === "platinum";
          return (
            <div
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`relative rounded-3xl border p-8 transition cursor-pointer ${
                selected === tier.id
                  ? "border-amber-500 bg-neutral-900/90 shadow-2xl shadow-amber-500/10"
                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
              }`}
            >
              {isPlatinum && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-black uppercase tracking-wide">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-serif text-white">{tier.name}</h3>
              <p className="mt-1 text-sm text-neutral-400">{tier.tagline}</p>
              <p className="mt-6">
                <span className="text-4xl font-serif text-amber-400">${tier.price}</span>
                <span className="text-neutral-500"> / year</span>
              </p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-neutral-300">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelected(tier.id)}
                className={`mt-8 w-full rounded-full px-6 py-3.5 text-sm font-semibold transition ${
                  selected === tier.id
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                }`}
              >
                {selected === tier.id ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Join button */}
      <div className="mt-10 text-center">
        {!authLoading && token && !activeMembership && (
          <button
            onClick={() => setCheckoutOpen(true)}
            className="rounded-full bg-amber-500 px-10 py-4 text-base font-semibold text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            Join {TIERS[selected].name} Membership — ${TIERS[selected].price}/yr
          </button>
        )}
        {!authLoading && !token && (
          <Link
            href="/login"
            className="inline-block rounded-full bg-amber-500 px-10 py-4 text-base font-semibold text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
          >
            Log in to Join
          </Link>
        )}
        {activeMembership && (
          <p className="text-neutral-400 text-sm">You&apos;re all set with your {activeMembership} membership.</p>
        )}
      </div>

      {/* Comparison table */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif text-white text-center mb-8">Compare Benefits</h2>
        <div className="overflow-x-auto rounded-3xl border border-neutral-800 bg-neutral-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-6 py-4 text-neutral-400">Benefit</th>
                <th className="px-6 py-4 text-amber-400">Gold</th>
                <th className="px-6 py-4 text-amber-400">Platinum</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Priority reservations", "✓", "✓"],
                ["Welcome glass on arrival", "✓", "✓"],
                ["Seasonal tasting menu", "1× / year", "1× / year"],
                ["Chef's table experience", "—", "2× / year"],
                ["Sommelier pairings", "—", "2× / year"],
                ["Dedicated concierge", "—", "✓"],
                ["À la carte discount", "10%", "20%"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-neutral-800/60 last:border-0">
                  <td className="px-6 py-3 text-neutral-300">{row[0]}</td>
                  <td className="px-6 py-3 text-neutral-400">{row[1]}</td>
                  <td className="px-6 py-3 text-neutral-400">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-serif text-white text-center mb-8">What members say</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
              <p className="text-2xl text-amber-400">“</p>
              <p className="text-neutral-300 leading-7 italic -mt-2">{t.quote}</p>
              <footer className="mt-4 text-sm">
                <span className="text-white font-medium">{t.name}</span>
                <span className="text-amber-400"> · {t.tier}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-serif text-white text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-white hover:bg-neutral-800/40 transition"
                aria-expanded={openFaq === i}
              >
                {f.q}
                <span className={`text-amber-400 transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && <p className="px-6 pb-5 text-sm text-neutral-400 leading-7">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="mt-20">
        <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 p-10 flex flex-col items-center text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Newsletter</span>
          <h3 className="mt-4 text-3xl font-serif text-white">Stay in the loop</h3>
          <p className="text-neutral-400 mt-3 max-w-md">Sign up for seasonal menus and exclusive event invitations.</p>
          <div className="mt-8 w-full max-w-xl"><Newsletter /></div>
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-white">Confirm Membership</h2>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-neutral-400 hover:text-white transition"
                aria-label="Close checkout"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
              <p className="text-sm font-semibold text-white capitalize">{TIERS[selected].name} Membership</p>
              <p className="text-xs text-neutral-400 mt-1">12 months of member benefits</p>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                <span className="text-sm text-neutral-400">Total</span>
                <span className="text-2xl font-serif text-amber-400">${TIERS[selected].price}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <button
              onClick={handlePurchase}
              disabled={processing}
              className="mt-6 w-full rounded-full bg-amber-500 px-6 py-4 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50"
            >
              {processing ? "Processing…" : `Pay $${TIERS[selected].price} securely`}
            </button>
            <p className="mt-3 text-center text-xs text-neutral-500">
              🔒 Secure payment via Razorpay. Card details are never stored.
            </p>
          </div>
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-neutral-950 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl">✓</div>
            <h2 className="mt-4 text-2xl font-serif text-white">Welcome, Member!</h2>
            <p className="mt-2 text-neutral-300">
              Your <span className="text-amber-400 capitalize">{success.tier}</span> membership is now active.
            </p>
            {success.expiresAt && (
              <p className="mt-2 text-sm text-neutral-400">Valid until {formatDate(success.expiresAt)}</p>
            )}
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/profile" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition">
                Go to Profile
              </Link>
              <button
                onClick={() => setSuccess(null)}
                className="rounded-full border border-neutral-700 px-6 py-3 text-sm text-neutral-200 hover:bg-neutral-900 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
