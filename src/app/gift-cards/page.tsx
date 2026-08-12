"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Sparkles, CheckCircle2, Copy, Send, Heart, Award, ShieldCheck, ShoppingBag, Search, CreditCard, Star } from "lucide-react";
import { useCart } from "@/components/CartContext";

const THEMES = [
  { id: "gold", name: "Gold Noir", gradient: "from-amber-500/20 via-neutral-900 to-neutral-950", border: "border-amber-500/40", text: "text-amber-400", badgeBg: "bg-amber-500/20 text-amber-300" },
  { id: "platinum", name: "Platinum Étoile", gradient: "from-slate-400/20 via-neutral-900 to-neutral-950", border: "border-slate-400/40", text: "text-slate-300", badgeBg: "bg-slate-400/20 text-slate-200" },
  { id: "rose", name: "Rose Romance", gradient: "from-rose-500/20 via-neutral-900 to-neutral-950", border: "border-rose-500/40", text: "text-rose-400", badgeBg: "bg-rose-500/20 text-rose-300" },
  { id: "champagne", name: "Champagne Cuvée", gradient: "from-emerald-500/20 via-neutral-900 to-neutral-950", border: "border-emerald-500/40", text: "text-emerald-400", badgeBg: "bg-emerald-500/20 text-emerald-300" },
];

