"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Users, Calendar, Utensils, Award, Sparkles, RefreshCw, CheckCircle2, ShieldAlert, Heart, Wine } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Reservation {
  _id: string;
  name: string;
  email: string;
  date: string;
  guests: number;
  status: string;
  verified: boolean;
  createdAt: string;
}

interface Stats {
  counts: {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    declinedReservations: number;
    verifiedReservations: number;
    totalUsers: number;
    totalMenuItems: number;
    totalInquiries: number;
    totalSubscribers: number;
  };
  recentReservations: Reservation[];
}

const INITIAL_TABLES = [
  { id: "T1", name: "T1 - Window Pair", zone: "Main Salon", seats: 2, status: "Available" },
  { id: "T2", name: "T2 - Window Alcove", zone: "Main Salon", seats: 2, status: "Seated" },
  { id: "T3", name: "T3 - Salon Round", zone: "Main Salon", seats: 4, status: "Reserved" },
  { id: "T4", name: "T4 - Grand Center", zone: "Main Salon", seats: 6, status: "Cleaning" },
  { id: "T5", name: "T5 - Chef's Counter 1", zone: "Chef's Table", seats: 2, status: "Seated" },
  { id: "T6", name: "T6 - Chef's Counter 2", zone: "Chef's Table", seats: 2, status: "Available" },
  { id: "T7", name: "T7 - VIP Skylight 1", zone: "VIP Terrace", seats: 4, status: "Reserved" },
  { id: "T8", name: "T8 - VIP Skylight 2", zone: "VIP Terrace", seats: 6, status: "Available" },
];

const GUEST_ANALYTICS = [
  { id: "g-1", name: "Dr. Vikram Seth", visits: 14, spend: "₹1,48,500", favWine: "Château Margaux 2015", dietary: "Gluten-Free", tier: "Platinum VIP" },
  { id: "g-2", name: "Ananya Roy", visits: 8, spend: "₹82,400", favWine: "Dom Pérignon Brut 2012", dietary: "Nut Allergy", tier: "Gold Member" },
  { id: "g-3", name: "Siddharth Malhotra", visits: 5, spend: "₹45,000", favWine: "Tignanello Antinori 2018", dietary: "None", tier: "Gold Member" },
];

const fetcher = (url: string, token: string | null) => {
  if (!token) throw new Error("Not authorized");
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
    if (!res.ok) throw new Error("Failed to load stats.");
    return res.json();
  });
};

export default function AdminDashboard() {
  const { token, loading } = useAuth();
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [activeTab, setActiveTab] = useState<"overview" | "floorplan" | "guests">("overview");

  const { data: stats, isLoading } = useSWR<Stats>(
    !loading && token ? `${API_BASE_URL}/api/admin/stats` : null,
    (url: string) => fetcher(url, token)
  );

  const cycleTableStatus = (id: string) => {
    const statuses = ["Available", "Seated", "Cleaning", "Reserved"];
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const nextIdx = (statuses.indexOf(t.status) + 1) % statuses.length;
        return { ...t, status: statuses[nextIdx] };
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const c = stats?.counts || {
    totalReservations: 0, pendingReservations: 0, confirmedReservations: 0,
    declinedReservations: 0, verifiedReservations: 0, totalUsers: 0,
    totalMenuItems: 0, totalInquiries: 0, totalSubscribers: 0,
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Staff Operations Portal
          </span>
          <h1 className="text-3xl font-serif text-white mt-2">Executive Admin Dashboard</h1>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 self-start sm:self-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "floorplan", label: "Live Floor Plan" },
            { id: "guests", label: "Guest Analytics" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === t.id ? "bg-amber-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1">
              <p className="text-xs text-neutral-400 font-semibold uppercase">Total Reservations</p>
              <p className="text-3xl font-serif font-bold text-amber-400">{c.totalReservations}</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1">
              <p className="text-xs text-neutral-400 font-semibold uppercase">Confirmed Guests</p>
              <p className="text-3xl font-serif font-bold text-emerald-400">{c.confirmedReservations}</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1">
              <p className="text-xs text-neutral-400 font-semibold uppercase">Registered Users</p>
              <p className="text-3xl font-serif font-bold text-sky-400">{c.totalUsers}</p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1">
              <p className="text-xs text-neutral-400 font-semibold uppercase">Menu Items</p>
              <p className="text-3xl font-serif font-bold text-purple-400">{c.totalMenuItems}</p>
            </div>
          </div>

          {/* Recent Reservations Table */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
            <h2 className="text-lg font-serif text-white font-bold">Recent Booking Requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Guest</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Date &amp; Time</th>
                    <th className="pb-3 font-semibold">Party</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {stats?.recentReservations?.map((r) => (
                    <tr key={r._id} className="hover:bg-neutral-950/40">
                      <td className="py-3.5 font-bold text-white">{r.name}</td>
                      <td className="py-3.5 text-neutral-400">{r.email}</td>
                      <td className="py-3.5 text-neutral-300">{new Date(r.date).toLocaleString()}</td>
                      <td className="py-3.5 text-amber-400 font-bold">{r.guests} Guests</td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "floorplan" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-lg font-serif text-white font-bold">Real-time Staff Table Management</h2>
              <p className="text-xs text-neutral-400">Click any table to cycle status: Available ➔ Seated ➔ Cleaning ➔ Reserved</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {tables.map((t) => (
              <button
                key={t.id}
                onClick={() => cycleTableStatus(t.id)}
                className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between h-32 ${
                  t.status === "Available"
                    ? "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
                    : t.status === "Seated"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : t.status === "Cleaning"
                    ? "bg-sky-950/40 border-sky-500/50 text-sky-300"
                    : "bg-purple-950/40 border-purple-500/50 text-purple-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 text-white">
                    {t.id}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-950">
                    {t.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white truncate">{t.name}</p>
                  <p className="text-[10px] text-neutral-400">{t.seats} Seats · {t.zone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "guests" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
          <h2 className="text-lg font-serif text-white font-bold">VIP Customer Dining Analytics</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {GUEST_ANALYTICS.map((g) => (
              <div key={g.id} className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{g.name}</h3>
                  <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">{g.tier}</span>
                </div>
                <div className="text-xs space-y-1 text-neutral-300">
                  <p>Visits: <span className="text-amber-400 font-bold">{g.visits} Times</span></p>
                  <p>Total Spend: <span className="text-emerald-400 font-bold">{g.spend}</span></p>
                  <p>Favorite Wine: <span className="text-purple-300 italic">{g.favWine}</span></p>
                  <p>Dietary Notice: <span className="text-sky-300 font-medium">{g.dietary}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
