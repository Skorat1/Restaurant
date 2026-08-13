"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { login, token } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResendMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        if (data.user.isVerified === false) {
          setUnverified(true);
        } else {
          router.push("/");
        }
      } else {
        setError(data.msg || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResendMsg(data.msg || "Verification email sent.");
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (unverified) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24">
        <div className="rounded-3xl border border-amber-500/30 bg-neutral-900/60 p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-serif text-white">Verify your email</h1>
          <p className="mt-3 text-neutral-400 leading-relaxed">
            Your account is not yet verified. We sent a verification link to{" "}
            <span className="text-amber-400 font-medium">{form.email}</span>.
            <br />Please check your inbox and click the link to continue.
          </p>

          {resendMsg && (
            <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">{resendMsg}</p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resendVerification}
              disabled={resending}
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend Verification Email"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Continue to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-24">
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-2xl sm:rounded-[2rem] border border-neutral-800/80 bg-neutral-900/80 p-6 sm:p-12 shadow-2xl shadow-black/20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-amber-400 font-bold">Sign in</p>
          <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl font-serif text-white">Welcome back to VELORA.</h1>
          <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm text-neutral-400 leading-6 sm:leading-7">
            Access reservation benefits, see exclusive events, and manage your upcoming dining experiences from your account.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5 sm:space-y-6 rounded-2xl sm:rounded-[2rem] border border-neutral-800/80 bg-neutral-950/85 p-6 sm:p-10 shadow-xl shadow-black/20">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">Email address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-neutral-400 font-semibold">Password</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500" />
          </div>
          {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-amber-500 px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-black transition hover:bg-amber-400 disabled:opacity-50 shadow-lg shadow-amber-500/20">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-center text-xs sm:text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-amber-400 font-semibold hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