export default function GiftCardsPage() {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [form, setForm] = useState({
    recipientName: "Sarah Jenkins",
    recipientEmail: "",
    senderName: "Michael Brown",
    message: "A fine dining experience for an unforgettable evening at L'Étoile Dorée.",
  });

  const [purchased, setPurchased] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [checkCode, setCheckCode] = useState("");
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const { addItem } = useCart();
  const amount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handlePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `GIFT-${Math.floor(100000 + Math.random() * 900000)}`;
    setVoucherCode(code);
    setPurchased(true);

    // Also add to cart for seamless checkout option
    addItem({
      itemId: `gift-${code}`,
      name: `$${amount} Dining Gift Pass (${selectedTheme.name})`,
      price: amount,
      category: "Gift Vouchers",
      image: "/images/hero.svg",
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBalanceCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkCode.trim()) return;

    if (checkCode.toUpperCase().startsWith("GIFT-") || checkCode.length >= 6) {
      setCheckResult(`Voucher ${checkCode.toUpperCase()} is Active with remaining balance of $100.00 USD.`);
    } else {
      setCheckResult("Invalid or expired gift voucher code. Please check and try again.");
    }
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4 sm:px-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-amber-500 text-black px-6 py-3.5 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.25em] mb-4">
          <Gift className="w-3.5 h-3.5" />
          <span>L&apos;Étoile Digital Gift Experience</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white tracking-tight leading-tight">
          Gift an Unforgettable <span className="text-amber-400 italic">Dining Experience.</span>
        </h1>
        <p className="mt-3 text-neutral-400 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
          Surprise friends, family, or colleagues with an exclusive fine dining digital gift pass redeemable for food, tasting menus, and rare wines.
        </p>

        {/* Voucher Balance Lookup Bar */}
        <form onSubmit={handleBalanceCheck} className="mt-6 max-w-md mx-auto flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl shadow-xl">
          <input
            placeholder="Check Gift Card Balance (e.g. GIFT-123456)"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            className="w-full bg-transparent px-4 py-2 text-xs text-white placeholder-neutral-500 outline-none"
          />
          <button type="submit" className="rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 text-xs font-semibold shrink-0 transition">
            Check
          </button>
        </form>

        {checkResult && (
          <p className="mt-3 text-xs text-amber-300 font-medium bg-neutral-900 border border-neutral-800 max-w-md mx-auto p-3 rounded-xl">
            {checkResult}
          </p>
        )}
      </div>

      <div className="max-w-5xl mx-auto">
        {purchased ? (
          /* Purchased Confirmation Voucher Card */
          <div className="mx-auto max-w-2xl rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-neutral-900 to-neutral-950 p-8 sm:p-12 text-center shadow-2xl relative">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
              Gift Voucher Issued &amp; Added to Cart
            </span>

            <h2 className="mt-4 text-3xl font-serif text-white">${amount} Dining Gift Pass</h2>
            <p className="mt-2 text-xs sm:text-sm text-neutral-300">
              Digital voucher code generated and emailed to <span className="text-amber-300 font-semibold">{form.recipientEmail || "recipient"}</span>.
            </p>

            {/* Voucher Card Pass Preview */}
            <div className={`mt-8 rounded-2xl border ${selectedTheme.border} bg-gradient-to-br ${selectedTheme.gradient} p-6 text-left space-y-4 relative overflow-hidden shadow-2xl`}>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span className="text-xs text-neutral-400 uppercase tracking-wider">Voucher Code</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/20 transition"
                >
                  <span>{voucherCode}</span>
                  <Copy className="w-3.5 h-3.5" />
                  {copied && <span className="text-[10px] text-emerald-400 ml-1">(Copied!)</span>}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-neutral-400">Recipient</p>
                  <p className="font-bold text-white mt-0.5">{form.recipientName}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Sender</p>
                  <p className="font-bold text-white mt-0.5">{form.senderName}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-300 italic">
                &ldquo;{form.message}&rdquo;
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setPurchased(false)}
                className="w-full sm:w-auto rounded-full bg-amber-500 px-8 py-3.5 text-xs font-bold text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/25"
              >
                Send Another Gift Pass
              </button>
              <Link
                href="/order"
                className="w-full sm:w-auto rounded-full border border-neutral-700 bg-neutral-900 px-8 py-3.5 text-xs font-bold text-white hover:bg-neutral-800 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Checkout Cart Now</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Card — Customizer & Live Card Pass */}
            <div className="space-y-6">
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-xl font-serif text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    Select Gift Amount &amp; Theme
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Customize your digital gift card presentation style.
                  </p>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Card Theme</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSelectedTheme(theme)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                          selectedTheme.id === theme.id
                            ? "bg-amber-500/20 border-amber-500 text-amber-300"
                            : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Voucher Amount</label>
                  <div className="grid grid-cols-4 gap-2.5 mb-3">
                    {[50, 100, 250, 500].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                          selectedAmount === amt && !customAmount
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                            : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="25"
                    max="5000"
                    placeholder="Custom amount (e.g. 150)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* LIVE DIGITAL PASS CARD PREVIEW */}
              <div className={`rounded-3xl border ${selectedTheme.border} bg-gradient-to-br ${selectedTheme.gradient} p-8 relative overflow-hidden shadow-2xl transition-all`}>
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-amber-400 text-xl tracking-widest">L&apos;ÉTOILE DORÉE</span>
                  <span className={`text-xs font-bold ${selectedTheme.badgeBg} px-3 py-1 rounded-full border border-neutral-700`}>
                    {selectedTheme.name}
                  </span>
                </div>

                <div className="mt-10">
                  <span className="text-xs text-neutral-400 uppercase tracking-wider">Gift Voucher Pass</span>
                  <p className={`text-5xl font-serif font-bold ${selectedTheme.text} mt-1`}>${amount || 0}</p>
                </div>

                <div className="mt-8 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-neutral-500 text-[10px] uppercase">To</p>
                    <p className="font-bold text-white">{form.recipientName || "Recipient Name"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-[10px] uppercase">From</p>
                    <p className="font-bold text-white">{form.senderName || "Your Name"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form — Recipient & Message */}
            <form onSubmit={handlePurchase} className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-white">Recipient &amp; Delivery Details</h2>
                <p className="mt-1 text-xs text-neutral-400">The digital pass will be instantly delivered via email.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Recipient Full Name</label>
                  <input
                    required
                    placeholder="Sarah Jenkins"
                    value={form.recipientName}
                    onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Recipient Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="sarah@example.com"
                    value={form.recipientEmail}
                    onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Your Name (Sender)</label>
                  <input
                    required
                    placeholder="Michael Brown"
                    value={form.senderName}
                    onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Personalized Message</label>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 px-4 py-3.5 text-xs text-white placeholder-neutral-600 outline-none focus:border-amber-500 transition resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-amber-500 px-6 py-4 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-400 transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Issue &amp; Send Gift Voucher (${amount})</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
