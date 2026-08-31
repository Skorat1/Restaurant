"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  MapPin,
  Utensils,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  Search,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Phone,
  AlertCircle,
  CheckCircle2,
  Truck,
  Flame,
  ChefHat,
  X,
  FileText,
  Sparkles,
  Calendar
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/components/CartContext";
import API_BASE_URL from "@/lib/api";

interface OrderItem {
  _id?: string;
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: Array<{ name: string; price: number }>;
  options?: Array<{ name: string; choice: string }>;
  itemStatus?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
  deliverySlot?: string;
  estimatedPrepTime?: number;
  prepStartTime?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
    address?: {
      street?: string;
      city?: string;
      pincode?: string;
      state?: string;
    };
  };
  notes?: string;
}

const STATUS_STEPS = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function MyOrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchMyOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching my orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        setLoading(false);
      } else {
        fetchMyOrders();
      }
    }
  }, [authLoading, token, fetchMyOrders]);

  // Re-order items into cart
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((it) => {
      addItem({
        itemId: it.itemId || it._id || `item-${Date.now()}`,
        name: it.name,
        price: it.price,
        image: it.image || "",
        category: "Main Course",
      });
    });
    showToast(`Added ${order.items.length} item(s) from order #${order.orderNumber} to your bag!`);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status Filter
      if (activeFilter === "active") {
        if (["Delivered", "Cancelled"].includes(ord.status)) return false;
      } else if (activeFilter === "completed") {
        if (ord.status !== "Delivered") return false;
      } else if (activeFilter === "cancelled") {
        if (ord.status !== "Cancelled") return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNumber = ord.orderNumber?.toLowerCase().includes(q);
        const matchesItems = ord.items?.some((i) => i.name?.toLowerCase().includes(q));
        const matchesTotal = ord.total?.toString().includes(q);
        return matchesNumber || matchesItems || matchesTotal;
      }

      return true;
    });
  }, [orders, activeFilter, searchQuery]);

  // If user is not logged in
  if (!authLoading && !token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="card-glass max-w-md w-full p-8 sm:p-10 rounded-3xl border-amber-500/30 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-serif font-bold text-white">Sign In to View Orders</h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Please log in to your VELORA VIP account to track your active orders and dining history.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login?redirect=/my-orders"
              className="btn-primary py-3.5 text-xs font-bold uppercase tracking-widest text-center"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/menu"
              className="text-xs text-neutral-400 hover:text-amber-400 transition"
            >
              ← Explore Culinary Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-neutral-100 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Patron Portal
            </span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-white font-bold tracking-tight">
            My Orders &amp; Delivery
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Track active gourmet deliveries, review past culinary selections, and reorder favorites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyOrders}
            disabled={loading}
            title="Refresh Orders"
            className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 rounded-2xl text-neutral-400 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
          <Link
            href="/menu"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition"
          >
            <Utensils className="w-4 h-4" />
            <span>Order Food</span>
          </Link>
        </div>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
            {[
              { id: "all", label: "All Orders", count: orders.length },
              {
                id: "active",
                label: "Live & Active",
                count: orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length,
              },
              {
                id: "completed",
                label: "Completed",
                count: orders.filter((o) => o.status === "Delivered").length,
              },
              {
                id: "cancelled",
                label: "Cancelled",
                count: orders.filter((o) => o.status === "Cancelled").length,
              },
            ].map((tab) => {
              const isSel = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isSel
                      ? "bg-amber-500 text-black shadow-md"
                      : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isSel ? "bg-black/20 text-black font-bold" : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, dish name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ── ORDERS LIST ── */}
      {loading ? (
        <div className="py-24 text-center rounded-3xl border border-neutral-800 bg-neutral-900/60 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
          <p className="text-sm font-semibold text-neutral-300">Loading your dining orders…</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-800/80 border border-neutral-700 text-neutral-500 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {orders.length === 0
                ? "You haven't placed any culinary orders yet. Explore our chef's tasting menu to place your first order."
                : "No orders match your current filter or search criteria."}
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu &amp; Order Now</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isLive = !["Delivered", "Cancelled"].includes(order.status);
            const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeFormatted = new Date(order.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Progress Step Index
            let currentStepIdx = 0;
            if (order.status === "Confirmed") currentStepIdx = 1;
            else if (order.status === "Preparing" || order.status === "Ready") currentStepIdx = 2;
            else if (order.status === "Out for Delivery") currentStepIdx = 3;
            else if (order.status === "Delivered") currentStepIdx = 4;

            return (
              <div
                key={order._id}
                className={`rounded-3xl border transition shadow-xl overflow-hidden ${
                  isLive
                    ? "bg-neutral-900/90 border-amber-500/40 shadow-amber-500/5"
                    : "bg-neutral-900/60 border-neutral-800"
                }`}
              >
                {/* Top Order Card Bar */}
                <div className="px-6 py-4 bg-neutral-950/80 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(order.orderNumber, order._id)}
                          title="Copy Order #"
                          className="p-1 rounded-md text-neutral-400 hover:text-white transition"
                        >
                          {copiedId === order._id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Placed on {dateFormatted} at {timeFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        order.status === "Delivered"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : order.status === "Cancelled"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : order.status === "Out for Delivery"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse"
                          : order.status === "Preparing"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                          : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                      }`}
                    >
                      {order.status === "Delivered" && <Check className="w-3.5 h-3.5" />}
                      {order.status === "Preparing" && <ChefHat className="w-3.5 h-3.5" />}
                      {order.status === "Out for Delivery" && <Truck className="w-3.5 h-3.5" />}
                      <span>{order.status}</span>
                    </span>

                    <span className="font-serif font-bold text-white text-base">
                      ₹{order.total?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Live Progress Bar if active */}
                {isLive && (
                  <div className="px-6 py-5 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-neutral-800/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-400 mb-2">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                        Live Kitchen Status: {order.status}
                      </span>
                      {order.estimatedPrepTime && (
                        <span>Est. Delivery: ~{order.estimatedPrepTime} mins</span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2 relative">
                      {["Order Placed", "Confirmed", "Preparing", "On the Way", "Delivered"].map(
                        (stepName, i) => {
                          const isDone = i <= currentStepIdx;
                          const isCurrent = i === currentStepIdx;
                          return (
                            <div key={stepName} className="space-y-1">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isDone
                                    ? "bg-amber-400 shadow-md shadow-amber-500/30"
                                    : "bg-neutral-800"
                                } ${isCurrent ? "animate-pulse" : ""}`}
                              />
                              <p
                                className={`text-[10px] text-center truncate ${
                                  isDone ? "text-amber-300 font-bold" : "text-neutral-500"
                                }`}
                              >
                                {stepName}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Dishes List */}
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                      Dishes Ordered ({order.items?.length || 0})
                    </span>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-neutral-800 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.quantity}x
                            </div>
                            <div>
                              <p className="font-bold text-white">{item.name}</p>
                              {item.addons && item.addons.length > 0 && (
                                <p className="text-[10px] text-neutral-400">
                                  + {item.addons.map((a) => a.name).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-amber-300">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Col: Details & Actions */}
                  <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 space-y-4 flex flex-col justify-between text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between text-neutral-400">
                        <span>Payment Method:</span>
                        <span className="text-white font-semibold uppercase">{order.paymentMethod}</span>
                      </div>
                      {order.deliverySlot && (
                        <div className="flex justify-between text-neutral-400">
                          <span>Delivery Slot:</span>
                          <span className="text-amber-400 font-semibold">{order.deliverySlot}</span>
                        </div>
                      )}
                      {order.customer?.address?.street && (
                        <div className="text-neutral-400 text-[11px] pt-1 border-t border-neutral-800">
                          <span className="block text-neutral-500 uppercase text-[9px]">Delivery Address:</span>
                          <p className="text-neutral-300 truncate">
                            {order.customer.address.street}, {order.customer.address.city}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs transition border border-neutral-800 flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Receipt</span>
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ORDER RECEIPT MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-5 border-b border-neutral-800 space-y-1">
              <h2 className="font-serif text-2xl font-bold text-amber-400 tracking-widest">VELORA</h2>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Haute Gastronomy Dining Receipt</p>
              <p className="text-xs font-mono font-bold text-white mt-2">{selectedOrder.orderNumber}</p>
            </div>

            {/* Receipt Body */}
            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-neutral-400 border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Date</span>
                  <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Status</span>
                  <span className="text-amber-400 font-bold">{selectedOrder.status}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Ordered Items</span>
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-mono font-bold">₹{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-neutral-800 space-y-1.5 text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-white font-mono">₹{selectedOrder.subtotal?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="text-white font-mono">₹{selectedOrder.deliveryFee?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes &amp; Fees:</span>
                  <span className="text-white font-mono">₹{selectedOrder.tax?.toFixed(2) || "0.00"}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Total Amount:</span>
                  <span className="text-amber-400 font-mono">₹{selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="pt-4 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
