"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Users, Calendar, Utensils, Award, Sparkles, RefreshCw,
  CheckCircle2, ShieldAlert, Heart, Wine, DollarSign, TrendingUp,
  Volume2, VolumeX, ChefHat, ShieldCheck, ArrowUpRight, ShoppingBag
} from "lucide-react";
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

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string };
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
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
    totalOrders: number;
    pendingOrders: number;
  };
  recentReservations: Reservation[];
  recentOrders?: Order[];
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

const TOP_DISHES = [
  { name: "Filet Mignon & Truffle Reduction", orders: 142, revenue: "₹4,97,000", pct: 88 },
  { name: "Pan-Seared Chilean Sea Bass", orders: 118, revenue: "₹3,77,600", pct: 74 },
  { name: "Château Margaux Vintage 2015", orders: 86, revenue: "₹6,88,000", pct: 65 },
  { name: "Wild Mushroom & Black Truffle Risotto", orders: 79, revenue: "₹1,89,600", pct: 52 },
];

const REVENUE_DATA = [
  { day: "Mon", revenue: 42000, orders: 18 },
  { day: "Tue", revenue: 58000, orders: 24 },
  { day: "Wed", revenue: 51000, orders: 21 },
  { day: "Thu", revenue: 74000, orders: 32 },
  { day: "Fri", revenue: 98000, orders: 45 },
  { day: "Sat", revenue: 135000, orders: 62 },
  { day: "Sun", revenue: 112000, orders: 54 },
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
  const { user, token, loading } = useAuth();
  const [tables, setTables] = useState(INITIAL_TABLES);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "floorplan" | "guests">("overview");
  const [rbacRole, setRbacRole] = useState<"owner" | "manager" | "chef">("owner");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { data: stats, isLoading } = useSWR<Stats>(
    !loading && token ? `${API_BASE_URL}/api/admin/stats` : null,
    (url: string) => fetcher(url, token),
    { refreshInterval: 10000 }
  );

  // Play audio chime notification
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // silent fallback
    }
  };

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
    totalOrders: 0, pendingOrders: 0,
  };

  const estimatedRevenue = (c.totalOrders * 2850) + (c.confirmedReservations * 4200);

  return (
    <div className="space-y-8 pb-12">

      {/* ── HEADER TITLE & CONTROLS ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Executive Operations Control
            </span>

            {/* RBAC Mode Badge */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <span className="text-neutral-400 text-[10px]">Role View:</span>
              <select
                value={rbacRole}
                onChange={(e) => setRbacRole(e.target.value as any)}
                className="bg-transparent text-amber-300 font-bold text-xs outline-none cursor-pointer"
              >
                <option value="owner" className="bg-neutral-950 text-white">Owner (Full Analytics)</option>
                <option value="manager" className="bg-neutral-950 text-white">Manager (Bookings & Menu)</option>
                <option value="chef" className="bg-neutral-950 text-white">Kitchen Staff / Chef (KDS)</option>
              </select>
            </div>
          </div>

          <h1 className="text-3xl font-serif text-white mt-2 font-bold tracking-tight">
            VELORA Staff Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Audio Chime Notification Toggle */}
          <button
            type="button"
            onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playAlertSound(); }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              soundEnabled
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
            title="Toggle New Order Audio Chime Alert"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio Alerts ON" : "Audio Muted"}</span>
          </button>

          {/* View Switcher Tabs */}
          <div className="flex gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
            {[
              { id: "overview", label: "Overview" },
              { id: "analytics", label: "Analytics" },
              { id: "floorplan", label: "Live Floor Plan" },
              { id: "guests", label: "VIP Guests" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === t.id ? "bg-amber-500 text-black shadow-md" : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHEF KITCHEN DISPLAY MODE (If Chef Role Selected) ───────────────── */}
      {rbacRole === "chef" && (
        <div className="p-6 rounded-3xl border border-amber-500/40 bg-amber-500/5 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-serif text-white font-bold">Kitchen Display Screen (KDS) Mode</h2>
            </div>
            <Link
              href="/admin/orders"
              className="px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
            >
              Manage Live Orders Queue →
            </Link>
          </div>
          <p className="text-xs text-neutral-300">
            Kitchen Mode focuses strictly on pending dish preparation tickets and live station orders.
          </p>
        </div>
      )}

      {activeTab === "overview" && (
        <>
          {/* ── KEY PERFORMANCE STATS CARDS ──────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Estimated Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
                ₹{estimatedRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-300/80 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" /> +18.4% this week
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Dining Orders</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">{c.totalOrders}</p>
              <p className="text-[11px] text-amber-300/80 font-mono">{c.pendingOrders} Active / Preparing</p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Confirmed Guests</span>
                <Calendar className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-sky-400">{c.confirmedReservations}</p>
              <p className="text-[11px] text-sky-300/80 font-mono">{c.pendingReservations} Pending Requests</p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Registered VIPs</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif font-bold text-purple-400">{c.totalUsers}</p>
              <p className="text-[11px] text-purple-300/80 font-mono">{c.totalMenuItems} Menu Items</p>
            </div>
          </div>

          {/* ── CHARTS SECTION (REVENUE TREND & TOP DISHES) ───────────────── */}
          <div className="grid lg:grid-cols-7 gap-6">

            {/* Revenue Trend SVG Curve Chart (4 Columns) */}
            <div className="lg:col-span-4 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Revenue &amp; Orders Trend
                  </h3>
                  <p className="text-xs text-neutral-400">Live sales performance over the past 7 days</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  +24.5% vs Last Week
                </span>
              </div>

              {/* SVG Curve Diagram */}
              <div className="relative pt-4">
                <div className="h-44 w-full flex items-end justify-between gap-2 px-2 relative z-10">
                  {REVENUE_DATA.map((d, i) => {
                    const heightPct = Math.round((d.revenue / 140000) * 100);
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="opacity-0 group-hover:opacity-100 transition bg-neutral-950 text-amber-400 text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-neutral-800 absolute -top-8 z-20 whitespace-nowrap shadow-lg">
                          ₹{d.revenue.toLocaleString("en-IN")} ({d.orders} orders)
                        </div>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full max-w-[32px] bg-gradient-to-t from-amber-600 via-amber-500 to-amber-300 rounded-t-lg group-hover:from-amber-400 group-hover:to-amber-200 transition-all duration-300 shadow-md shadow-amber-500/20"
                        />
                        <span className="text-[11px] font-mono text-neutral-400 font-semibold">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Horizontal Baseline */}
                <div className="border-b border-neutral-800 w-full mt-1" />
              </div>
            </div>

            {/* Top Selling Dishes Widget (3 Columns) */}
            <div className="lg:col-span-3 rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Top Selling Signature Dishes
                </h3>
                <Link href="/admin/menu" className="text-xs font-bold text-amber-400 hover:underline">
                  View Menu →
                </Link>
              </div>

              <div className="space-y-4">
                {TOP_DISHES.map((dish) => (
                  <div key={dish.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white truncate max-w-[200px]">{dish.name}</span>
                      <span className="text-amber-400 font-mono font-bold">{dish.orders} Orders</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                      <div
                        style={{ width: `${dish.pct}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RECENT BOOKINGS & ORDERS TABLE ───────────────────────────── */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-lg font-serif text-white font-bold">Recent Booking Requests</h2>
              <Link href="/admin/reservations" className="text-xs font-bold text-amber-400 hover:underline">
                View All Reservations →
              </Link>
            </div>

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
                    <tr key={r._id} className="hover:bg-neutral-950/40 transition">
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

      {/* ── TAB 2: ADVANCED ANALYTICS ────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-up">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4">
            <h2 className="text-xl font-serif text-white font-bold">Deep Financial &amp; Guest Analytics</h2>
            <p className="text-xs text-neutral-400">Comprehensive sales breakdown, category revenue shares, and peak dining hours.</p>

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Average Order Value (AOV)</span>
                <p className="text-3xl font-serif font-bold text-amber-400">₹2,840</p>
                <p className="text-xs text-neutral-400">+12% vs last month</p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Peak Dining Hours</span>
                <p className="text-3xl font-serif font-bold text-emerald-400">8:00 – 10:00 PM</p>
                <p className="text-xs text-neutral-400">Weekend occupancy: 96%</p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-2">
                <span className="text-xs text-neutral-400 font-bold uppercase">Wine Cellar Share</span>
                <p className="text-3xl font-serif font-bold text-purple-400">38.2%</p>
                <p className="text-xs text-neutral-400">Grand Crus &amp; Champagnes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: LIVE FLOOR PLAN ───────────────────────────────────────── */}
      {activeTab === "floorplan" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 animate-fade-up">
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

      {/* ── TAB 4: VIP GUEST ANALYTICS ────────────────────────────────────── */}
      {activeTab === "guests" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 space-y-4 animate-fade-up">
          <h2 className="text-lg font-serif text-white font-bold">VIP Customer Dining Analytics</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {GUEST_ANALYTICS.map((g) => (
              <div key={g.id} className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950 space-y-3 shadow-lg">
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

