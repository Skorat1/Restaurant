"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import UpiQrGenerator from "@/components/UpiQrGenerator";

export default function UpiPaymentPage() {
  const [amount, setAmount] = useState<number>(1250);
  const [upiId, setUpiId] = useState<string>("velora@ybl");
  const [note, setNote] = useState<string>("Dining Bill #2026");

  const presetAmounts = [250, 500, 1000, 1500, 2500, 5000];

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-xl space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit NPCI Encrypted
          </span>
        </div>

        {/* Header Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> UPI Instant Payment
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-wide">
            QR Code Generator &amp; Pay
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Scan via any UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred) to complete instant contactless dining payments.
          </p>
        </div>

        {/* Amount Input & Preset Chips */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1.5">
              Enter Bill Amount (INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-400">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-9 pr-4 py-3 text-lg font-mono font-bold text-white outline-none focus:border-amber-400"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  amount === amt
                    ? "bg-amber-500 text-black border border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive QR Generator with Logo & Palette Controls */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <UpiQrGenerator
            upiId={upiId}
            payeeName="VELORA Haute Cuisine"
            amount={amount}
            transactionNote={note}
          />
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-neutral-500 space-y-1">
          <p>VELORA Haute Cuisine · Verified Merchant UPI: <span className="font-mono text-neutral-400">{upiId}</span></p>
          <p className="text-[11px]">Instant settlement with Zero Convenience Fees.</p>
        </div>

      </div>
    </section>
  );
}
