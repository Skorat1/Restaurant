"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import io from "socket.io-client";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Truck, Package, XCircle, AlertCircle, ShoppingBag,
  Plus, Printer, Calendar, Banknote, LayoutDashboard, Filter, Check
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
  const [dateFilter, setDateFilter] = useState("Today");
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [working, setWorking] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLive, setIsLive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  }, []);

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

  useEffect(() => {
    if (!loading) fetchOrders();
  }, [token, loading]);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE_URL, {
      auth: { token }
    });

    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    });

    socket.on("order_status_updated", ({ orderId, status }: { orderId: string; status: string }) => {
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

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

  // Quick Print Action
  const printOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 14px; width: 300px; }
            h2, h3 { text-align: center; margin: 5px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .notes { margin-top: 10px; font-weight: bold; border: 1px solid #000; padding: 5px; }
          </style>
        </head>
        <body>
          <h2>VELORA HAUTE CUISINE</h2>
          <h3>KITCHEN ORDER TICKET</h3>
          <div class="divider"></div>
          <div>Order: <strong>${order.orderNumber}</strong></div>
          <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
          <div>Type: ${order.customer?.address === 'Pickup' ? 'Pickup' : 'Delivery'}</div>
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item">
              <span>${i.quantity}x ${i.name}</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          ${order.notes ? `<div class="notes">Notes: ${order.notes}</div>` : ''}
          <div style="text-align:center; margin-top: 20px;">
             <strong>TOTAL: $${order.total.toFixed(2)}</strong>
          </div>
          <script>
            window.print();
            window.setTimeout(function(){ window.close(); }, 500);
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleManualOrder = () => {
    alert("Manual Order Flow will open here."); // Placeholder for next implementation
  };

  // Filter & Search Logic
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const filtered = orders.filter((o) => {
    // Status Filter
    const matchesStatus = filter === "All" || o.status === filter;
    
    // Type Filter (Mocked using address field for now)
    const type = o.customer?.address === "Pickup" ? "Pickup" : "Delivery";
    const matchesType = typeFilter === "All" || type === typeFilter;

    // Date Filter
    const orderDate = new Date(o.createdAt);
    let matchesDate = true;
    if (dateFilter === "Today") matchesDate = orderDate >= todayStart;
    else if (dateFilter === "Yesterday") matchesDate = orderDate >= yesterdayStart && orderDate < todayStart;

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q);

    return matchesStatus && matchesType && matchesDate && matchesQuery;
  });

  // Calculate Quick Stats (Today)
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const pendingCount = todayOrders.filter(o => ["Pending", "Confirmed", "Preparing"].includes(o.status)).length;
  const todayRevenue = todayOrders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);

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
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Operations Queue
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Sync
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Online Order Management</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Live order tracking, status stepping, and kitchen queue management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleManualOrder} className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-sm text-red-200 flex items-center justify-between gap-4">
          <p className="font-semibold text-xs sm:text-sm">{error}</p>
          <a href="/login" className="px-4 py-2 rounded-full bg-amber-500 text-black text-xs font-bold shrink-0">Log In</a>
        </div>
      )}

      {/* ── QUICK STATS SUMMARY CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Today's Orders</p>
            <p className="text-2xl font-black text-white mt-1">{todayOrders.length}</p>
          </div>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Pending / Prep</p>
            <p className="text-2xl font-black text-white mt-1">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-black text-white mt-1">${todayRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & ADVANCED FILTERS ──────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl shadow-lg">
        {/* Search input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, guest name, email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-neutral-300 font-bold outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-neutral-300 font-bold outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Delivery">Delivery</option>
              <option value="Pickup">Pickup</option>
            </select>
          </div>

          {/* Status Dropdown (Mobile) & Pills (Desktop) */}
          <div className="flex items-center">
            <div className="sm:hidden flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-1.5 w-full">
              <Check className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={filter}
                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-xs text-neutral-300 font-bold outline-none cursor-pointer w-full"
              >
                {["All", ...STATUSES].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
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
                </button>
              ))}
            </div>
          </div>
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
            <div key={order._id} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 transition hover:border-amber-500/40 shadow-xl space-y-4 relative">
              
              {/* Print Button */}
              <button 
                onClick={() => printOrder(order)}
                className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-amber-400 transition"
                title="Print KOT/Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Top Row: Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4 pr-10">
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

              {/* Middle Row: Customer Info & Order Details */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Customer Details</h4>
                  <div className="rounded-2xl bg-neutral-950/50 border border-neutral-800 p-4 space-y-2">
                    <p className="text-sm font-bold text-white">{order.customer.name}</p>
                    <p className="text-xs text-neutral-400">{order.customer.email}</p>
                    {order.customer.phone && <p className="text-xs text-neutral-400">{order.customer.phone}</p>}
                    {order.customer.address && (
                      <p className="text-xs text-neutral-400 flex items-start gap-1.5 mt-2">
                        <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span className="leading-tight">{order.customer.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Order Items</h4>
                  <div className="rounded-2xl bg-neutral-950/50 border border-neutral-800 p-4">
                    <ul className="space-y-2.5 max-h-[120px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-700">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between gap-3 text-xs">
                          <span className="font-semibold text-neutral-200">
                            <span className="text-amber-400 mr-2">{item.quantity}x</span>
                            {item.name}
                          </span>
                          <span className="text-neutral-400 font-mono whitespace-nowrap">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {order.notes && (
                      <div className="mt-3 pt-3 border-t border-neutral-800/80">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Order Notes:</p>
                        <p className="text-xs text-neutral-300 italic">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Financials & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-neutral-800/80">
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Subtotal</p>
                    <p className="text-sm font-mono text-neutral-300">${order.subtotal?.toFixed(2)}</p>
                  </div>
                  {order.discount > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-emerald-500 font-bold tracking-wider">Discount</p>
                      <p className="text-sm font-mono text-emerald-400">-${order.discount.toFixed(2)}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Tax & Fees</p>
                    <p className="text-sm font-mono text-neutral-300">
                      ${((order.tax || 0) + (order.deliveryFee || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1 border-l pl-6 border-neutral-800">
                    <p className="text-[10px] uppercase text-amber-500 font-bold tracking-wider">Total Paid</p>
                    <p className="text-lg font-mono font-bold text-amber-400">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                  <select
                    className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition"
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={working === order._id}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    disabled={working === order._id}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition"
                    title="Delete Order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-neutral-800/50">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-400 font-mono">
            PAGE {currentPage} OF {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
