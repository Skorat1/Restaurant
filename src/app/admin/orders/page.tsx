"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import io from "socket.io-client";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Truck, Package, XCircle, AlertCircle, ShoppingBag,
  Plus, Printer, Calendar, Banknote, LayoutDashboard, Filter, Check,
  CreditCard, Smartphone, DollarSign, SplitSquareHorizontal,
  Download, MapPin, MessageCircle, Phone, Map
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
  prepStartTime?: string;
  estimatedPrepTime?: number;
  cancellationReason?: string;
  payments?: { method: string; amount: number; txId?: string }[];
}

const STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"];

const LiveTimer = ({ startTime, estimatedTime }: { startTime: string, estimatedTime: number }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 60000));
    };
    update();
    const int = setInterval(update, 60000);
    return () => clearInterval(int);
  }, [startTime]);
  
  const isDelayed = elapsed > estimatedTime;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${isDelayed ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-neutral-800/50 border-neutral-700 text-neutral-400'}`}>
      <Clock className="w-3 h-3" />
      {elapsed}m / {estimatedTime}m
    </span>
  );
};

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

  // Bulk & Actions State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [acceptModal, setAcceptModal] = useState<Order | null>(null);
  const [acceptTime, setAcceptTime] = useState<number>(15);
  const [rejectModal, setRejectModal] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Split Bill Modal State
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([{method: 'Cash', amount: 0}]);


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

  const updateStatus = async (id: string, status: string, extraData: any = {}) => {
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, ...extraData }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.order ?? data;
        setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
        
        // Auto Print KOT
        if (status === "Confirmed") {
          printKOT(updated);
        }
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

  const handleBulkUpdate = async (status: string) => {
    if (selectedOrders.length === 0 || !status) return;
    if (!confirm(`Update ${selectedOrders.length} orders to ${status}?`)) return;
    
    setWorking("bulk");
    try {
       await Promise.all(selectedOrders.map(id => 
          fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status })
          })
       ));
       await fetchOrders();
       setSelectedOrders([]);
    } catch(e) {
       alert("Error during bulk update.");
    } finally {
       setWorking("");
    }
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Order Number", "Date", "Customer Name", "Customer Phone", "Type", "Status", "Total"];
    const rows = filtered.map(o => [
      o.orderNumber, 
      new Date(o.createdAt).toLocaleString().replace(/,/g, ''),
      `"${o.customer.name}"`, 
      o.customer.phone || "",
      o.customer.address === "Pickup" ? "Pickup" : "Delivery",
      o.status,
      o.total.toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSettleBill = async () => {
    if (!billingOrder) return;
    
    const totalPaid = splitPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    if (Math.abs(totalPaid - billingOrder.total) > 0.1) {
      alert(`Total paid ($${totalPaid.toFixed(2)}) does not match order total ($${billingOrder.total.toFixed(2)})`);
      return;
    }

    setWorking(billingOrder._id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${billingOrder._id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          status: "Delivered", // Auto deliver on settle
          paymentStatus: "Paid",
          paymentMethod: splitPayments.length > 1 ? "Mixed" : splitPayments[0].method,
          payments: splitPayments 
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.order ?? data;
        setOrders((prev) => prev.map((o) => (o._id === billingOrder._id ? updated : o)));
        setBillingOrder(null);
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to settle bill.");
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
  const printKOT = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 14px; width: 300px; margin: 0 auto; }
            h2, h3 { text-align: center; margin: 5px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .notes { margin-top: 10px; font-weight: bold; border: 1px solid #000; padding: 5px; }
          </style>
        </head>
        <body>
          <h2>VELORA KITCHEN</h2>
          <h3>KOT: ${order.orderNumber}</h3>
          <div class="divider"></div>
          <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
          <div>Type: ${order.customer?.address === 'Pickup' ? 'Pickup' : 'Delivery'}</div>
          ${order.estimatedPrepTime ? `<div>Prep Time: ${order.estimatedPrepTime}m</div>` : ''}
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item">
              <span><strong>${i.quantity}x</strong> ${i.name}</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          ${order.notes ? `<div class="notes">Notes: ${order.notes}</div>` : ''}
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

  const printReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 14px; width: 300px; margin: 0 auto; }
            h2, h3, h4 { text-align: center; margin: 5px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h2>VELORA HAUTE CUISINE</h2>
          <h4>Tax Receipt</h4>
          <div class="divider"></div>
          <div>Order: <strong>${order.orderNumber}</strong></div>
          <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
          <div>Customer: ${order.customer.name}</div>
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item">
              <span>${i.quantity}x ${i.name}</span>
              <span>$${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          <div class="item"><span>Subtotal:</span> <span>$${order.subtotal.toFixed(2)}</span></div>
          ${order.discount > 0 ? `<div class="item"><span>Discount:</span> <span>-$${order.discount.toFixed(2)}</span></div>` : ''}
          <div class="item"><span>Tax & Fees:</span> <span>$${((order.tax || 0) + (order.deliveryFee || 0)).toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="item"><strong>TOTAL PAID:</strong> <strong>$${order.total.toFixed(2)}</strong></div>
          <div class="item"><span>Payment:</span> <span>${order.paymentMethod}</span></div>
          <div class="divider"></div>
          <h4 style="margin-top: 15px;">Thank You!</h4>
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
    <div className="relative min-h-screen w-full font-sans selection:bg-amber-500/30 overflow-hidden text-neutral-200">
      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="fixed inset-0 pointer-events-none flex justify-center items-start z-0">
        <div className="absolute top-[-20%] left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <div className="relative z-10 space-y-8 pb-20 w-full max-w-[1600px] mx-auto">
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-black bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                Operations Queue
              </span>
              {isLive && (
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Sync
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-serif text-white font-bold tracking-tight">Online Orders</h1>
            <p className="mt-2 text-neutral-400 text-sm font-medium">
              Live tracking, status stepping, and kitchen queue management.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleManualOrder} className="group relative flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-amber-950 font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">New Order</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-sm text-red-200 flex items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-red-500/5">
            <p className="font-bold tracking-wide">{error}</p>
            <a href="/login" className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0 transition backdrop-blur-md">Log In</a>
          </div>
        )}

        {/* ── QUICK STATS SUMMARY CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-xl overflow-hidden transition-all hover:bg-white/10 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/30 text-blue-400 shadow-inner">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Today's Orders</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">{todayOrders.length}</p>
            </div>
          </div>
          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-xl overflow-hidden transition-all hover:bg-white/10 hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-orange-500/30 text-orange-400 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Pending / Prep</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">{pendingCount}</p>
            </div>
          </div>
          <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-5 shadow-xl overflow-hidden transition-all hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Banknote className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Today's Revenue</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">${todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* ── SEARCH & ADVANCED FILTERS (STICKY) ─────────────────────────── */}
        <div className="sticky top-4 z-40 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Search input */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, guest name, email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-black/20 text-sm text-white placeholder-neutral-500 outline-none focus:border-amber-500 focus:bg-black/40 transition-all shadow-inner"
            />
          </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-3 py-1.5 animate-fade-in">
              <span className="text-xs text-amber-500 font-bold">{selectedOrders.length} Selected</span>
              <select
                onChange={(e) => handleBulkUpdate(e.target.value)}
                value=""
                className="bg-transparent text-xs text-amber-400 font-bold outline-none cursor-pointer"
              >
                <option value="" disabled>Bulk Update...</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Export Button */}
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl px-3 py-1.5 text-xs text-neutral-300 font-bold transition-all shadow-sm"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl px-3 py-1.5 shadow-inner">
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
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl px-3 py-1.5 shadow-inner">
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
            <div className="sm:hidden flex items-center gap-2 bg-black/20 border border-white/10 rounded-2xl px-3 py-1.5 w-full shadow-inner">
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
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    filter === s
                      ? "bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
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
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center text-neutral-400 space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600 mb-4 opacity-50" />
          <p className="text-lg font-serif text-white">No matching orders found.</p>
          <p className="text-xs text-neutral-500">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {paginatedOrders.map((order) => (
            <div key={order._id} className={`group rounded-3xl border ${selectedOrders.includes(order._id) ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5'} p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(245,158,11,0.15)] hover:bg-white/10 backdrop-blur-xl relative overflow-hidden flex flex-col`}>
              {/* Background ambient glow for cards */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Checkbox */}
              <div className="absolute top-5 left-5">
                <button 
                  onClick={() => setSelectedOrders(prev => prev.includes(order._id) ? prev.filter(id => id !== order._id) : [...prev, order._id])}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition ${selectedOrders.includes(order._id) ? 'bg-amber-500 border-amber-500 text-black' : 'bg-neutral-950 border-neutral-700 text-transparent hover:border-amber-500'}`}
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>

              {/* Actions Button Group */}
              <div className="absolute top-5 right-5 flex gap-2">
                {order.paymentStatus !== "Paid" && order.status !== "Cancelled" && (
                  <button 
                    onClick={() => {
                      setBillingOrder(order);
                      setSplitPayments([{ method: 'Cash', amount: order.total }]);
                    }}
                    className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
                    title="Settle / Split Bill"
                  >
                    <SplitSquareHorizontal className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => printKOT(order)}
                  className="p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-amber-400 transition"
                  title="Print KOT"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => printReceipt(order)}
                  className="p-2 rounded-full bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700 hover:text-amber-400 transition"
                  title="Print Receipt"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>

              {/* Top Row: Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4 pr-24 pl-8">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-mono font-bold text-white tracking-wider">{order.orderNumber}</span>
                  <span className={statusBadge(order.status)}>{order.status}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {order.paymentMethod} · {order.paymentStatus || "Paid"}
                  </span>
                  {["Confirmed", "Preparing", "Ready"].includes(order.status) && (
                    <LiveTimer startTime={order.prepStartTime || order.createdAt} estimatedTime={order.estimatedPrepTime || 15} />
                  )}
                </div>
                <span className="text-xs text-neutral-400 font-mono">
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </div>

              {/* Middle Row: Customer Info & Order Details */}
              <div className="grid sm:grid-cols-2 gap-6 pl-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Customer Details</h4>
                  <div className="rounded-2xl bg-neutral-950/50 border border-neutral-800 p-4 space-y-3">
                    <p className="text-sm font-bold text-white">{order.customer.name}</p>
                    <p className="text-xs text-neutral-400">{order.customer.email}</p>
                    {order.customer.phone && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-neutral-400">{order.customer.phone}</p>
                        <a href={`tel:${order.customer.phone}`} className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" title="Call Customer">
                          <Phone className="w-3 h-3" />
                        </a>
                        <a href={`https://wa.me/${order.customer.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello ${order.customer.name}, your order ${order.orderNumber} is being processed.`)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" title="WhatsApp Customer">
                          <MessageCircle className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {order.customer.address && (
                      <div className="flex items-start gap-2 mt-2">
                        <Truck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span className="text-xs text-neutral-400 leading-tight">{order.customer.address}</span>
                        {order.customer.address !== 'Pickup' && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 shrink-0 -mt-1" title="View on Map">
                            <MapPin className="w-3 h-3" />
                          </a>
                        )}
                      </div>
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
                      <div className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Special Instructions:</p>
                        <p className="text-xs text-yellow-200/90 font-medium">{order.notes}</p>
                      </div>
                    )}
                    {order.cancellationReason && (
                      <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                        <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1"><XCircle className="w-3 h-3"/> Cancel Reason:</p>
                        <p className="text-xs text-red-200/90 font-medium">{order.cancellationReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Financials & Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-neutral-800/80 pl-8">
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
                  {order.status === "Pending" && (
                    <>
                      <button
                        onClick={() => setRejectModal(order)}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setAcceptModal(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-emerald-950 hover:bg-emerald-400 text-xs font-bold transition"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  {order.status !== "Pending" && (
                    <select
                      className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition"
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={working === order._id}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
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

      {/* ── SPLIT BILL MODAL ─────────────────────────────────────────────── */}
      {billingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-serif">Settle Bill</h3>
                  <p className="text-xs text-neutral-400 font-mono">Order: {billingOrder?.orderNumber}</p>
                </div>
              </div>
              <button onClick={() => setBillingOrder(null)} className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-black/20 border border-white/5 shadow-inner">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-xs">Total Amount Due</span>
                <span className="text-2xl font-bold font-serif text-white">${billingOrder?.total?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-white">Payment Methods</h4>
                  <button 
                    onClick={() => {
                      const remaining = Math.max(0, (billingOrder?.total || 0) - splitPayments.reduce((s, p) => s + Number(p.amount), 0));
                      setSplitPayments([...splitPayments, { method: 'Card', amount: remaining }]);
                    }}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Split
                  </button>
                </div>
                
                {splitPayments.map((payment, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <select 
                      value={payment.method}
                      onChange={(e) => {
                        const newPayments = [...splitPayments];
                        newPayments[index].method = e.target.value;
                        setSplitPayments(newPayments);
                      }}
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 shadow-inner"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Gift Card">Gift Card</option>
                    </select>
                    
                    <div className="relative w-1/3">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                      <input 
                        type="number"
                        value={payment.amount || ""}
                        onChange={(e) => {
                          const newPayments = [...splitPayments];
                          newPayments[index].amount = Number(e.target.value);
                          setSplitPayments(newPayments);
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500 shadow-inner"
                      />
                    </div>
                    
                    {splitPayments.length > 1 && (
                      <button 
                        onClick={() => {
                          setSplitPayments(splitPayments.filter((_, i) => i !== index));
                        }}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-400">Total Allocated:</span>
                  <span className="font-mono text-amber-500 font-bold">${splitPayments.reduce((s, p) => s + Number(p.amount), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-neutral-400">Remaining Balance:</span>
                  <span className="font-mono text-white font-bold">${Math.max(0, (billingOrder?.total || 0) - splitPayments.reduce((s, p) => s + Number(p.amount), 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/50">
              <button
                onClick={handleSettleBill}
                disabled={working === billingOrder?._id}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm uppercase tracking-widest transition disabled:opacity-50"
              >
                {working === billingOrder?._id ? "Processing..." : "Confirm & Settle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACCEPT MODAL ──────────────────────────────────────────────── */}
      {acceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white font-serif text-center">Accept Order</h3>
            <p className="text-sm text-neutral-400 text-center">Order: <strong className="text-amber-500">{acceptModal?.orderNumber}</strong></p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Estimated Prep Time</label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45].map(t => (
                  <button 
                    key={t}
                    onClick={() => setAcceptTime(t)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${acceptTime === t ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-black/20 text-neutral-400 border-white/10 hover:bg-white/5'}`}
                  >
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAcceptModal(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button 
                onClick={() => { if(acceptModal) updateStatus(acceptModal._id, "Confirmed", { estimatedPrepTime: acceptTime }); setAcceptModal(null); }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-emerald-950 text-sm font-black tracking-wide hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ──────────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-neutral-900/80 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white font-serif text-center text-red-500">Reject Order</h3>
            <p className="text-sm text-neutral-400 text-center">Order: <strong>{rejectModal?.orderNumber}</strong></p>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Reason for Cancellation</label>
              <select 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-500 shadow-inner"
              >
                <option value="" disabled>Select a reason...</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Store Busy">Store Busy</option>
                <option value="Outside Delivery Area">Outside Delivery Area</option>
                <option value="Customer Request">Customer Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setCancelReason(""); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all">Cancel</button>
              <button 
                onClick={() => { 
                  if(!cancelReason) return alert("Select a reason");
                  if(rejectModal) updateStatus(rejectModal._id, "Cancelled", { cancellationReason: cancelReason }); 
                  setRejectModal(null); 
                  setCancelReason("");
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 text-red-950 text-sm font-black tracking-wide hover:bg-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
