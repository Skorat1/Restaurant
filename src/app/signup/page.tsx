"use client";
import { useState } from "react";
import Link from "next/link";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", password: "" , repassword: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { login } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        setSentEmail(form.email);
        setDone(true);
      } else {
        setError(data.msg || "Registration failed.");
      }
    } catch {
      setError("Unable to reach the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-serif text-white">Check your inbox</h1>
          <p className="mt-3 text-neutral-400 leading-relaxed">
            We sent a verification link to{" "}
            <span className="text-amber-400 font-medium">{sentEmail}</span>.
            <br />Click the link in the email to activate your account.
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <Link href="/profile" className="text-amber-400 hover:underline">
              resend from your profile
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6 rounded-[2rem] border border-neutral-800/80 bg-neutral-900/80 p-12 shadow-2xl shadow-black/20">
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Join the experience</span>
          <h1 className="text-4xl font-serif text-white">Create your account and reserve an unforgettable evening.</h1>
          <p className="max-w-xl text-neutral-400 leading-7">
            Register once to save your details, access exclusive invitations, and receive seasonal menu previews from our dining house.
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6 rounded-[2rem] border border-neutral-800/80 bg-neutral-950/85 p-10 shadow-xl shadow-black/20">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-neutral-400">Full name</label>
            <input type="text" required onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-neutral-400">Email address</label>
            <input type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-amber-500" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-neutral-400">Password</label>
            <input type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-amber-500" />
          </div>
          {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50">
            {loading ? "Creating account…" : "Register"}
          </button>
          <p className="text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-400 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
