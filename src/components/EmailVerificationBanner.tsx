"use client";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

export default function EmailVerificationBanner() {
  const { user, token } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user || user.isVerified) return null;

  const resend = async () => {
    setSending(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.msg || "Verification email sent.");
      } else {
        setError(data.msg || "Failed to resend verification email.");
      }
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 shrink-0 rounded-full bg-amber-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-300">Email not yet verified</p>
            <p className="text-sm text-neutral-400 mt-0.5">
              Please confirm your email address to unlock the full experience. Check your inbox for a link, or resend it below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resend}
          disabled={sending}
          className="shrink-0 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Resend Email"}
        </button>
      </div>
      {message && (
        <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{message}</p>
      )}
      {error && (
        <p className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-200">{error}</p>
      )}
    </div>
  );
}
