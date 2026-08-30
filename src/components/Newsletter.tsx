"use client";
import { useState } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Loader2, Mail, User } from "lucide-react";
import API_BASE_URL from "@/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: null, text: "" });

    if (!email.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your email address." });
      return;
    }

    if (!validateEmail(email.trim())) {
      setStatusMsg({ type: "error", text: "Please provide a valid email address (e.g. name@example.com)." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({
          type: "success",
          text: "✨ Subscribed successfully! Check your inbox for your digital VIP 10% dining pass."
        });
        setEmail("");
        setName("");
      } else {
        setStatusMsg({ type: "error", text: data.msg || "Subscription failed. Please try again." });
      }
    } catch {
      setStatusMsg({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card-glass rounded-3xl p-8 sm:p-12 border-amber-500/30 shadow-2xl relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Join The VIP VELORA Club
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-white font-bold tracking-tight">
          Exclusive Culinary Invites &amp; Secret Vintages
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
          Subscribe to receive private invitations to seasonal tasting launches, wine cellar releases, and an instant <strong>10% VIP Dining Gift Pass</strong>.
        </p>

        <form onSubmit={submit} className="space-y-4 pt-2 text-left">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newsletter-name" className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Your Full Name (Optional)
              </label>
              <div className="relative">
                <input
                  id="newsletter-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="input-base py-3.5 !pl-11 text-xs font-semibold"
                  disabled={submitting}
                />
                <User className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="newsletter-email" className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="newsletter-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (statusMsg.type === "error") setStatusMsg({ type: null, text: "" });
                  }}
                  placeholder="name@example.com"
                  type="email"
                  required
                  className="input-base py-3.5 !pl-11 text-xs font-semibold"
                  disabled={submitting}
                />
                <Mail className="w-4 h-4 text-amber-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-3.5 px-8 text-xs tracking-widest font-extrabold flex items-center justify-center gap-2 min-w-[200px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Joining VIP Club...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>JOIN VIP CLUB</span>
                </>
              )}
            </button>
          </div>

          {statusMsg.type && (
            <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 animate-fade-up ${statusMsg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}>
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
