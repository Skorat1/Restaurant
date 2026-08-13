"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/components/CartContext";
import { OrderCardSkeleton } from "@/components/Skeleton";

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
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { token, loading } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [reorderMsg, setReorderMsg] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setFetching(false);
      return;
    }

    setFetching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrders(await res.json());
        setError("");
      } else {
        setError("Failed to load orders.");
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      const timer = window.setTimeout(() => {
        void fetchOrders();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [loading, fetchOrders]);

  useEffect(() => {
    const activeStatuses = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery"];
    const hasActive = orders.some((o) => activeStatuses.includes(o.status));
    if (!hasActive) return;
    const interval = window.setInterval(() => {
      void fetchOrders();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [orders, fetchOrders]);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({ itemId: item.itemId, name: item.name, price: item.price, image: item.image }, item.quantity);
    });
    setReorderMsg(`${order.items.length} item(s) added to cart!`);
    setTimeout(() => setReorderMsg(""), 3000);
  };

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "Delivered":        return `${base} bg-emerald-500/15 text-emerald-300`;
      case "Cancelled":        return `${base} bg-red-500/15 text-red-300`;
      case "Out for Delivery": return `${base} bg-sky-500/15 text-sky-300`;
      default:                 return `${base} bg-amber-500/15 text-amber-300`;
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Account</span>
          <h1 className="mt-4 text-4xl font-serif">My Orders</h1>
          <p className="mt-3 text-neutral-400">Track and review all your online orders.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {orders.some((o) => ["Pending","Confirmed","Preparing","Ready","Out for Delivery"].includes(o.status)) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live tracking
            </span>
          )}
          <Link href="/menu" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition">
            Explore Menu
          </Link>
        </div>
      </div>

      {reorderMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 text-sm text-emerald-300 mb-4">
          ✓ {reorderMsg} <Link href="/menu" className="underline ml-1">Browse menu →</Link>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-8">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-white mb-2">No Orders Yet</h3>
          <p className="text-neutral-400 max-w-sm mx-auto mb-6">
            You haven&apos;t placed any online orders. Browse our seasonal menu.
          </p>
          <Link href="/menu" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition">
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/order/${order._id}`}
              className="block rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition hover:border-neutral-700 hover:-translate-y-0.5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-semibold text-white">{order.orderNumber}</h3>
                    <span className={statusBadge(order.status)}>{order.status}</span>
                  </div>

                  {/* Item images strip */}
                  <div className="flex items-center gap-2 mt-3">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                        {resolveImg(item.image ?? "") ? (
                          <Image
                            src={resolveImg(item.image ?? "")}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-xl">🍽️</span>
                        )}
                        {item.quantity > 1 && (
                          <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] font-bold px-1 rounded-tl">
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-xl border border-neutral-700 bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 font-medium shrink-0">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-neutral-400 truncate">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(order.createdAt)} · {order.paymentMethod} ·{" "}
                    <span className={order.paymentStatus === "Paid" ? "text-emerald-400" : "text-amber-400"}>
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-amber-400 font-semibold text-lg">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-neutral-500 mt-1">Track order →</p>
                  <button
                    onClick={(e) => { e.preventDefault(); handleReorder(order); }}
                    className="mt-2 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
