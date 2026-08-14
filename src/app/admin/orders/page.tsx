"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Truck, Package, XCircle, AlertCircle, ShoppingBag
} from "lucide-react";

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string; address?: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const { token, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [working, setWorking] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("Please log in with Admin credentials to access orders.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : []);
          setError("");
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.msg || "Failed to load orders.");
        }
      } catch {
        setError("Unable to reach the server.");
      }
    };

    if (!loading) fetchOrders();
  }, [token, loading]);

  const updateStatus = async (id: string, status: string) => {
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.order ?? data;
        setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to update status.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order record permanently?")) return;
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  // Filter & Search Logic
  const filtered = orders.filter((o) => {
    const matchesStatus = filter === "All" || o.status === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q);
    return matchesStatus && matchesQuery;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border";
    switch (status) {
      case "Delivered": return `${base} bg-emerald-500/15 border-emerald-500/30 text-emerald-300`;
      case "Cancelled": return `${base} bg-red-500/15 border-red-500/30 text-red-300`;
      case "Out for Delivery": return `${base} bg-sky-500/15 border-sky-500/30 text-sky-300`;
      case "Preparing": case "Ready": return `${base} bg-orange-500/15 border-orange-500/30 text-orange-300`;
      default: return `${base} bg-amber-500/15 border-amber-500/30 text-amber-300`;
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
    <div className="space-y-6 pb-12">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Operations Queue
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Online Order Management</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Live order tracking, status stepping, and kitchen queue management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-mono font-bold">
            Total Orders: {orders.length}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-sm text-red-200 flex items-center justify-between gap-4">
          <p className="font-semibold text-xs sm:text-sm">{error}</p>
          <a href="/login" className="px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold shrink-0">Log In</a>
        </div>
      )}

      {/* ── SEARCH & FILTER BAR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl shadow-lg">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, guest name, email, or phone..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {["All", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === s
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1 opacity-70">
                  ({orders.filter((o) => o.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ORDERS LIST ────────────────────────────────────────────────── */}
      {paginatedOrders.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-neutral-600" />
          <p className="text-sm font-semibold">No matching orders found.</p>
          <p className="text-xs text-neutral-500">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div key={order._id} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 transition hover:border-amber-500/40 shadow-xl space-y-4">
              
              {/* Top Row: Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-mono font-bold text-white tracking-wider">{order.orderNumber}</span>
                  <span className={statusBadge(order.status)}>{order.status}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {order.paymentMethod} · {order.paymentStatus || "Paid"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </div>

              {/* Middle Row: Customer Info & Items */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Customer Details</p>
                  <p className="text-white font-bold text-sm">{order.customer?.name}</p>
                  <p className="text-neutral-300">{order.customer?.email}</p>
                  {order.customer?.phone && <p className="text-neutral-400">📞 {order.customer.phone}</p>}
                  {order.customer?.address && <p className="text-neutral-400 mt-1">📍 {order.customer.address}</p>}
                </div>

                <div className="space-y-1.5 bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Order Items ({order.items.length})</p>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-300">
                        <span><strong className="text-amber-400">{item.quantity}x</strong> {item.name}</span>
                        <span className="font-mono text-neutral-400">₹{(item.price * item.quantity * 80).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-sm">
                    <span className="text-neutral-300">Total Bill Amount:</span>
                    <span className="text-amber-400">₹{(order.total * 80).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Quick Status Stepper & Delete */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 mr-2">Quick Status Step:</span>
                  {["Preparing", "Out for Delivery", "Delivered", "Cancelled"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={working === order._id || order.status === st}
                      onClick={() => updateStatus(order._id, st)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                        order.status === st
                          ? "bg-amber-500 text-black font-extrabold shadow-md"
                          : "bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => deleteOrder(order._id)}
                  disabled={working === order._id}
                  className="px-4 py-1.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition"
                >
                  Delete Order
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION CONTROLS ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs">
          <span className="text-neutral-400 font-medium">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

