"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

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
  const [working, setWorking] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setError("Please log in with an Admin account (admin@restaurant.com) to access orders.");
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
          setError(errData.msg || "Failed to load orders. Admin credentials required.");
        }
      } catch {
        setError("Unable to reach the server. Please check backend connection.");
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
    if (!confirm("Delete this order?")) return;
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

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Delivered": return `${base} bg-emerald-500/15 text-emerald-300`;
      case "Cancelled": return `${base} bg-red-500/15 text-red-300`;
      case "Out for Delivery": return `${base} bg-sky-500/15 text-sky-300`;
      case "Preparing": case "Ready": return `${base} bg-orange-500/15 text-orange-300`;
      default: return `${base} bg-amber-500/15 text-amber-300`;
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-2 text-3xl font-serif text-white">Online Orders</h1>
          <p className="mt-2 text-neutral-400">Manage orders, update status, and track deliveries.</p>
        </div>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-mono shrink-0">
          Total Orders: {orders.length}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-6 py-5 text-sm text-red-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <p className="font-bold text-red-300">⚠️ Access Required</p>
            <p className="text-xs text-red-200/90">{error}</p>
          </div>
          <a
            href="/login"
            className="px-5 py-2.5 rounded-full bg-amber-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition text-center shrink-0"
          >
            Log In as Admin
          </a>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-amber-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-60">
                {orders.filter((o) => o.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          No orders {filter !== "All" ? `with status "${filter}"` : "yet"}.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition hover:border-neutral-700">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                    <span className={statusBadge(order.status)}>{order.status}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-amber-500/15 text-amber-300"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-400">
                    <span>{order.customer.name}</span>
                    <span className="text-neutral-500">{order.customer.email}</span>
                    {order.customer.phone && <span>{order.customer.phone}</span>}
                    <span>{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</span>
                    <span>{order.paymentMethod}</span>
                  </div>

                  {order.customer.address && (
                    <p className="mt-1 text-xs text-neutral-500">📍 {order.customer.address}</p>
                  )}

                  <div className="mt-3 space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-neutral-300">
                        <span className="text-neutral-500">× {item.quantity}</span> {item.name}
                        <span className="text-neutral-500"> — ${(item.price * item.quantity).toFixed(2)}</span>
                      </p>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="mt-2 text-sm text-neutral-500 italic">&ldquo;{order.notes}&rdquo;</p>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {order.discount > 0 && (
                      <span className="text-emerald-400">Discount: −${order.discount.toFixed(2)}</span>
                    )}
                    <span className="text-amber-400 font-semibold">Total: ${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={working === order._id}
                    className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-500 disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    disabled={working === order._id}
                    className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
