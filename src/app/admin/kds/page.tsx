"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import {
  CheckCircle2,
  Flame,
  Clock,
  ChefHat,
  Coffee,
  Pizza,
  LayoutGrid,
  Volume2,
  VolumeX,
  Bell,
  Utensils,
  ShoppingBag,
  Bike,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
  RefreshCw,
  Wine
} from "lucide-react";

type OrderItem = {
  _id: string;
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  options: any[];
  addons: any[];
  station: string;
  itemStatus: string;
  estimatedPrepTime: number;
  prepStartTime: string | null;
};

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  items: OrderItem[];
  status: string;
  createdAt: string;
  notes?: string;
  deliverySlot?: string;
};

const STATIONS = ["All", "Main Kitchen", "Tandoor", "Chinese", "Bakery", "Beverage", "Dessert"];

// ── Web Audio API Kitchen Bell Sound Synthesizer ──
function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First ding (higher frequency bell)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.85);

    // Second resonant chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(1318.5, now + 0.12); // E6
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 1.25);
  } catch {
    // browser audio policies handled gracefully
  }
}

export default function KDSPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedItems, setCompletedItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [activeStation, setActiveStation] = useState("All");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Live timer tick every 5 seconds for responsive elapsed time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/kds/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load active kitchen orders");
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();

    const socket: Socket = io(API_BASE_URL, { withCredentials: true });

    socket.on("connect", () => {
      setIsLive(true);
    });

    socket.on("disconnect", () => setIsLive(false));

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [...prev, newOrder].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      if (audioEnabled) {
        playKitchenChime();
      }
    });

    socket.on("order_status_updated", (updatedOrder: Order) => {
      setOrders((prev) => {
        if (["Delivered", "Cancelled"].includes(updatedOrder.status)) {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });
    });

    socket.on("order_item_updated", (data: { orderId: string; itemId: string; status: string }) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order._id !== data.orderId) return order;
          return {
            ...order,
            items: order.items.map((item) => {
              if (item._id !== data.itemId && item.itemId !== data.itemId) return item;
              return {
                ...item,
                itemStatus: data.status,
                prepStartTime:
                  data.status === "Preparing" && !item.prepStartTime
                    ? new Date().toISOString()
                    : item.prepStartTime,
              };
            }),
          };
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token, audioEnabled, fetchOrders]);

  const updateItemStatus = async (
    orderId: string,
    itemId: string,
    status: string,
    itemPayload?: any
  ) => {
    try {
      // Optimistic update
      if (status === "Delivered") {
        if (itemPayload) {
          setCompletedItems((prev) => [
            { ...itemPayload, itemStatus: "Delivered", completedAt: new Date().toISOString() },
            ...prev.slice(0, 19),
          ]);
        }
        setOrders((prev) =>
          prev.map((order) => {
            if (order._id !== orderId) return order;
            return {
              ...order,
              items: order.items.map((item) =>
                item._id === itemId || item.itemId === itemId
                  ? { ...item, itemStatus: "Delivered" }
                  : item
              ),
            };
          })
        );
      } else {
        setOrders((prev) =>
          prev.map((order) => {
            if (order._id !== orderId) return order;
            return {
              ...order,
              items: order.items.map((item) =>
                item._id === itemId || item.itemId === itemId
                  ? {
                      ...item,
                      itemStatus: status,
                      prepStartTime:
                        status === "Preparing" && !item.prepStartTime
                          ? new Date().toISOString()
                          : item.prepStartTime,
                    }
                  : item
              ),
            };
          })
        );
      }

      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: status === "Delivered" ? "Ready" : status }),
      });

      // If marking as delivered, also update the whole order if all items done
      if (status === "Delivered") {
        await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Delivered" }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  const getStationIcon = (station: string) => {
    switch (station) {
      case "Tandoor":
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case "Bakery":
        return <Pizza className="w-3.5 h-3.5 text-amber-400" />;
      case "Beverage":
        return <Coffee className="w-3.5 h-3.5 text-cyan-400" />;
      case "Main Kitchen":
        return <ChefHat className="w-3.5 h-3.5 text-rose-400" />;
      case "Dessert":
        return <Wine className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  // Helper to extract Dine-In / Takeaway / Delivery info
  const getOrderTypeInfo = (order: Order) => {
    const rawNotes = (order.notes || "").toLowerCase();
    const slot = (order.deliverySlot || "").toLowerCase();
    const addr = (order.customer?.address || "").toLowerCase();

    if (rawNotes.includes("table") || slot.includes("table") || addr.includes("table")) {
      const match = (order.notes + " " + order.deliverySlot + " " + order.customer?.address).match(
        /table\s*#?\s*([0-9A-Za-z]+)/i
      );
      const tableNum = match ? match[1] : "4";
      return { type: "Dine-In", label: `Table #${tableNum}`, icon: Utensils, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    }

    if (rawNotes.includes("pickup") || rawNotes.includes("takeaway") || slot.includes("pickup")) {
      return { type: "Takeaway", label: "Takeaway / Pickup", icon: ShoppingBag, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" };
    }

    return { type: "Delivery", label: "Express Delivery", icon: Bike, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  };

  // Flatten items for selected station
  const allStationItems = useMemo(() => {
    return orders.flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderTime: order.createdAt,
        notes: order.notes,
        customer: order.customer,
        orderType: getOrderTypeInfo(order),
      }))
    );
  }, [orders]);

  // Compute active item counts per station for Station Category Filter counters
  const stationCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    STATIONS.forEach((s) => (counts[s] = 0));

    allStationItems.forEach((item) => {
      if (item.itemStatus !== "Delivered") {
        counts.All = (counts.All || 0) + 1;
        const st = item.station || "Main Kitchen";
        counts[st] = (counts[st] || 0) + 1;
      }
    });

    return counts;
  }, [allStationItems]);

  const filteredItems = useMemo(() => {
    return allStationItems.filter(
      (item) => activeStation === "All" || item.station === activeStation
    );
  }, [allStationItems, activeStation]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-neutral-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <p className="font-serif text-sm">Initializing Smart KDS Engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-3xl">
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-[1700px] mx-auto w-full space-y-4">
      {/* ── HEADER & STATION SELECTOR WITH LIVE COUNTERS ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-neutral-800 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              VELORA KDS 2.0
            </span>
            {isLive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live WebSocket Sync
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-mono font-bold text-neutral-400">
                Polling
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1.5">
            Smart Kitchen Display System
          </h1>
        </div>

        {/* Station Tabs + Audio Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Station Category Tabs with live counters */}
          <div className="flex overflow-x-auto gap-1.5 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-1.5 rounded-2xl shadow-inner custom-scrollbar">
            {STATIONS.map((station) => {
              const isSel = activeStation === station;
              const count = stationCounts[station] || 0;

              return (
                <button
                  key={station}
                  onClick={() => setActiveStation(station)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSel
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  {getStationIcon(station)}
                  <span>{station}</span>
                  <span
                    className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isSel ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kitchen Bell Audio Test / Toggle */}
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playKitchenChime();
            }}
            title={audioEnabled ? "Audio Chime Enabled" : "Audio Muted"}
            className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold ${
              audioEnabled
                ? "bg-neutral-900 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? "Chime ON" : "Muted"}</span>
          </button>

          <button
            onClick={() => {
              playKitchenChime();
            }}
            title="Test Kitchen Bell Chime"
            className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-300 transition"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 4-COLUMN RESPONSIVE FULL-WIDTH KDS GRID ── */}
      <div className="flex-1 w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-5 h-full w-full">
          {["Pending", "Preparing", "Ready", "Served"].map((colStatus) => {
            let colItems = [];

            if (colStatus === "Served") {
              colItems = [
                ...filteredItems.filter((i) => (i.itemStatus || "") === "Delivered"),
                ...completedItems.filter(
                  (i) => activeStation === "All" || i.station === activeStation
                ),
              ];
            } else {
              colItems = filteredItems.filter(
                (i) => (i.itemStatus || "Pending") === colStatus
              );
            }

            // Column theme styling
            const colTheme = {
              Pending: {
                border: "border-sky-500/30",
                badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
                bar: "bg-sky-500",
              },
              Preparing: {
                border: "border-amber-500/30",
                badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
                bar: "bg-amber-500",
              },
              Ready: {
                border: "border-emerald-500/30",
                badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                bar: "bg-emerald-500",
              },
              Served: {
                border: "border-neutral-700/50",
                badge: "bg-neutral-800 text-neutral-400 border-neutral-700",
                bar: "bg-neutral-600",
              },
            }[colStatus];

            return (
              <div
                key={colStatus}
                className={`bg-neutral-900/50 backdrop-blur-2xl rounded-3xl border ${colTheme?.border} flex flex-col h-full overflow-hidden shadow-2xl relative`}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/70 flex items-center justify-between relative z-10 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${colTheme?.bar}`} />
                    <span className="text-white font-serif font-bold text-base tracking-wide">
                      {colStatus === "Served" ? "Served / Done" : colStatus}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${colTheme?.badge}`}
                  >
                    {colItems.length}
                  </span>
                </div>

                {/* Column Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 custom-scrollbar relative z-10">
                  {colItems.map((item, idx) => {
                    // Compute Elapsed Time
                    const orderTimestamp = new Date(item.orderTime || item.createdAt).getTime();
                    const totalElapsedMins = Math.max(
                      0,
                      Math.floor((currentTime - orderTimestamp) / 60000)
                    );

                    // Compute Prep Phase Elapsed Time
                    let prepElapsedMins = 0;
                    if (item.prepStartTime) {
                      prepElapsedMins = Math.max(
                        0,
                        Math.floor((currentTime - new Date(item.prepStartTime).getTime()) / 60000)
                      );
                    }

                    const targetPrep = item.estimatedPrepTime || 15;
                    const isOverdue =
                      colStatus !== "Served" &&
                      (colStatus === "Preparing"
                        ? prepElapsedMins > targetPrep
                        : totalElapsedMins > targetPrep + 5);

                    const orderType = item.orderType || {
                      type: "Dine-In",
                      label: "Table #4",
                      icon: Utensils,
                      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
                    };
                    const OrderIcon = orderType.icon;

                    return (
                      <div
                        key={`${item._id || item.itemId}-${idx}`}
                        className={`p-4 rounded-2xl border transition-all duration-300 shadow-xl relative ${
                          isOverdue
                            ? "bg-rose-950/40 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                            : "bg-neutral-900/90 border-neutral-800/90 hover:border-amber-500/40"
                        }`}
                      >
                        {/* Overdue Alert Banner */}
                        {isOverdue && (
                          <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-500 text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-between shadow-md animate-pulse">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
                              LATE / OVERDUE ALERT (+{Math.max(0, (colStatus === "Preparing" ? prepElapsedMins : totalElapsedMins) - targetPrep)}m)
                            </span>
                            <span className="font-mono">EXPEDITE</span>
                          </div>
                        )}

                        {/* Card Top: Order Number & Type Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <span className="font-mono font-black text-amber-400 text-sm block">
                              {item.orderNumber}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-bold block">
                              {item.customer?.name || "Patron"}
                            </span>
                          </div>

                          {/* Order Type Badge (Dine-in / Takeaway / Delivery) */}
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${orderType.color}`}
                          >
                            <OrderIcon className="w-3 h-3" />
                            <span>{orderType.label}</span>
                          </span>
                        </div>

                        {/* Station & Timers Row */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-neutral-950/60 px-3 py-1.5 rounded-xl border border-neutral-800/60 mb-3">
                          <span className="flex items-center gap-1 text-neutral-300 font-bold">
                            {getStationIcon(item.station)}
                            <span>{item.station || "Main Kitchen"}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <span>Target: {targetPrep}m</span>
                            <span>•</span>
                            <span
                              className={`font-bold ${
                                isOverdue ? "text-rose-400" : "text-amber-400"
                              }`}
                            >
                              ⏳ {totalElapsedMins}m ago
                            </span>
                          </div>
                        </div>

                        {/* Dish Details */}
                        <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 mb-3">
                          <div className="flex items-start gap-2.5">
                            <span className="font-black text-black bg-amber-400 px-2 py-0.5 rounded-md text-xs font-mono shrink-0 shadow-sm">
                              {item.quantity}x
                            </span>
                            <div className="flex-1">
                              <span className="text-white font-bold text-sm block leading-snug">
                                {item.name}
                              </span>

                              {/* Addons / Options */}
                              {item.addons && item.addons.length > 0 && (
                                <span className="block text-[11px] text-amber-300/90 font-medium italic mt-1">
                                  + {item.addons.map((a: any) => a.name).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Kitchen Notes / Customizations Callout */}
                        {item.notes && (
                          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-0.5">
                            <span className="font-bold uppercase tracking-wider text-[9px] text-amber-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Special Kitchen Instructions:
                            </span>
                            <p className="text-neutral-200 text-[11px]">{item.notes}</p>
                          </div>
                        )}

                        {/* Action Bump Buttons per Column */}
                        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                          {colStatus === "Pending" && (
                            <button
                              onClick={() =>
                                updateItemStatus(
                                  item.orderId,
                                  item._id || item.itemId,
                                  "Preparing",
                                  item
                                )
                              }
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <ChefHat className="w-4 h-4" />
                              <span>Start Prep</span>
                            </button>
                          )}

                          {colStatus === "Preparing" && (
                            <button
                              onClick={() =>
                                updateItemStatus(
                                  item.orderId,
                                  item._id || item.itemId,
                                  "Ready",
                                  item
                                )
                              }
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark Ready</span>
                            </button>
                          )}

                          {colStatus === "Ready" && (
                            <button
                              onClick={() =>
                                updateItemStatus(
                                  item.orderId,
                                  item._id || item.itemId,
                                  "Delivered",
                                  item
                                )
                              }
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Serve / Complete Order</span>
                            </button>
                          )}

                          {colStatus === "Served" && (
                            <div className="w-full py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Delivered to Guest</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Queue State */}
                  {colItems.length === 0 && (
                    <div className="h-48 flex flex-col items-center justify-center text-neutral-500 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-full border border-neutral-800 bg-neutral-950/60 flex items-center justify-center shadow-inner">
                        <CheckCircle2 className="w-6 h-6 text-neutral-600" />
                      </div>
                      <span className="font-bold uppercase tracking-wider text-[11px]">
                        Queue Clear
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
