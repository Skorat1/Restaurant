"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

import FloorPlanView from "./FloorPlanView";

interface Reservation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  notes: string;
  occasion?: string;
  tableId?: string;
  dietary?: string[];
  preOrders?: Array<{ id: string; name: string; price: number; category: string; icon?: string }>;
  promoCode?: string;
  totalAmount?: number;
  specialRequests?: string;
  status: string;
  verified: boolean;
  createdAt: string;
}

export default function AdminReservations() {
  const { token } = useAuth();
  const [viewMode, setViewMode] = useState<"floor" | "list">("floor");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [working, setWorking] = useState("");
  const [emailSent, setEmailSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) return;
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reservations/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        } else {
          setError("Failed to load reservations.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setReservations((prev) =>
          prev.map((r) => (r._id === id ? data.reservation : r))
        );
        if (status === "Confirmed" || status === "Declined") {
          setEmailSent((prev) => ({ ...prev, [id]: true }));
          setTimeout(() => setEmailSent((prev) => ({ ...prev, [id]: false })), 4000);
        }
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to update.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Delete this reservation?")) return;
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReservations((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const filters = ["All", "Pending", "Confirmed", "Declined", "Verified"];
  const filtered = filter === "All"
    ? reservations
    : filter === "Verified"
      ? reservations.filter((r) => r.verified)
      : reservations.filter((r) => r.status === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
    switch (status) {
      case "Confirmed": return `${base} bg-emerald-500/15 text-emerald-300`;
      case "Declined": return `${base} bg-red-500/15 text-red-300`;
      default: return `${base} bg-amber-500/15 text-amber-300`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-1 text-3xl font-serif text-white">Table Management & Reservations</h1>
          <p className="mt-1 text-neutral-400 text-sm">Real-time floor map, seated tables, and waitlist management.</p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("floor")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              viewMode === "floor"
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Floor Plan View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              viewMode === "list"
                ? "bg-amber-500 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === "floor" ? (
        <FloorPlanView token={token || undefined} />
      ) : (
        <div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? "bg-amber-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1.5 opacity-60">
                {f === "Verified"
                  ? reservations.filter((r) => r.verified).length
                  : reservations.filter((r) => r.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          No reservations {filter !== "All" ? `with status "${filter}"` : "yet"}.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((res) => (
            <div
              key={res._id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition hover:border-neutral-700"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{res.name}</h3>
                    <span className={statusBadge(res.status)}>{res.status}</span>
                    {res.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-400">
                    <span>{formatDate(res.date)} · {formatTime(res.date)}</span>
                    <span>{res.guests} {res.guests === 1 ? "guest" : "guests"}</span>
                    {res.phone && <span>{res.phone}</span>}
                    <span className="text-neutral-500">{res.email}</span>
                  </div>

                  {res.notes && (
                    <p className="mt-2 text-sm text-neutral-500 italic">
                      &ldquo;{res.notes}&rdquo;
                    </p>
                  )}

                  {!res.verified && (
                    <p className="mt-2 text-xs text-amber-400/80">
                      ⚠ Email not yet verified
                    </p>
                  )}
                  {emailSent[res._id] && (
                    <p className="mt-2 text-xs text-emerald-400 font-medium">✅ Confirmation email sent to {res.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {res.status !== "Confirmed" && (
                    <button
                      onClick={() => updateStatus(res._id, "Confirmed")}
                      disabled={working === res._id}
                      className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                    >
                      Confirm
                    </button>
                  )}
                  {res.status !== "Declined" && (
                    <button
                      onClick={() => updateStatus(res._id, "Declined")}
                      disabled={working === res._id}
                      className="rounded-full bg-red-500/15 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/25 transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}
                  <button
                    onClick={() => deleteReservation(res._id)}
                    disabled={working === res._id}
                    className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
</div>
);
}


