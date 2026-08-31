"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays, Clock, Users, CheckCircle2, AlertCircle,
  Utensils, Plus, RefreshCw, ChevronLeft, Search, Mail, Phone
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface UserReservation {
  _id: string;
  passCode?: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  guests: number;
  occasion?: string;
  tableId?: string;
  tableNo?: string;
  area?: string;
  status: "Pending" | "Confirmed" | "Declined" | "Seated" | "Completed" | "Waitlisted";
  specialRequests?: string;
  notes?: string;
  dietary?: string[];
  preOrders?: Array<{ id: string; name: string; price: number; category: string }>;
  totalAmount?: number;
  verified?: boolean;
  createdAt: string;
}

export default function MyReservationsPage() {
  const { user, token, loading } = useAuth();
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);

  // Fetch reservations based on user email, stored booking email, or search query
  const fetchReservations = useCallback(async (customQuery?: string) => {
    setLoadingReservations(true);
    setSearched(true);
    try {
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("user_booking_email") : null;
      const storedPhone = typeof window !== "undefined" ? localStorage.getItem("user_booking_phone") : null;

      const queryTerm = (customQuery !== undefined ? customQuery : searchQuery).trim();
      const emailToUse = queryTerm || user?.email || storedEmail || "";
      const phoneToUse = storedPhone || "";

      let url = `${API_BASE_URL}/api/reservations/my`;
      const params = new URLSearchParams();

      if (queryTerm) {
        params.set("search", queryTerm);
      } else {
        if (emailToUse) params.set("email", emailToUse);
        if (phoneToUse) params.set("phone", phoneToUse);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setReservations(data.data);
        } else {
          setReservations([]);
        }
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error("Failed to fetch reservations", err);
      setReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  }, [user?.email, token, searchQuery]);

  useEffect(() => {
    if (!loading) {
      fetchReservations();
    }
  }, [loading, fetchReservations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservations(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Confirmed Table
          </span>
        );
      case "seated":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Utensils className="w-3 h-3 text-blue-400" /> Currently Seated
          </span>
        );
      case "waitlisted":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Clock className="w-3 h-3 text-purple-400" /> Priority Waitlist
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
            <AlertCircle className="w-3 h-3" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" /> Pending Confirmation
          </span>
        );
    }
  };

  const nowTime = Date.now() - 3 * 3600 * 1000;
  const filteredReservations = reservations.filter((r) => {
    const rTime = new Date(r.date).getTime();
    if (filter === "upcoming") return rTime >= nowTime && r.status !== "Declined";
    if (filter === "past") return rTime < nowTime || r.status === "Completed";
    return true;
  });

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6 font-sans">
      <div className="mx-auto max-w-4xl space-y-7">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-amber-400 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to My Profile
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchReservations()}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 shadow-sm"
              title="Refresh Reservations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReservations ? "animate-spin text-amber-400" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/reserve"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Book Table</span>
            </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest">
                <CalendarDays className="w-3.5 h-3.5" /> Dining Reservations
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white pt-1">
                My Reserved Tables
              </h1>
              <p className="text-xs text-neutral-400 max-w-lg">
                View your confirmed table reservations, seating areas, dining passes, and live entry pass codes.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 bg-neutral-950/80 border border-neutral-800 p-4 rounded-2xl shrink-0">
              <div className="text-center px-2">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Total</span>
                <span className="text-xl font-bold font-serif text-white">{reservations.length}</span>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div className="text-center px-2">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">Upcoming</span>
                <span className="text-xl font-bold font-serif text-amber-400">
                  {reservations.filter((r) => new Date(r.date).getTime() >= nowTime && r.status !== "Declined").length}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Lookup & Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking by email, phone, name, or Pass Code (e.g. demo705@gmail.com)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/90 pl-11 pr-4 py-3 text-xs text-white placeholder-neutral-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-amber-500/20 shrink-0"
            >
              Find Booking
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-5 border-t border-neutral-800/80 mt-5">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === "all"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              All ({reservations.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === "upcoming"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              Upcoming ({reservations.filter((r) => new Date(r.date).getTime() >= nowTime && r.status !== "Declined").length})
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === "past"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              Past History
            </button>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {loadingReservations && reservations.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 font-mono text-xs bg-neutral-900/40 border border-neutral-800 rounded-3xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
              Searching table reservations in database...
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto text-amber-400/40">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white">No Reservations Found</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                {searched && searchQuery
                  ? `No reservation matched "${searchQuery}". Please check the email or phone number used during booking.`
                  : "No table reservation found for this account. Enter the email or phone number you used during booking in the search bar above."}
              </p>
              <div className="pt-2">
                <Link
                  href="/reserve"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition shadow-xl shadow-amber-500/20"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Reserve a Table Now</span>
                </Link>
              </div>
            </div>
          ) : (
            filteredReservations.map((res) => {
              const resDate = new Date(res.date);
              const isUpcoming = resDate.getTime() > nowTime;
              return (
                <div
                  key={res._id}
                  className={`rounded-3xl border p-5 sm:p-7 transition-all ${
                    isUpcoming
                      ? "bg-neutral-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5 hover:border-amber-400"
                      : "bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 shrink-0 shadow-inner">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">{resDate.toLocaleString("en-US", { month: "short" })}</span>
                        <span className="text-lg font-bold font-serif leading-none mt-0.5">{resDate.getDate()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                            Table {res.tableId || res.tableNo || "T1"}
                          </h3>
                          <span className="text-xs text-amber-400 font-semibold">({res.area || "Main Dining Salon"})</span>
                        </div>
                        <p className="text-xs text-neutral-300 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {resDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })} at{" "}
                            {resDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(res.status)}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 py-4 text-xs">
                    <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Guests</span>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>{res.guests} Person(s)</span>
                      </div>
                    </div>

                    <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Dining Occasion</span>
                      <span className="font-bold text-white">{res.occasion || "General Dining"}</span>
                    </div>

                    <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Pass Code</span>
                      <span className="font-mono font-extrabold text-amber-400 tracking-wider text-sm">
                        {res.passCode || `RES-${res._id.slice(-6).toUpperCase()}`}
                      </span>
                    </div>

                    <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">Guest Contact</span>
                      <span className="font-bold text-neutral-200 truncate block text-[11px]">
                        {res.email}
                      </span>
                    </div>
                  </div>

                  {/* Pre-Orders & Special Requests */}
                  {(res.specialRequests || res.notes || (res.preOrders && res.preOrders.length > 0)) && (
                    <div className="pt-2 text-xs text-neutral-400 space-y-2 border-t border-neutral-800/80">
                      {res.preOrders && res.preOrders.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-amber-400">Pre-ordered Dishes:</span>
                          {res.preOrders.map((item, idx) => (
                            <span key={idx} className="bg-neutral-950 border border-neutral-800 text-neutral-200 px-2.5 py-1 rounded-xl text-xs">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {(res.specialRequests || res.notes) && (
                        <p className="italic text-neutral-400 bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/50">
                          {res.specialRequests || res.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-4 flex items-center justify-between gap-3 flex-wrap border-t border-neutral-800/60 mt-3">
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Booking Reference: #{res._id} · Booked by {res.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/contact"
                        className="text-xs text-neutral-400 hover:text-amber-400 transition"
                      >
                        Modify / Contact Concierge
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
