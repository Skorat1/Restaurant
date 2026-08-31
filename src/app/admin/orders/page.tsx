"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import io from "socket.io-client";
import {
  Search, ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Truck, Package, XCircle, AlertCircle, ShoppingBag,
  Plus, Printer, Calendar, Banknote, LayoutDashboard, Filter, Check,
  CreditCard, Smartphone, DollarSign, SplitSquareHorizontal,
  Download, MapPin, MessageCircle, Phone, Map, Utensils, Bike,
  FileText, RotateCcw, AlertTriangle, Sparkles
} from "lucide-react";

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: Array<{ name: string; price: number }>;
  options?: Array<{ group: string; value: string }>;
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
  deliverySlot?: string;
  createdAt: string;
  prepStartTime?: string;
  estimatedPrepTime?: number;
  cancellationReason?: string;
  payments?: { method: string; amount: number; txId?: string }[];
}

const STATUSES = ["Pending", "Confirmed", "Preparing", "Ready", "Delivered", "Cancelled"];
const ORDER_TYPES = ["All", "Dine-In", "Takeaway", "Delivery"];

const LiveTimer = ({ startTime, estimatedTime }: { startTime: string, estimatedTime: number }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 60000));
    };
    update();
    const int = setInterval(update, 30000);
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
  const itemsPerPage = 8;
  const [isLive, setIsLive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bulk & Actions State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [acceptModal, setAcceptModal] = useState<Order | null>(null);
  const [acceptTime, setAcceptTime] = useState<number>(15);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("Out of Stock");
  const [customCancelNotes, setCustomCancelNotes] = useState("");

  // Split Bill Modal State
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([{method: 'Cash', amount: 0}]);

  useEffect(() => {
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
    // If setting to cancelled without reason, open cancel modal
    if (status === "Cancelled" && !extraData.cancellationReason) {
      const target = orders.find(o => o._id === id);
      if (target) {
        setCancelModalOrder(target);
        return;
      }
    }

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
        
        // Auto Print KOT on Confirm
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

  // Helper to determine order type
  const getOrderType = (order: Order) => {
    const rawNotes = (order.notes || "").toLowerCase();
    const slot = (order.deliverySlot || "").toLowerCase();
    const addr = (order.customer?.address || "").toLowerCase();

    if (rawNotes.includes("table") || slot.includes("table") || addr.includes("table")) {
      const match = (order.notes + " " + order.deliverySlot + " " + order.customer?.address).match(/table\s*#?\s*([0-9A-Za-z]+)/i);
      return { type: "Dine-In", label: `Dine-In (${match ? `Table #${match[1]}` : "Table"})`, icon: Utensils };
    }
    if (rawNotes.includes("pickup") || rawNotes.includes("takeaway") || slot.includes("pickup") || addr === "pickup") {
      return { type: "Takeaway", label: "Takeaway / Pickup", icon: ShoppingBag };
    }
    return { type: "Delivery", label: "Delivery", icon: Bike };
  };

  // Thermal KOT Printing (Kitchen Order Ticket)
  const printKOT = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const typeInfo = getOrderType(order);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; padding: 12px; font-size: 13px; width: 72mm; margin: 0 auto; color: #000; }
            h2, h3, h4 { text-align: center; margin: 3px 0; text-transform: uppercase; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-weight: bold; font-size: 14px; }
            .item-addons { font-size: 11px; padding-left: 14px; margin-bottom: 4px; font-style: italic; }
            .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
            .notes-box { margin-top: 8px; border: 1.5px solid #000; padding: 6px; font-weight: bold; font-size: 12px; }
            .footer { text-align: center; font-size: 10px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <h2>VELORA RESTAURANT</h2>
          <h3>*** KITCHEN ORDER TICKET (KOT) ***</h3>
          <div class="divider"></div>
          <div class="meta-row"><span>ORDER NO:</span> <strong>${order.orderNumber}</strong></div>
          <div class="meta-row"><span>DATE/TIME:</span> <span>${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div class="meta-row"><span>ORDER TYPE:</span> <strong>${typeInfo.label}</strong></div>
          <div class="meta-row"><span>GUEST:</span> <span>${order.customer?.name || "Patron"}</span></div>
          ${order.estimatedPrepTime ? `<div class="meta-row"><span>TARGET PREP:</span> <strong>${order.estimatedPrepTime} MINS</strong></div>` : ''}
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item-row">
              <span>${i.quantity}x ${i.name}</span>
            </div>
            ${i.addons && i.addons.length > 0 ? `<div class="item-addons">+ ${i.addons.map(a => a.name).join(", ")}</div>` : ''}
          `).join("")}
          <div class="divider"></div>
          ${order.notes ? `<div class="notes-box">⚠️ SPECIAL INSTRUCTIONS:<br/>${order.notes}</div>` : ''}
          <div class="footer">*** EXPEDITE PREPARATION ***</div>
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

  // Thermal Customer Bill POS Receipt
  const printCustomerBill = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const typeInfo = getOrderType(order);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${order.orderNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; padding: 12px; font-size: 12px; width: 72mm; margin: 0 auto; color: #000; }
            h2, h3, h4 { text-align: center; margin: 3px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
            .double-divider { border-bottom: 2px solid #000; margin: 8px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .meta-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
            .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; margin: 6px 0; }
            .footer { text-align: center; font-size: 11px; margin-top: 14px; }
          </style>
        </head>
        <body>
          <h2>VELORA HAUTE CUISINE</h2>
          <h4>TAX INVOICE / GUEST RECEIPT</h4>
          <p style="text-align:center; font-size:10px; margin:2px 0;">GSTIN: 24AAACV1234F1Z5 | FSSAI: 10019021004567</p>
          <div class="divider"></div>
          <div class="meta-row"><span>BILL NO:</span> <strong>${order.orderNumber}</strong></div>
          <div class="meta-row"><span>DATE:</span> <span>${new Date(order.createdAt).toLocaleDateString("en-IN")} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          <div class="meta-row"><span>GUEST:</span> <span>${order.customer?.name} (${order.customer?.phone || ""})</span></div>
          <div class="meta-row"><span>TYPE:</span> <strong>${typeInfo.label}</strong></div>
          <div class="divider"></div>
          <div class="item-row" style="font-weight:bold;">
            <span>ITEM</span>
            <span>AMT (INR)</span>
          </div>
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item-row">
              <span>${i.quantity}x ${i.name}</span>
              <span>₹${(i.price * i.quantity).toLocaleString('en-IN')}</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          <div class="item-row"><span>Subtotal:</span> <span>₹${(order.subtotal || order.total).toLocaleString('en-IN')}</span></div>
          ${order.discount > 0 ? `<div class="item-row"><span>Discount:</span> <span>-₹${order.discount.toLocaleString('en-IN')}</span></div>` : ''}
          ${order.tax > 0 ? `<div class="item-row"><span>GST / Taxes:</span> <span>₹${order.tax.toLocaleString('en-IN')}</span></div>` : ''}
          ${order.deliveryFee > 0 ? `<div class="item-row"><span>Delivery/Packaging:</span> <span>₹${order.deliveryFee.toLocaleString('en-IN')}</span></div>` : ''}
          <div class="double-divider"></div>
          <div class="total-row">
            <span>GRAND TOTAL:</span>
            <span>₹${order.total.toLocaleString('en-IN')}</span>
          </div>
          <div class="meta-row"><span>PAYMENT STATUS:</span> <strong>${order.paymentStatus || 'Paid'} (${order.paymentMethod || 'UPI/Card'})</strong></div>
          <div class="divider"></div>
          <div class="footer">
            <p>Thank you for dining with Velora!</p>
            <p>Visit again • www.velora.dining</p>
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

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Order Number", "Date", "Customer Name", "Customer Phone", "Type", "Status", "Total (INR)"];
    const rows = filtered.map(o => [
      o.orderNumber, 
      new Date(o.createdAt).toLocaleString().replace(/,/g, ''),
      `"${o.customer.name}"`, 
      o.customer.phone || "",
      getOrderType(o).type,
      o.status,
      o.total
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `velora_orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Filter Counts
  const typeCounts = useMemo(() => {
    const counts = { All: orders.length, "Dine-In": 0, Takeaway: 0, Delivery: 0 };
    orders.forEach(o => {
      const t = getOrderType(o).type as "Dine-In" | "Takeaway" | "Delivery";
      if (counts[t] !== undefined) counts[t]++;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Status Filter
      const matchesStatus = filter === "All" || o.status === filter;
      
      // Type Filter
      const oType = getOrderType(o).type;
      const matchesType = typeFilter === "All" || oType === typeFilter;

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
  }, [orders, filter, typeFilter, dateFilter, searchQuery]);

  // Quick Stats
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
  const pendingCount = todayOrders.filter(o => ["Pending", "Confirmed", "Preparing"].includes(o.status)).length;
  const todayRevenue = todayOrders.filter(o => o.status === "Delivered").reduce((sum, o) => sum + o.total, 0);

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full font-sans text-neutral-200 space-y-6 pb-20 max-w-[1700px] mx-auto">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              POS &amp; Orders Hub
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live WebSocket Stream
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Orders &amp; Kitchen Dispatch
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Live POS order tracking, thermal KOT &amp; customer receipt printing, and rapid workflow management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-2xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-2xl transition"
            title="Refresh Orders"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Today's Orders</p>
            <p className="text-3xl font-serif font-bold text-white mt-1">{todayOrders.length}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Total tickets processed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">In Progress / Prep</p>
            <p className="text-3xl font-serif font-bold text-sky-400 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-sky-400/80 mt-0.5">Active in kitchen</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Today's Revenue</p>
            <p className="text-3xl font-serif font-bold text-emerald-400 mt-1">₹{todayRevenue.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">Settled dining revenue</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── ORDER TYPE TABS (Dine-In / Takeaway / Delivery) ───────────── */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {ORDER_TYPES.map((type) => {
          const isSel = typeFilter === type;
          const count = typeCounts[type as keyof typeof typeCounts] || 0;

          return (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                isSel
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {type === "Dine-In" && <Utensils className="w-3.5 h-3.5" />}
              {type === "Takeaway" && <ShoppingBag className="w-3.5 h-3.5" />}
              {type === "Delivery" && <Bike className="w-3.5 h-3.5" />}
              {type === "All" && <LayoutDashboard className="w-3.5 h-3.5" />}
              <span>{type}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isSel ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH & ADVANCED FILTERS ──────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl shadow-xl">
        {/* Search input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition shadow-inner"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
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

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {["All", ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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

      {/* ── ORDERS GRID ────────────────────────────────────────────────── */}
      {paginatedOrders.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-16 text-center text-neutral-400 space-y-3 shadow-xl">
          <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600 mb-4 opacity-50" />
          <p className="text-lg font-serif text-white">No matching orders found.</p>
          <p className="text-xs text-neutral-500">Try adjusting your order type, status filter, or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {paginatedOrders.map((order) => {
            const typeInfo = getOrderType(order);
            const TypeIcon = typeInfo.icon;

            return (
              <div
                key={order._id}
                className="bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-mono font-black text-amber-400 text-base block">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs font-bold text-white block mt-0.5">
                        {order.customer?.name}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {order.customer?.phone || order.customer?.email}
                      </span>
                    </div>

                    {/* Order Type Badge */}
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 border-amber-500/30 text-amber-300 flex items-center gap-1 shrink-0">
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeInfo.label}</span>
                    </span>
                  </div>

                  {/* Status & Timer Line */}
                  <div className="flex items-center justify-between py-2 border-y border-neutral-800/80 my-3 text-xs">
                    <span className={statusBadge(order.status)}>
                      {order.status}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 py-1">
                    {order.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex justify-between items-start text-xs text-neutral-300">
                        <span className="font-medium line-clamp-1">
                          <strong className="text-amber-400 font-mono">{item.quantity}x</strong> {item.name}
                        </span>
                        <span className="font-mono font-semibold text-white shrink-0 ml-2">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Kitchen Instructions / Notes */}
                  {order.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                      <span className="font-bold text-[9px] uppercase tracking-wider block text-amber-400">Notes:</span>
                      <p className="text-[11px] text-neutral-200">{order.notes}</p>
                    </div>
                  )}

                  {/* Cancellation Reason if Cancelled */}
                  {order.status === "Cancelled" && order.cancellationReason && (
                    <div className="mt-2 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
                      <strong>Cancelled:</strong> {order.cancellationReason}
                    </div>
                  )}
                </div>

                {/* Card Footer: Financials & Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">Total Amount</span>
                    <span className="text-lg font-serif font-bold text-amber-400">
                      ₹{order.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Print POS Receipts Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => printKOT(order)}
                      className="py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      title="Print Thermal Kitchen Order Ticket"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>KOT</span>
                    </button>
                    <button
                      onClick={() => printCustomerBill(order)}
                      className="py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 text-neutral-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      title="Print Thermal Customer Invoice"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Bill</span>
                    </button>
                  </div>

                  {/* Inline Quick Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      disabled={working === order._id}
                      className="w-full bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-amber-500 transition cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          Status: {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => deleteOrder(order._id)}
                      disabled={working === order._id}
                      className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition"
                      title="Delete Order"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-neutral-800">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-neutral-400 font-mono">
            PAGE {currentPage} OF {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-50 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── CANCELLATION REASON MODAL ───────────────────────────────────── */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold">Cancel / Refund Order</h3>
                <p className="text-xs text-neutral-400 font-mono">{cancelModalOrder.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                Select Cancellation Reason
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Out of Stock", "Customer Request", "Kitchen Delay", "Address Unreachable"].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReason(reason)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition ${
                      cancelReason === reason
                        ? "bg-red-500 text-black border-red-500 shadow-md"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] text-neutral-500 block mb-1">Additional Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Guest changed mind before prep..."
                  value={customCancelNotes}
                  onChange={(e) => setCustomCancelNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOrder(null);
                  setCustomCancelNotes("");
                }}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = customCancelNotes ? `${cancelReason} - ${customCancelNotes}` : cancelReason;
                  updateStatus(cancelModalOrder._id, "Cancelled", { cancellationReason: finalReason });
                  setCancelModalOrder(null);
                  setCustomCancelNotes("");
                }}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-black text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/20"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
