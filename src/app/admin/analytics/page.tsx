"use client";
import { useEffect, useState, useMemo } from "react";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Activity, Download, CalendarDays, PieChart as PieChartIcon, Clock, BrainCircuit } from "lucide-react";

type AnalyticsData = {
  revenueOverTime: { _id: string; revenue: number; orders: number }[];
  topItems: { _id: string; quantitySold: number; revenueGenerated: number }[];
  peakHours: { _id: number; count: number }[];
  forecasts?: { date: string; predictedRevenue: number }[];
};

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30D");

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/business`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        
        // Fetch forecast separately or combine
        try {
          const forecastRes = await fetch(`${API_BASE_URL}/api/analytics/forecast`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (forecastRes.ok) {
            const forecastJson = await forecastRes.json();
            json.forecasts = forecastJson.forecasts;
          }
        } catch (e) {
          console.error("Failed to load forecasts", e);
        }

        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  const kpis = useMemo(() => {
    if (!data) return { revenue: 0, orders: 0, avgOrder: 0 };
    const totalRev = data.revenueOverTime.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrd = data.revenueOverTime.reduce((sum, item) => sum + item.orders, 0);
    return {
      revenue: totalRev,
      orders: totalOrd,
      avgOrder: totalOrd > 0 ? (totalRev / totalOrd) : 0
    };
  }, [data]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-amber-500 font-mono text-sm uppercase tracking-widest animate-pulse font-bold shadow-amber-500/50">Compiling Analytics...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-10 flex justify-center">
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-3xl max-w-lg text-center flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
        <Activity className="w-12 h-12" />
        <div>
          <p className="text-xl font-bold font-serif text-white">System Error</p>
          <p className="text-sm opacity-80 mt-2">{error}</p>
        </div>
      </div>
    </div>
  );
  
  if (!data) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Live System Data</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-4">
            Financial Analytics
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-lg leading-relaxed">
            Monitor real-time revenue streams, operational throughput, and deep customer purchasing patterns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Segmented Time Range Control */}
          <div className="bg-neutral-900/80 backdrop-blur-xl p-1.5 rounded-xl border border-neutral-800 shadow-xl flex gap-1">
            {["24H", "7D", "30D", "YTD"].map(t => (
              <button 
                key={t} 
                onClick={() => setTimeRange(t)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                  timeRange === t 
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02]" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (!data) return;
              const csvRows = [
                ["VELORA HAUTE CUISINE - BUSINESS ANALYTICS REPORT"],
                [`Generated on: ${new Date().toLocaleString()}`],
                [],
                ["Gross Revenue (INR)", `Rs. ${kpis.revenue}`],
                ["Total Orders Fulfilled", kpis.orders],
                ["Average Ticket Size (INR)", `Rs. ${kpis.avgOrder.toFixed(2)}`],
                [],
                ["--- TOP SELLING ITEMS ---"],
                ["Item Name", "Quantity Sold", "Revenue Generated (INR)"],
                ...data.topItems.map(i => [`"${i._id}"`, i.quantitySold, i.revenueGenerated]),
                [],
                ["--- REVENUE OVER TIME ---"],
                ["Date", "Revenue (INR)", "Orders Count"],
                ...data.revenueOverTime.map(r => [r._id, r.revenue, r.orders])
              ];
              const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `velora_analytics_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-700 text-neutral-300 text-xs font-bold hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 flex items-center gap-2 shadow-xl"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* ── SUPERCHARGED KPI CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Total Revenue */}
        <div className="bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[2]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-8">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <DollarSign className="w-7 h-7" />
            </div>
            <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[10px] font-bold">+24.5%</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Gross Revenue</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              ₹{kpis.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">Accumulated across all channels</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:-translate-y-2 hover:border-blue-500/40 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[2]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-8">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[10px] font-bold">+18.2%</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Total Order Volume</p>
            <h2 className="text-4xl lg:text-5xl font-mono font-bold text-white tracking-tight">
              {kpis.orders.toLocaleString()}
            </h2>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">Completed and fulfilled tickets</p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] transition-all duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-[2]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-8">
            <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-black transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Activity className="w-7 h-7" />
            </div>
            <div className="bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-mono text-[10px] font-bold">+5.1%</span>
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">Average Ticket Size</p>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              ₹{kpis.avgOrder.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <p className="text-[11px] text-neutral-500 mt-3 font-medium">Per completed transaction</p>
          </div>
        </div>

      </div>

      {/* ── IMMERSIVE DATA CHARTS ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
        
        {/* Revenue Area Chart */}
        <div className="bg-neutral-900/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-125 pointer-events-none -z-10"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"></span>
                Revenue Velocity
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Daily income tracking over the selected period</p>
            </div>
            <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenuePremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                <XAxis dataKey="_id" stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "16px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)" }}
                  itemStyle={{ color: "#f59e0b", fontWeight: "bold", fontSize: "14px" }}
                  labelStyle={{ color: "#a3a3a3", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenuePremium)" activeDot={{ r: 6, fill: "#f59e0b", stroke: "#000", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-neutral-900/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-125 pointer-events-none -z-10"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                Transaction Volume
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Daily completed orders count</p>
            </div>
            <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOrdersPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                <XAxis dataKey="_id" stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "16px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)" }}
                  itemStyle={{ color: "#3b82f6", fontWeight: "bold", fontSize: "14px" }}
                  labelStyle={{ color: "#a3a3a3", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  formatter={(value: any) => [`${value} Orders`, "Volume"]}
                />
                <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOrdersPremium)" activeDot={{ r: 6, fill: "#3b82f6", stroke: "#000", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 relative z-10">
        
        {/* Peak Hours Bar Chart */}
        <div className="bg-neutral-900/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-125 pointer-events-none -z-10"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                Peak Occupancy Windows
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Customer activity distributed by hour</p>
            </div>
            <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPeakPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                <XAxis
                  dataKey="_id"
                  stroke="#525252"
                  tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }}
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  tickFormatter={(val) => `${val}:00`}
                />
                <YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)" }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold", fontSize: "14px" }}
                  labelStyle={{ color: "#a3a3a3", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  labelFormatter={(val) => `Time Window: ${val}:00 - ${Number(val)+1}:00`}
                  formatter={(value: any) => [`${value} Orders`, "Activity"]}
                />
                <Bar dataKey="count" fill="url(#colorPeakPremium)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items Pie Chart */}
        <div className="bg-neutral-900/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-125 pointer-events-none -z-10"></div>
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></span>
                Culinary Performance
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Highest grossing menu items</p>
            </div>
            <button className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-80 w-full flex flex-col md:flex-row items-center justify-center relative z-10 gap-4 mt-6">
            
            {/* Chart Container */}
            <div className="w-full md:w-1/2 h-[240px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topItems}
                    dataKey="quantitySold"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={75}
                    stroke="none"
                    paddingAngle={6}
                    labelLine={false}
                  >
                    {data.topItems.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]} 
                        className="hover:opacity-80 transition-opacity outline-none cursor-pointer" 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)" }}
                    itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: "14px" }}
                    formatter={(value: any, name: any, props: any) => [`${value} units (₹${props.payload.revenueGenerated.toLocaleString()})`, String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Circle Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-serif font-bold text-white">{data.topItems.length}</span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Top Dishes</span>
              </div>
            </div>
            
            {/* Legend / List */}
            <div className="w-full md:w-1/2 flex flex-col gap-3 overflow-y-auto max-h-[260px] pr-2 custom-scrollbar">
              {data.topItems.map((item, idx) => (
                <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800 transition-all cursor-default group/item shadow-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length], boxShadow: `0 0 12px ${PIE_COLORS[idx % PIE_COLORS.length]}60` }}></span>
                    <span className="text-neutral-300 text-sm font-medium truncate max-w-[140px] group-hover/item:text-white transition-colors" title={item._id}>{item._id}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-mono text-xs font-bold">{item.quantitySold}</p>
                    <p className="text-neutral-500 text-[10px] uppercase">Orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* AI Sales Forecast */}
      {data.forecasts && (
        <div className="bg-neutral-900/70 backdrop-blur-3xl p-8 rounded-[2rem] border border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] transition-transform duration-1000 group-hover:scale-125 pointer-events-none -z-10"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                AI Sales Forecast
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Predicted revenue for the next 7 days based on historical trends</p>
            </div>
            <div className="p-2 rounded-lg bg-neutral-800 text-purple-400 border border-purple-500/30">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.forecasts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                <XAxis dataKey="date" stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {weekday: 'short', day: 'numeric'})} />
                <YAxis stroke="#525252" tick={{ fill: "#a3a3a3", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} dx={-10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(10,10,10,0.9)", backdropFilter: "blur(10px)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "16px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.7)" }}
                  itemStyle={{ color: "#a855f7", fontWeight: "bold", fontSize: "14px" }}
                  labelStyle={{ color: "#a3a3a3", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Predicted Revenue"]}
                />
                <Line type="monotone" dataKey="predictedRevenue" stroke="#a855f7" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 6, fill: "#a855f7", stroke: "#000", strokeWidth: 3 }} activeDot={{ r: 8, fill: "#a855f7", stroke: "#000", strokeWidth: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
