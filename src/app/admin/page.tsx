"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Users, Calendar, Utensils, Award, Sparkles, RefreshCw,
  CheckCircle2, ShieldAlert, Heart, Wine, DollarSign, TrendingUp,
  Volume2, VolumeX, ChefHat, ShieldCheck, ArrowUpRight, ShoppingBag,
  Activity, Clock
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

const TOP_DISHES = [
  { name: "Filet Mignon & Truffle Reduction", orders: 142, revenue: "₹4,97,000", pct: 88, trend: "+12%" },
  { name: "Pan-Seared Chilean Sea Bass", orders: 118, revenue: "₹3,77,600", pct: 74, trend: "+8%" },
  { name: "Château Margaux Vintage 2015", orders: 86, revenue: "₹6,88,000", pct: 65, trend: "+15%" },
  { name: "Wild Mushroom & Black Truffle Risotto", orders: 79, revenue: "₹1,89,600", pct: 52, trend: "-2%" },
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
  const [activeTab, setActiveTab] = useState<"overview" | "guests">("overview");
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

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in">
        <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-6">
          <div className="w-48 h-6 bg-neutral-900 rounded-md animate-pulse"></div>
          <div className="w-64 h-8 bg-neutral-800 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl h-36 flex flex-col justify-between">
              <div className="w-24 h-3 bg-neutral-800 rounded animate-pulse mb-4"></div>
              <div className="w-32 h-8 bg-neutral-800 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-neutral-800/50 rounded animate-pulse mt-4"></div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 h-80">
            <div className="w-40 h-5 bg-neutral-800 rounded animate-pulse mb-6"></div>
            <div className="w-full h-full bg-neutral-900 rounded animate-pulse"></div>
          </div>
          <div className="lg:col-span-3 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 h-80">
            <div className="w-40 h-5 bg-neutral-800 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-full h-10 bg-neutral-900 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
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
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── HEADER TITLE & CONTROLS ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Executive Operations
            </span>

            {/* RBAC Mode Badge */}
            <div className="flex items-center gap-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-full px-3 py-1 text-xs font-semibold">
              <span className="text-neutral-400 text-[10px] uppercase tracking-widest">Role View:</span>
              <select
                value={rbacRole}
                onChange={(e) => setRbacRole(e.target.value as any)}
                className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
              >
                <option value="owner" className="bg-neutral-950">Owner (Full Analytics)</option>
                <option value="manager" className="bg-neutral-950">Manager (Bookings & Menu)</option>
                <option value="chef" className="bg-neutral-950">Kitchen Staff (KDS)</option>
              </select>
            </div>
          </div>

          <h1 className="text-3xl font-serif text-white font-bold tracking-tight">
            VELORA Command Center
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Real-time overview of your restaurant operations</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Audio Chime Notification Toggle */}
          <button
            type="button"
            onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playAlertSound(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border shadow-lg ${
              soundEnabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white"
            }`}
            title="Toggle New Order Audio Chime Alert"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Audio ON" : "Audio Muted"}</span>
          </button>

          {/* View Switcher Tabs */}
          <div className="flex gap-1 bg-neutral-900/80 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-xl shadow-lg">
            {[
              { id: "overview", label: "Overview" },
              { id: "guests", label: "VIP Guests" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === t.id ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]" : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
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
        <div className="relative p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 overflow-hidden animate-fade-in group">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%)] bg-[length:250px_250px] animate-shimmer" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white font-bold">Kitchen Display Screen (KDS) Mode Active</h2>
                <p className="text-xs text-neutral-400 mt-1">Focuses strictly on pending dish preparation tickets and live station orders.</p>
              </div>
            </div>
            <Link
              href="/admin/kds"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-extrabold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2"
            >
              Enter Live Kitchen View <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <>
          {/* ── KEY PERFORMANCE STATS CARDS ──────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-2">Estimated Revenue</p>
                  <h2 className="text-3xl font-serif font-bold text-white">₹{estimatedRevenue.toLocaleString("en-IN")}</h2>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium relative z-10 bg-emerald-500/10 inline-flex px-2 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />
                <span>+18.4% this week</span>
              </div>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-2">Total Dining Orders</p>
                  <h2 className="text-3xl font-mono font-bold text-white">{c.totalOrders}</h2>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-amber-300 font-mono relative z-10">
                <Activity className="w-3.5 h-3.5" />
                <span>{c.pendingOrders} Active / Preparing</span>
              </div>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-sky-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-2">Confirmed Guests</p>
                  <h2 className="text-3xl font-serif font-bold text-white">{c.confirmedReservations}</h2>
                </div>
                <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-sky-300 font-mono relative z-10">
                <Clock className="w-3.5 h-3.5" />
                <span>{c.pendingReservations} Pending Requests</span>
              </div>
            </div>

            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mb-2">Registered VIPs</p>
                  <h2 className="text-3xl font-mono font-bold text-white">{c.totalUsers}</h2>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-purple-300 font-mono relative z-10">
                <Utensils className="w-3.5 h-3.5" />
                <span>{c.totalMenuItems} Menu Items</span>
              </div>
            </div>
          </div>

          {/* ── CHARTS SECTION (REVENUE TREND & TOP DISHES) ───────────────── */}
          <div className="grid lg:grid-cols-7 gap-6">

            {/* Revenue Trend Area Chart (4 Columns) */}
            <div className="lg:col-span-4 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl transition-transform group-hover:scale-125 pointer-events-none"></div>
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 relative z-10">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Weekly Revenue Trend
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Live sales performance over the past 7 days</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm">
                  +24.5% vs Last Week
                </span>
              </div>

              <div className="h-64 w-full mt-6 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOverviewRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis dataKey="day" stroke="#525252" tick={{ fill: "#737373", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#525252" tick={{ fill: "#737373", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #262626", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}
                      itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                      labelStyle={{ color: "#a3a3a3", marginBottom: "4px" }}
                      formatter={(value: any, name: any, props: any) => [`₹${value.toLocaleString("en-IN")} (${props.payload.orders} orders)`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOverviewRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Dishes Widget (3 Columns) */}
            <div className="lg:col-span-3 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl transition-transform group-hover:scale-125 pointer-events-none"></div>
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 relative z-10">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Signature Performers
                </h3>
                <Link href="/admin/menu" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  Menu →
                </Link>
              </div>

              <div className="space-y-5 mt-5 relative z-10">
                {TOP_DISHES.map((dish) => (
                  <div key={dish.name} className="space-y-2 group/item">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-200 truncate max-w-[200px] group-hover/item:text-white transition-colors">{dish.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-[10px]">{dish.trend}</span>
                        <span className="text-amber-400 font-mono bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800">{dish.orders}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/80">
                      <div
                        style={{ width: `${dish.pct}%` }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-300 rounded-full transition-all duration-1000 group-hover/item:shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RECENT BOOKINGS TABLE ───────────────────────────── */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4 relative z-10">
              <h2 className="text-lg font-serif text-white font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-400" /> Recent Booking Requests
              </h2>
              <Link href="/admin/reservations" className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-widest text-[10px] font-bold">
                    <th className="pb-3 px-2">Guest</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Date &amp; Time</th>
                    <th className="pb-3 px-2">Party Size</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {stats?.recentReservations?.slice(0, 5).map((r) => (
                    <tr key={r._id} className="hover:bg-neutral-800/30 transition-colors group/row">
                      <td className="py-4 px-2 font-bold text-white group-hover/row:text-amber-400 transition-colors">{r.name}</td>
                      <td className="py-4 px-2 text-neutral-400">{r.email}</td>
                      <td className="py-4 px-2 text-neutral-300 font-mono">{new Date(r.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="py-4 px-2 text-neutral-300 font-bold">{r.guests} Guests</td>
                      <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                          r.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          r.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.recentReservations || stats.recentReservations.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 font-mono text-xs">No recent reservations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: VIP GUEST PROFILES ────────────────────────────────────── */}
      {activeTab === "guests" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl p-6 space-y-6 shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-b border-neutral-800/80 pb-4 gap-4">
            <h2 className="text-xl font-serif text-white font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> VIP Customer Profiles
            </h2>
            <button className="text-xs font-bold text-neutral-400 bg-neutral-950 px-4 py-2 rounded-lg border border-neutral-800 hover:text-white transition">
              Export VIP Data
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {GUEST_ANALYTICS.map((g) => (
              <div key={g.id} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 space-y-4 shadow-xl hover:border-amber-500/30 transition-colors group">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{g.name}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    g.tier === 'Platinum VIP' ? 'bg-slate-200 text-slate-800 shadow-[0_0_10px_rgba(226,232,240,0.5)]' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {g.tier}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800/50 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Visits</span>
                    <p className="text-white font-mono">{g.visits}</p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800/50 space-y-1">
                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Spend</span>
                    <p className="text-emerald-400 font-mono font-bold">{g.spend}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-neutral-800/50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5"><Wine className="w-3.5 h-3.5" /> Favorite</span>
                    <span className="text-neutral-200 font-serif italic truncate max-w-[120px]">{g.favWine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Dietary</span>
                    <span className="text-sky-300 font-medium">{g.dietary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
