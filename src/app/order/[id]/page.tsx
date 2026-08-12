"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { resolveImg } from "@/lib/image";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons?: { name: string; price: number }[];
  options?: { group: string; value: string }[];
  lineTotal?: number;
}

interface StatusEntry {
  status: string;
  note?: string;
  at: string;
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
  statusHistory: StatusEntry[];
  notes?: string;
  createdAt: string;
}

const STATUS_FLOW = ["Pending", "Confirmed", "Preparing", "Ready", "Out for Delivery", "Delivered"];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token || !id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setOrder(await res.json());
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.msg || "Order not found or access denied.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    // Refresh every 15 seconds for live-ish tracking
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [token, id]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-neutral-400">{error || "Order not found."}</p>
        <Link href="/orders" className="mt-6 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const isDelivered = order.status === "Delivered";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const statusColor = (s: string) => {
    switch (s) {
      case "Delivered": return "bg-emerald-500/15 text-emerald-300";
      case "Cancelled": return "bg-red-500/15 text-red-300";
      case "Out for Delivery": return "bg-sky-500/15 text-sky-300";
      default: return "bg-amber-500/15 text-amber-300";
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Order Tracking</span>
          <h1 className="mt-3 text-3xl font-serif text-white">Order {order.orderNumber}</h1>
          <p className="mt-2 text-neutral-400">
            Placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
          </p>
        </div>
        <span className={`inline-flex items-center self-start px-4 py-2 rounded-full text-sm font-semibold ${statusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Tracking timeline */}
      {isCancelled ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center mb-8">
          <p className="text-2xl mb-2">❌</p>
          <h2 className="text-xl font-serif text-white">This order was cancelled</h2>
          <p className="text-neutral-400 mt-2">If you believe this is an error, please contact the restaurant.</p>
        </div>
      ) : isDelivered ? (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center mb-8">
          <p className="text-2xl mb-2">🎉</p>
          <h2 className="text-xl font-serif text-white">Delivered — enjoy your meal!</h2>
          <p className="text-neutral-400 mt-2">Thank you for ordering with L&apos;Étoile Dorée.</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif text-white">Live status</h2>
            <span className="inline-flex items-center gap-2 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Auto-refreshing
            </span>
          </div>
          <div className="space-y-0">
            {STATUS_FLOW.map((step, idx) => {
              const done = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                        done
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-neutral-900 border-neutral-700 text-neutral-500"
                      }`}
                    >
                      {done ? "✓" : idx + 1}
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[32px] ${done ? "bg-amber-500" : "bg-neutral-800"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-semibold ${done ? "text-white" : "text-neutral-500"}`}>
                      {step}
                      {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-400">Current</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status history */}
      {order.statusHistory?.length > 1 && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 mb-8">
          <h3 className="text-sm uppercase tracking-wide text-neutral-400 mb-4">Timeline</h3>
          <div className="space-y-3">
            {[...(order.statusHistory ?? [])].reverse().map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-white font-medium">{entry.status}</p>
                  {entry.note && <p className="text-neutral-400 text-xs">{entry.note}</p>}
                  <p className="text-neutral-500 text-xs">{formatDate(entry.at)} · {formatTime(entry.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 mb-8">
        <h3 className="text-sm uppercase tracking-wide text-neutral-400 mb-4">Items</h3>
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              {item.image ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800 shrink-0">
                  <Image
                    src={resolveImg(item.image)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400 shrink-0">🍽️</div>
              )}
<div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{item.name} × {item.quantity}</p>
                {item.addons && item.addons.length > 0 && (
                  <p className="text-[11px] text-neutral-500">+ {item.addons.map((a) => a.name).join(", ")}</p>
                )}
                {item.options && item.options.length > 0 && (
                  <p className="text-[11px] text-neutral-500">{item.options.map((o) => o.value).join(", ")}</p>
                )}
              </div>
              <span className="text-sm text-amber-400 font-medium">${(item.lineTotal ?? item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm space-y-2">
        <div className="flex justify-between text-neutral-400">
          <span>Subtotal</span><span className="text-white">${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
            <span>−${order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-400">
          <span>Tax</span><span className="text-white">${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-400">
          <span>Delivery</span><span className="text-white">${order.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-neutral-800">
          <span>Total</span><span className="text-amber-400">${order.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-500 pt-2">
          <span>Payment</span>
          <span>
            {order.paymentMethod} · <span className="text-emerald-400">{order.paymentStatus}</span>
          </span>
        </div>
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/orders" className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-900 transition">
          All Orders
        </Link>
        <Link href="/order" className="rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition">
          Order Again
        </Link>
      </div>
    </section>
  );
}

