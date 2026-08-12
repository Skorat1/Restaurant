"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, Clock, CheckCircle2, Utensils, Truck, Package,
  ShieldCheck, PhoneCall, ChevronRight, AlertTriangle, Lock,
  Navigation, MapPin, Compass, Shield
} from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

import { io } from "socket.io-client";

interface OrderStatusData {
  _id: string;
  orderNumber?: string;
  customer?: { name: string; email: string; address?: string };
  status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Cancelled";
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  total?: number;
  createdAt: string;
}

export default function TrackPage() {
  const { token, user, loading } = useAuth();
  const [orderId, setOrderId] = useState("");
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<OrderStatusData | null>(null);
  const [myOrders, setMyOrders] = useState<OrderStatusData[]>([]);
  const [error, setError] = useState("");

  // Live GPS Animation State
  const [gpsProgress, setGpsProgress] = useState(65); // percentage along route

  useEffect(() => {
    const interval = setInterval(() => {
      setGpsProgress((prev) => (prev >= 95 ? 20 : prev + 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Socket.io real-time listener for current tracked order
  useEffect(() => {
    if (!order?._id) return;

    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("join_order", order._id);
    if (order.orderNumber) {
      socket.emit("join_order", order.orderNumber);
    }

    socket.on("order_status_updated", (updatedOrder: OrderStatusData) => {
      setOrder((prev) => (prev && (prev._id === updatedOrder._id || prev.orderNumber === updatedOrder.orderNumber) ? { ...prev, status: updatedOrder.status } : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, [order?._id, order?.orderNumber]);

  // Fetch recent orders for logged-in user for 1-click tracking
  useEffect(() => {
    if (!token) return;
    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMyOrders(data);
        }
      } catch {
        // ignore errors
      }
    };
    fetchMyOrders();
  }, [token]);

  const handleTrackById = async (targetId: string) => {
    if (!targetId.trim()) return;

    if (!token) {
      setError("Please log in to track your personal orders.");
      return;
    }

    setSearching(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.msg || "Order not found or access denied.");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const steps = [
    { label: "Order Placed", icon: CheckCircle2, status: "Pending" },
    { label: "Confirmed", icon: ShieldCheck, status: "Confirmed" },
    { label: "Executive Chef Preparing", icon: Utensils, status: "Preparing" },
    { label: "Dispatched & En Route", icon: Truck, status: "Out for Delivery" },
    { label: "Delivered", icon: Package, status: "Delivered" },
  ];

  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const orderRanks = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered"];
    const currentIdx = orderRanks.indexOf(currentStatus);
    const stepIdx = orderRanks.indexOf(stepStatus);

    if (currentStatus === "Cancelled") return "cancelled";
    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-8">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto mb-10 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-time GPS Order Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
          Track Your <span className="text-amber-400 italic">Culinary Delivery.</span>
        </h1>
        <p className="mt-3 text-neutral-400 text-xs sm:text-base max-w-lg mx-auto">
          Enter your Order ID or select from your recent orders below to inspect real-time kitchen progress and live driver GPS location.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* SEARCH BAR */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrackById(orderId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. 660f1b2c...)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="rounded-2xl bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {searching ? "Searching..." : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick select my orders */}
          {myOrders.length > 0 && !order && (
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Select Recent Order to Track:</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {myOrders.slice(0, 4).map((o) => (
                  <button
                    key={o._id}
                    type="button"
                    onClick={() => {
                      setOrderId(o._id);
                      handleTrackById(o._id);
                    }}
                    className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/80 hover:border-amber-500/40 text-left transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{o.orderNumber || o._id.slice(-8)}</p>
                      <p className="text-[11px] text-amber-400 font-semibold">{o.status}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & LIVE GPS MAP */}
        {order && (
          <div className="space-y-6 animate-fade-up">

            {/* LIVE GPS MAP ROUTE SIMULATOR */}
            <div className="rounded-3xl border border-amber-500/30 bg-neutral-900/90 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-white">Live Driver GPS Map</h2>
                    <p className="text-xs text-amber-400 font-semibold">Driver: Rajesh (Honda City · MH 12 AB 9821)</p>
                  </div>
                </div>

                <a
                  href="tel:+919876543210"
                  className="px-3.5 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>

              {/* Graphic Animated Map Viewport */}
              <div className="w-full h-56 rounded-2xl bg-neutral-950 border border-neutral-800 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
                {/* Background Map Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

                {/* Map Route Line */}
                <div className="absolute top-1/2 left-10 right-10 h-1.5 bg-neutral-800 rounded-full -translate-y-1/2">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${gpsProgress}%` }}
                  />
                </div>

                {/* Kitchen Origin Icon */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center shadow-lg text-sm">
                    🍳
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 mt-1 bg-neutral-900 px-2 py-0.5 rounded-full border border-amber-500/30">
                    L&apos;Étoile Kitchen
                  </span>
                </div>

                {/* Animated Moving Driver Pin */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center z-10"
                  style={{ left: `calc(${gpsProgress}% - 16px)` }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/30 animate-pulse">
                    🛵
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 mt-1 bg-neutral-900 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                    18 Mins Away
                  </span>
                </div>

                {/* Destination Icon */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center justify-center text-sm">
                    🏠
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 mt-1 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                    Your Address
                  </span>
                </div>
              </div>
            </div>

            {/* ORDER STATUS STEPS TIMELINE */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <p className="text-xs text-neutral-400">Order ID: <span className="font-mono text-white">{order._id}</span></p>
                  <h2 className="text-xl font-serif text-white font-bold mt-1">Status: <span className="text-amber-400">{order.status}</span></h2>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 self-start sm:self-auto">
                  Guaranteed Temperature Delivery
                </span>
              </div>

              <div className="space-y-4">
                {steps.map((step) => {
                  const state = getStepStatus(step.status, order.status);
                  const IconComp = step.icon;

                  return (
                    <div key={step.label} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition ${
                        state === "completed"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : state === "active"
                          ? "bg-amber-500 border-amber-400 text-black font-bold animate-pulse"
                          : "bg-neutral-950 border-neutral-800 text-neutral-600"
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${state === "active" ? "text-amber-400 text-sm" : state === "completed" ? "text-white" : "text-neutral-500"}`}>
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
