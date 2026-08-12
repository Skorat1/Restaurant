"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import API_BASE_URL from "@/lib/api";

export default function VerifyPage() {
  const { token } = useParams();
  interface VerifiedReservation {
    name: string;
    email: string;
    date: string;
    guests: number;
  }

  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("");
  const [reservation, setReservation] = useState<VerifiedReservation | null>(null);

  useEffect(() => {
    if (!token) return;
    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reservations/verify/${token}`);
        const data = await res.json();
        if (res.ok) {
          if (data.reservation?.verified) {
            setStatus("success");
          } else {
            setStatus("already");
          }
          setMessage(data.msg);
          setReservation(data.reservation || null);
        } else {
          setStatus("error");
          setMessage(data.msg || "Verification failed.");
        }
      } catch {
        setStatus("error");
        setMessage("Unable to reach the server. Please try again later.");
      }
    };
    verify();
  }, [token]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="mx-auto max-w-xl px-6 py-24">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-10 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-6 text-neutral-400">Verifying your reservation…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-serif text-white">Reservation Verified!</h1>
            <p className="mt-3 text-neutral-400">{message}</p>

            {reservation && (
              <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Reservation for</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300">
                    Verified
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{reservation.name}</p>
                <p className="text-sm text-neutral-400">{reservation.email}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Date</p>
                    <p className="text-white font-medium">{formatDate(reservation.date)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Time</p>
                    <p className="text-white font-medium">{formatTime(reservation.date)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Guests</p>
                    <p className="text-white font-medium">{reservation.guests}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/reserve"
                className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
              >
                Make Another Reservation
              </Link>
              <Link
                href="/"
                className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 transition"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {status === "already" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-serif text-white">Already Verified</h1>
            <p className="mt-3 text-neutral-400">{message}</p>
            <div className="mt-8">
              <Link
                href="/reserve"
                className="inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
              >
                Book Another Table
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-serif text-white">Verification Failed</h1>
            <p className="mt-3 text-neutral-400">{message}</p>
            <div className="mt-8">
              <Link
                href="/reserve"
                className="inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
              >
                Make a New Reservation
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

