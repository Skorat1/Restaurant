"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

interface Reservation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  notes: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (!token) return;
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchReservations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (res.ok) {
          const data = await res.json();
          const sortedData = data.sort((a: Reservation, b: Reservation) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setReservations(sortedData);
        } else {
          const errorData = await res.json().catch(() => null);
          setError(errorData?.message || "Failed to load reservations.");
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setError("Unable to reach the server.");
      } finally {
        setFetching(false);
      }
    };
    fetchReservations();
  }, [token]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
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

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Confirmed":
        return `${base} bg-emerald-500/15 text-emerald-300`;
      case "Declined":
        return `${base} bg-red-500/15 text-red-300`;
      default:
        return `${base} bg-amber-500/15 text-amber-300`;
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400">User Dashboard</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-serif text-white">My Reservations</h1>
          <p className="mt-1 text-neutral-400 text-sm">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. View and track your active table bookings.
          </p>
        </div>

        <Link
          href="/reserve"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-xs font-bold text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 self-start md:self-auto"
        >
          + New Table Booking
        </Link>
      </div>

      <EmailVerificationBanner />

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-8">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-white mb-2">No Saved Reservations Yet</h3>
          <p className="text-neutral-400 max-w-sm mx-auto mb-6">
            You haven&apos;t made any table reservations yet. Book your table for a fine-dining experience.
          </p>
          <Link
            href="/reserve"
            className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition"
          >
            Book a Table
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-5xl mx-auto">
          {reservations.map((res) => (
            <div
              key={res._id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition hover:border-neutral-700"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-white">
                    {formatDate(res.date)}
                  </h3>
                  <span className={statusBadge(res.status)}>{res.status}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatTime(res.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {res.guests} {res.guests === 1 ? "guest" : "guests"}
                  </span>
                  {res.phone && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      {res.phone}
                    </span>
                  )}
                </div>
                {res.notes && (
                  <p className="mt-2 text-sm text-neutral-500 italic">
                    &ldquo;{res.notes}&rdquo;
                  </p>
                )}
              </div>
              <div className="text-xs text-neutral-500 shrink-0 text-right">
                Booked on {formatDate(res.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
