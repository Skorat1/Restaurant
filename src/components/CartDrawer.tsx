"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle2,
  Package,
  Sparkles,
  QrCode,
  CreditCard,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  Flame,
  Truck,
  ChefHat,
  Receipt
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";

interface OrderItem {
  _id?: string;
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber?: string;
  items: OrderItem[];
  total?: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
}

export default function CartDrawer() {
  const { items, count, subtotal, isCartOpen, closeCart, updateQty, removeItem, clearCart, addItem } = useCart();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"cart" | "orders">("cart");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "UPI">("UPI");
  const [checkoutStep, setCheckoutStep] = useState<"summary" | "payment_details">("summary");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success">("idle");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [tableNumber, setTableNumber] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      setCheckoutStep("summary"); // Reset step when opening
      setTableNumber(localStorage.getItem("tableSessionNumber"));
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  // Fetch client orders from backend
  const fetchOrders = useCallback(async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        // Fallback endpoint
        const fbRes = await fetch(`${API_BASE_URL}/api/orders/user`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          setOrders(Array.isArray(fbData) ? fbData : []);
        }
      }
    } catch (err) {
      console.error("Error fetching placed orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    if (isCartOpen && activeTab === "orders") {
      fetchOrders();
    }
  }, [isCartOpen, activeTab, fetchOrders]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.msg || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleProceed = () => {
    if (paymentMethod === "Cash") {
      handleFinalOrderSubmit();
    } else {
      setCheckoutStep("payment_details");
    }
  };

  const handlePaymentVerification = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setTimeout(() => {
        handleFinalOrderSubmit();
      }, 1000);
    }, 1500);
  };

  const handleFinalOrderSubmit = async () => {
    setPlacingOrder(true);
    const activeToken = token || localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            itemId: i.itemId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            image: i.image,
          })),
          customer: {
            name: user?.name || "Guest Patron",
            email: user?.email || "guest@example.com",
            phone: "9876543210",
            address: isDineIn ? `Table ${tableNumber}` : { street: "Pickup/Delivery", city: "VELORA" },
          },
          paymentMethod: paymentMethod,
          deliveryFee: deliveryCharge,
          subtotal: subtotal,
          tax: gstTax,
          discount: discount,
          total: grandTotal,
          couponCode: appliedCoupon?.code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderSuccess(data.order?.orderNumber || data.order?._id || "Order Placed Successfully!");
        clearCart();
        setCheckoutStep("summary");
        setPaymentStatus("idle");
        setActiveTab("orders");
        handleRemoveCoupon();
        fetchOrders();
      } else {
        clearCart();
        setCheckoutStep("summary");
        setPaymentStatus("idle");
        setActiveTab("orders");
        handleRemoveCoupon();
        fetchOrders();
      }
    } catch {
      clearCart();
      setCheckoutStep("summary");
      setPaymentStatus("idle");
      setActiveTab("orders");
      handleRemoveCoupon();
    } finally {
      setPlacingOrder(false);
    }
  };

  // Reorder items
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
    setActiveTab("cart");
  };

  if (!isCartOpen) return null;

  const isDineIn = !!tableNumber;
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      discount = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount > 0 && discount > appliedCoupon.maxDiscount) discount = appliedCoupon.maxDiscount;
    } else {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const gstTax = taxable * 0.08;
  const deliveryCharge = isDineIn ? 0 : 100;
  const grandTotal = taxable + gstTax + deliveryCharge;

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase().replace(/_/g, " ");
    if (s.includes("delivered") || s.includes("completed")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
    if (s.includes("preparing") || s.includes("kitchen")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse";
    }
    if (s.includes("out for delivery") || s.includes("ready")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse";
    }
    if (s.includes("cancelled")) {
      return "bg-red-500/20 text-red-300 border-red-500/40";
    }
    return "bg-sky-500/20 text-sky-300 border-sky-500/40";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop Overlay */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-neutral-950/98 border-l border-amber-500/30 backdrop-blur-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-white">Your Cart &amp; Orders</h2>
                <p className="text-xs text-neutral-400 font-mono">
                  {items.length} Item{items.length !== 1 ? "s" : ""} in Current Order
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-amber-500 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs (Cart Items / Placed Orders) */}
          <div className="flex border-b border-neutral-800 p-2 bg-neutral-950 gap-2">
            <button
              onClick={() => setActiveTab("cart")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === "cart"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white bg-neutral-900/50"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart Items ({count})</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === "orders"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white bg-neutral-900/50"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Placed Orders {orders.length > 0 ? `(${orders.length})` : ""}</span>
            </button>
          </div>

          {/* Tab 1: Cart Items */}
          {activeTab === "cart" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-white font-serif font-bold text-lg">Your Cart is Empty</p>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
                      Explore VELORA seasonal menu items and add your favorite dishes.
                    </p>
                  </div>
                  <Link
                    href="/menu"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
                  >
                    Browse Live Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.itemId}
                      className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-neutral-800 shrink-0">
                            <Image
                              src={resolveImg(item.image)}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                          <p className="text-xs text-amber-400 font-serif font-bold mt-0.5">₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center border border-neutral-800 rounded-xl bg-neutral-950 overflow-hidden">
                          <button
                            onClick={() => updateQty(item.itemId, item.quantity - 1)}
                            className="p-1.5 text-neutral-400 hover:text-white transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.itemId, item.quantity + 1)}
                            className="p-1.5 text-neutral-400 hover:text-white transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Recent Placed Orders */}
          {activeTab === "orders" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Your Order History
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchOrders}
                    disabled={loadingOrders}
                    title="Refresh"
                    className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin text-amber-400" : ""}`} />
                  </button>
                  <Link
                    href="/my-orders"
                    onClick={closeCart}
                    className="text-[11px] text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Full Orders Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {orderSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5 animate-bounce">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Order Placed Successfully!
                    </span>
                    <button
                      onClick={() => setOrderSuccess(null)}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-300">
                    Order Ref: <strong className="font-mono text-amber-400">{orderSuccess}</strong>
                  </p>
                </div>
              )}

              {loadingOrders ? (
                <div className="text-center py-16 text-neutral-400 text-xs space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                  <p>Loading your orders…</p>
                </div>
              ) : !user && !token ? (
                <div className="text-center py-16 space-y-4 text-neutral-400">
                  <Package className="w-12 h-12 mx-auto text-neutral-600" />
                  <p className="text-sm font-bold text-white">Sign In to View Orders</p>
                  <p className="text-xs max-w-xs mx-auto">
                    Log in to your account to view your live orders and past delivery history.
                  </p>
                  <Link
                    href="/login?redirect=/my-orders"
                    onClick={closeCart}
                    className="inline-block px-5 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl"
                  >
                    Log In
                  </Link>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 space-y-3 text-neutral-400">
                  <Package className="w-12 h-12 mx-auto text-neutral-600" />
                  <p className="text-sm font-bold text-white">No Orders Placed Yet</p>
                  <p className="text-xs">When you place an order, it will appear here in real-time.</p>
                  <button
                    onClick={() => setActiveTab("cart")}
                    className="mt-2 text-amber-400 text-xs font-semibold hover:underline"
                  >
                    ← Go back to Cart
                  </button>
                </div>
              ) : (
                orders.map((o) => {
                  const orderDate = new Date(o.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const orderTime = new Date(o.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const orderTotal = o.total !== undefined ? o.total : o.totalAmount || 0;
                  const displayCode = o.orderNumber || `#${o._id.slice(-6).toUpperCase()}`;

                  return (
                    <div
                      key={o._id}
                      className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-white text-xs">{displayCode}</span>
                          <p className="text-[10px] text-neutral-400">
                            {orderDate} · {orderTime}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${getStatusBadge(
                            o.status
                          )}`}
                        >
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 border-t border-neutral-800/80 pt-3 text-xs">
                        {o.items?.map((i, idx) => (
                          <div key={idx} className="flex items-center justify-between text-neutral-300">
                            <div className="flex items-center gap-2.5">
                              {i.image && (
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-800 shrink-0">
                                  <Image
                                    src={resolveImg(i.image)}
                                    alt={i.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="truncate max-w-[180px]">
                                {i.quantity}x {i.name}
                              </span>
                            </div>
                            <span className="font-mono text-amber-400 shrink-0">
                              ₹{(i.price * i.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total & Action Buttons */}
                      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 text-xs font-bold">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block">Total</span>
                          <span className="text-amber-400 font-serif text-sm">₹{orderTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(o)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold transition"
                          >
                            Reorder
                          </button>
                          <Link
                            href="/my-orders"
                            onClick={closeCart}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition flex items-center gap-1"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer Checkout Summary & Payment Flow */}
          {activeTab === "cart" && items.length > 0 && checkoutStep === "summary" && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-4 animate-fade-in">
              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Coupon Area */}
                <div className="py-2">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500 transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg font-bold disabled:opacity-50 transition"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold uppercase tracking-widest">{appliedCoupon.code}</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-neutral-500 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-400 text-[10px] mt-1">{couponError}</p>}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated GST (8%)</span>
                  <span className="font-mono">₹{gstTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>{isDineIn ? `Service to Table ${tableNumber}` : "Delivery Charge"}</span>
                  <span className="font-mono">{isDineIn ? "Free" : `₹${deliveryCharge.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-neutral-800">
                  <span>Grand Total</span>
                  <span className="text-amber-400 font-serif text-base">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Select Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {["UPI", "Card", "Cash"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        paymentMethod === method
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProceed}
                disabled={placingOrder}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>{paymentMethod === "Cash" ? "Confirm & Place Order" : "Proceed to Pay"}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            </div>
          )}

          {/* Payment Details Step (UPI / Card) */}
          {activeTab === "cart" && items.length > 0 && checkoutStep === "payment_details" && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950 space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCheckoutStep("summary")}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-white text-sm">Complete Payment</h3>
              </div>

              {paymentMethod === "UPI" && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">Scan with any UPI app</p>
                    <p className="text-lg font-serif font-bold text-amber-400 mt-1">₹{grandTotal.toFixed(2)}</p>
                    <div className="mt-3 py-2 px-4 rounded-xl bg-neutral-950 border border-neutral-800 inline-block">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-0.5">UPI ID</p>
                      <p className="text-sm font-mono text-white">velora@ybl</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "Card" && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Amount Due</span>
                    <span className="font-bold text-amber-400 text-sm">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-neutral-500">Card Number</label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="XXXX XXXX XXXX XXXX"
                          className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-neutral-500">CVV</label>
                        <input
                          type="text"
                          placeholder="XXX"
                          className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePaymentVerification}
                disabled={paymentStatus !== "idle" || placingOrder}
                className={`w-full py-4 rounded-2xl font-extrabold text-xs uppercase tracking-widest shadow-xl transition flex items-center justify-center gap-2 ${
                  paymentStatus === "success"
                    ? "bg-emerald-500 text-black shadow-emerald-500/20"
                    : "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-amber-500/20 hover:scale-[1.02] active:scale-98"
                }`}
              >
                {paymentStatus === "idle" && (
                  <>
                    <span>Verify &amp; Place Order</span>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </>
                )}
                {paymentStatus === "processing" && (
                  <>
                    <span>Processing Payment...</span>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  </>
                )}
                {paymentStatus === "success" && (
                  <>
                    <span>Payment Successful!</span>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
