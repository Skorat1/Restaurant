"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "@/lib/api";
// Image path resolver utility
import { resolveImg } from "@/lib/image";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/lib/AuthContext";

interface Addon { _id?: string; name: string; price: number; }
interface Choice { _id?: string; value: string; price: number; }
interface OptionGroup { _id?: string; name: string; required: boolean; multiple: boolean; choices: Choice[]; }

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  premium: boolean;
  rating?: number;
  reviewCount?: number;
  addons?: Addon[];
  optionGroups?: OptionGroup[];
}

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount: number;
  expiresAt?: string;
}

const PAYMENT_METHODS = [
  { id: "Card", label: "Credit / Debit Card", icon: "💳" },
  { id: "UPI", label: "UPI", icon: "📱" },
  { id: "Wallet", label: "Wallet", icon: "👛" },
  { id: "Cash on Delivery", label: "Cash on Delivery", icon: "💵" },
];

const TAX_RATE = 0.08;
const BASE_DELIVERY_FEE = 5;
const POINTS_PER_PAISE = 0.01;

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if ((window as any).Razorpay) return resolve();
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export default function OrderPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { items, subtotal, addItem, updateQty, removeItem, clearCart } = useCart();
  const router = useRouter();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Customization modal state
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[]>>({});

  // Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", address: "", pincode: "" });
  const [deliverySlot, setDeliverySlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(BASE_DELIVERY_FEE);
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyUse, setLoyaltyUse] = useState(0);
  const [loyaltyMsg, setLoyaltyMsg] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", upiId: "" });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (!authLoading && !token) router.push("/login");
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!user) return;
    setCustomer((prev) => ({ ...prev, name: user.name || prev.name, email: user.email || prev.email }));
    setLoyaltyPoints(user.loyaltyPoints || 0);
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu`)
      .then((r) => r.json())
      .then((d) => setMenu(Array.isArray(d) ? d : []))
      .catch(() => { })
      .finally(() => setMenuLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/coupons`)
      .then((r) => r.json())
      .then((d) => setCoupons(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/orders/slots`)
      .then((r) => r.json())
      .then((d) => setSlots(Array.isArray(d) ? d : []))
      .catch(() => { });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map((m) => m.category)))], [menu]);
  const availableMenu = menu.filter((m) => m.available !== false);
  const filteredMenu = activeTab === "All" ? availableMenu : availableMenu.filter((m) => m.category === activeTab);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") {
      let d = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount > 0 && d > appliedCoupon.maxDiscount) d = appliedCoupon.maxDiscount;
      return Math.round(d * 100) / 100;
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const loyaltyDiscount = Math.round(loyaltyUse * POINTS_PER_PAISE * 100) / 100;
  const tax = Math.round(Math.max(0, subtotal - discount - loyaltyDiscount) * TAX_RATE * 100) / 100;
  const total = Math.round((Math.max(0, subtotal - discount - loyaltyDiscount) + tax + deliveryFee) * 100) / 100;

  // Fetch delivery fee when pincode changes
  useEffect(() => {
    if (!customer.pincode || customer.pincode.length !== 6) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/delivery-check?pincode=${customer.pincode}`);
        const data = await res.json();
        setDeliveryFee(data.fee ?? BASE_DELIVERY_FEE);
        setDeliveryMsg(data.available ? `Delivery available — ${data.label} ($${data.fee})` : "Delivery not available for this pincode.");
      } catch { setDeliveryMsg("Unable to check delivery."); }
    }, 400);
    return () => clearTimeout(t);
  }, [customer.pincode]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponMsg({ type: "success", text: `Coupon ${data.coupon.code} applied!` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: "error", text: data.msg || "Invalid coupon." });
      }
    } catch {
      setAppliedCoupon(null);
      setCouponMsg({ type: "error", text: "Unable to validate coupon." });
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponCode(""); setCouponMsg(null); };

  // Open customization modal
  const openCustomize = (item: MenuItem) => {
    setCustomizeItem(item);
    setSelectedAddons([]);
    const opts: Record<string, string | string[]> = {};
    item.optionGroups?.forEach((g) => {
      if (g.multiple) opts[g.name] = [];
      else opts[g.name] = g.required ? (g.choices[0]?.value ?? "") : "";
    });
    setSelectedOptions(opts);
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) => prev.some((a) => a.name === addon.name) ? prev.filter((a) => a.name !== addon.name) : [...prev, addon]);
  };

  const toggleMultiOption = (group: string, value: string) => {
    setSelectedOptions((prev) => {
      const cur = (prev[group] as string[]) || [];
      return { ...prev, [group]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
    });
  };

  const addCustomizedToCart = () => {
    if (!customizeItem) return;
    const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    const optionTotal = Object.entries(selectedOptions).reduce((s, [group, val]) => {
      const g = customizeItem.optionGroups?.find((o) => o.name === group);
      if (!g) return s;
      const vals = Array.isArray(val) ? val : [val];
      return s + g.choices.filter((c) => vals.includes(c.value)).reduce((acc, c) => acc + c.price, 0);
    }, 0);
    const itemPrice = customizeItem.price + addonTotal + optionTotal;
    const options = Object.entries(selectedOptions).flatMap(([group, val]) => {
      const vals = Array.isArray(val) ? val : [val];
      return vals.filter(Boolean).map((v) => ({ group, value: v }));
    });
    addItem({
      itemId: customizeItem._id,
      name: customizeItem.name,
      price: customizeItem.price,
      image: customizeItem.image,
      category: customizeItem.category,
      addons: selectedAddons,
      options,
    });
    // Override lineTotal to include addons/options
    addItem({ itemId: customizeItem._id, name: customizeItem.name, price: itemPrice, image: customizeItem.image, category: customizeItem.category, addons: selectedAddons, options });
    setCustomizeItem(null);
  };

  const validatePayment = () => {
    if (paymentMethod === "Card") {
      const digits = cardDetails.number.replace(/\s/g, "");
      if (digits.length < 12) return "Please enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) return "Please enter a valid expiry (MM/YY).";
      if (cardDetails.cvv.length < 3) return "Please enter a valid CVV.";
    }
    if (paymentMethod === "UPI" && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(cardDetails.upiId)) return "Please enter a valid UPI ID.";
    return "";
  };

  const placeOrder = async () => {
    setOrderError("");
    const paymentErr = validatePayment();
    if (paymentErr) return setOrderError(paymentErr);
    if (!customer.name || !customer.email) return setOrderError("Name and email are required.");

    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ itemId: i.itemId, quantity: i.quantity, addons: i.addons || [], options: i.options || [] })),
        customer,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        loyaltyPoints: loyaltyUse > 0 ? loyaltyUse : undefined,
        deliverySlot: deliverySlot || undefined,
        notes: notes || undefined,
      };
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setOrderError(data.msg || "Failed to place order.");
      const orderId = data.order._id;

      const payRes = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) return setOrderError(payData.msg || "Failed to initiate payment.");

      if (payData.simulated || payData.paid) {
        clearCart();
        router.push(`/order/${orderId}`);
        return;
      }

      if (typeof window === "undefined") return;
      await loadRazorpayScript();
      const rzp = new (window as any).Razorpay({
        key: payData.key,
        amount: payData.amount,
        currency: payData.currency,
        name: "L'Étoile Dorée",
        description: `Order ${data.order.orderNumber}`,
        order_id: payData.razorpayOrderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) { clearCart(); router.push(`/order/${orderId}`); }
          else setOrderError(verifyData.msg || "Payment could not be verified.");
        },
        prefill: { name: customer.name, email: customer.email, contact: customer.phone || "" },
        theme: { color: "#f59e0b" },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.open();
      setPlacing(false);
    } catch {
      setOrderError("Unable to reach the server.");
      setPlacing(false);
    }
  };

  const formatPrice = (n: number) => `$${n.toFixed(2)}`;
  const inputCls = "w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500";
  const labelCls = "block text-xs uppercase tracking-wide text-neutral-400 mb-1.5";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Order Online</p>
        <h1 className="mt-4 text-4xl font-serif text-white sm:text-5xl">Curated dishes, delivered to your door.</h1>
        <p className="mt-3 text-neutral-400 max-w-xl mx-auto">
          Customize your dishes, redeem loyalty points, and select a delivery slot.
        </p>
      </div>

      {/* Coupon banners */}
      {coupons.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-3 justify-center">
          {coupons.slice(0, 3).map((c) => (
            <button key={c._id} onClick={() => { setCouponCode(c.code); setAppliedCoupon(c); setCouponMsg({ type: "success", text: `Coupon ${c.code} applied!` }); }}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-left hover:bg-amber-500/20 transition">
              <p className="text-sm font-bold text-amber-300">{c.code}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {c.discountType === "percent" ? `${c.value}% off` : `$${c.value} off`}
                {c.minOrder > 0 ? ` on orders over $${c.minOrder}` : ""}
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Menu */}
        <div>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === cat ? "bg-amber-500 text-black" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}>
                {cat}
              </button>
            ))}
          </div>

          {menuLoading ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">Loading menu…</div>
          ) : filteredMenu.length === 0 ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">No items in this category.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {filteredMenu.map((item) => (
                <article key={item._id} className="rounded-3xl border border-neutral-800/90 bg-neutral-900/70 overflow-hidden shadow-xl shadow-black/10 transition hover:border-neutral-700">
                  <div className="relative w-full h-44 overflow-hidden rounded-[2rem] bg-neutral-800 ring-1 ring-white/5 shadow-inner">
                    {resolveImg(item.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImg(item.image)} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition duration-300 ease-in-out hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                    )}
                    {item.premium && <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black uppercase">Premium</span>}
                    <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-sm font-semibold text-amber-400">{formatPrice(item.price)}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-neutral-400 leading-6 line-clamp-2">{item.description}</p>
                    {item.rating ? (
                      <div className="mt-2 flex items-center gap-1.5 text-sm">
                        <span className="text-amber-400">★ {item.rating}</span>
                        <span className="text-neutral-500">({item.reviewCount} reviews)</span>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-neutral-600">★ No reviews yet</div>
                    )}
                    <button
                      onClick={() => (item.addons?.length || item.optionGroups?.length) ? openCustomize(item) : addItem({ itemId: item._id, name: item.name, price: item.price, image: item.image, category: item.category })}
                      className="mt-4 w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition"
                    >
                      {(item.addons?.length || item.optionGroups?.length) ? "Customize & Add" : "Add to Cart"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Cart / Checkout */}
        <div className="lg:sticky lg:top-28 h-fit space-y-5">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-serif text-white">Your Cart</h2>
              <span className="text-sm text-neutral-400">{items.length} item{items.length === 1 ? "" : "s"}</span>
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-neutral-400">Your cart is empty.</p>
                <p className="text-sm text-neutral-500 mt-1">Add dishes from the menu to get started.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={`${item.itemId}-${idx}`} className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                        {resolveImg(item.image ?? "") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveImg(item.image ?? "")} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-lg">🍽️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-[11px] text-neutral-500 truncate">+ {item.addons.map((a) => a.name).join(", ")}</p>
                        )}
                        {item.options && item.options.length > 0 && (
                          <p className="text-[11px] text-neutral-500 truncate">{item.options.map((o) => o.value).join(", ")}</p>
                        )}
                        <p className="text-xs text-amber-400">{formatPrice(item.lineTotal ?? item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.itemId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-sm">−</button>
                        <span className="w-6 text-center text-sm text-white">{item.quantity}</span>
                        <button onClick={() => updateQty(item.itemId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.itemId)} className="text-neutral-500 hover:text-red-400 transition shrink-0" aria-label={`Remove ${item.name}`}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mt-5">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">{appliedCoupon.code}</p>
                        <p className="text-xs text-neutral-400">{appliedCoupon.discountType === "percent" ? `${appliedCoupon.value}% off` : `$${appliedCoupon.value} off`}</p>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
                        className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white uppercase outline-none focus:border-amber-500" />
                      <button onClick={applyCoupon} className="rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition">Apply</button>
                    </div>
                  )}
                  {couponMsg && <p className={`mt-2 text-xs ${couponMsg.type === "success" ? "text-emerald-300" : "text-red-300"}`}>{couponMsg.text}</p>}
                </div>

                {/* Instant Loyalty Point Burner */}
                {loyaltyPoints > 0 && (
                  <div className="mt-4 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        ⚡ Burn Points ({loyaltyPoints} Available)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLoyaltyUse(Math.min(loyaltyPoints, Math.floor((subtotal * 100) / 100)));
                          setLoyaltyMsg("Applied instant points discount!");
                        }}
                        className="px-3 py-1 rounded-full bg-amber-500 text-black font-bold uppercase tracking-wider text-[10px] hover:bg-amber-400 transition"
                      >
                        Use All Points
                      </button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="number"
                        min={0}
                        max={loyaltyPoints}
                        value={loyaltyUse}
                        onChange={(e) => {
                          const v = Math.min(Number(e.target.value) || 0, loyaltyPoints);
                          setLoyaltyUse(v);
                        }}
                        className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-white outline-none focus:border-amber-500"
                        placeholder="Points to redeem"
                      />
                    </div>
                    {loyaltyDiscount > 0 && (
                      <p className="text-xs text-emerald-300 font-bold">
                        −{formatPrice(loyaltyDiscount)} Flat Instant Discount Applied!
                      </p>
                    )}
                  </div>
                )}

                {/* Totals */}
                <div className="mt-5 space-y-2 border-t border-neutral-800 pt-4 text-sm">
                  <div className="flex justify-between text-neutral-400"><span>Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>−{formatPrice(discount)}</span></div>}
                  {loyaltyDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Loyalty</span><span>−{formatPrice(loyaltyDiscount)}</span></div>}
                  <div className="flex justify-between text-neutral-400"><span>Tax (8%)</span><span className="text-white">{formatPrice(tax)}</span></div>
                  <div className="flex justify-between text-neutral-400"><span>Delivery</span><span className="text-white">{formatPrice(deliveryFee)}</span></div>
                  <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-neutral-800"><span>Total</span><span className="text-amber-400">{formatPrice(total)}</span></div>
                </div>

                <button onClick={() => setCheckoutOpen(true)} className="mt-5 w-full rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black hover:bg-amber-400 transition">Proceed to Checkout</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {customizeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-white">Customize {customizeItem.name}</h2>
              <button onClick={() => setCustomizeItem(null)} className="text-neutral-400 hover:text-white transition" aria-label="Close">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {customizeItem.optionGroups && customizeItem.optionGroups.map((g) => (
              <div key={g.name} className="mb-5">
                <p className={labelCls}>{g.name}{g.required && <span className="text-amber-400"> *</span>}</p>
                <div className="space-y-2">
                  {g.choices.map((c) => {
                    const selected = g.multiple
                      ? ((selectedOptions[g.name] as string[]) || []).includes(c.value)
                      : selectedOptions[g.name] === c.value;
                    return (
                      <button key={c.value} type="button" onClick={() => g.multiple ? toggleMultiOption(g.name, c.value) : setSelectedOptions((prev) => ({ ...prev, [g.name]: c.value }))}
                        className={`flex items-center justify-between w-full rounded-xl border px-4 py-3 text-sm transition ${selected ? "border-amber-500 bg-amber-500/10 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"}`}>
                        <span>{c.value}</span>
                        {(c.price > 0 || selected) && <span className="text-amber-400">{selected ? (c.price ? `+$${c.price.toFixed(2)}` : "✓") : ""}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {customizeItem.addons && customizeItem.addons.length > 0 && (
              <div className="mb-5">
                <p className={labelCls}>Add-ons</p>
                <div className="space-y-2">
                  {customizeItem.addons.map((a) => {
                    const selected = selectedAddons.some((s) => s.name === a.name);
                    return (
                      <button key={a.name} type="button" onClick={() => toggleAddon(a)}
                        className={`flex items-center justify-between w-full rounded-xl border px-4 py-3 text-sm transition ${selected ? "border-amber-500 bg-amber-500/10 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"}`}>
                        <span>{a.name}</span>
                        <span className="text-amber-400">{a.price > 0 ? `+$${a.price.toFixed(2)}` : "Free"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={addCustomizedToCart} className="w-full rounded-full bg-amber-500 px-6 py-3.5 text-sm font-semibold text-black hover:bg-amber-400 transition">
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-white">Checkout</h2>
              <button onClick={() => setCheckoutOpen(false)} className="text-neutral-400 hover:text-white transition" aria-label="Close checkout">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400 mb-3">Contact details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><input placeholder="Full name *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className={inputCls} /></div>
                  <input type="email" placeholder="Email *" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className={inputCls} />
                  <input placeholder="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className={inputCls} />
                  <div className="col-span-2"><input placeholder="Delivery address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className={inputCls} /></div>
                  <div className="col-span-2">
                    <input placeholder="Pincode (for delivery fee)" value={customer.pincode} onChange={(e) => setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={inputCls} />
                    {deliveryMsg && <p className="mt-1.5 text-xs text-neutral-400">{deliveryMsg}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery slot */}
              {slots.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-400 mb-3">Delivery slot</p>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.slice(0, 6).map((s) => (
                      <button key={s} onClick={() => setDeliverySlot(s)}
                        className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition ${deliverySlot === s ? "border-amber-500 bg-amber-500/10 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment method */}
              <div>
                <p className="text-xs uppercase tracking-wide text-neutral-400 mb-3">Payment method</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${paymentMethod === m.id ? "border-amber-500 bg-amber-500/10 text-white" : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"}`}>
                      <span className="text-lg">{m.icon}</span>
                      <p className="mt-1 font-medium">{m.label}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod === "Card" && (
                  <div className="mt-3 space-y-3">
                    <input placeholder="Card number" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })} className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/YY" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value.slice(0, 5) })} className={inputCls} />
                      <input placeholder="CVV" type="password" value={cardDetails.cvv} onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} className={inputCls} />
                    </div>
                  </div>
                )}
                {paymentMethod === "UPI" && <input placeholder="yourname@upi" value={cardDetails.upiId} onChange={(e) => setCardDetails({ ...cardDetails, upiId: e.target.value })} className={`${inputCls} mt-3`} />}
                {paymentMethod === "Wallet" && (
                  <div className="mt-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">You will be redirected to your wallet app to complete the payment. (Simulated)</div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Order notes</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions…" className={inputCls} />
              </div>

              {/* Summary */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm space-y-1.5">
                <div className="flex justify-between text-neutral-400"><span>Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>−{formatPrice(discount)}</span></div>}
                {loyaltyDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Loyalty</span><span>−{formatPrice(loyaltyDiscount)}</span></div>}
                <div className="flex justify-between text-neutral-400"><span>Tax</span><span className="text-white">{formatPrice(tax)}</span></div>
                <div className="flex justify-between text-neutral-400"><span>Delivery</span><span className="text-white">{formatPrice(deliveryFee)}</span></div>
                <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-neutral-800"><span>Total</span><span className="text-amber-400">{formatPrice(total)}</span></div>
              </div>

              {orderError && <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">{orderError}</p>}

              <button onClick={placeOrder} disabled={placing || items.length === 0}
                className="w-full rounded-full bg-amber-500 px-6 py-4 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50">
                {placing ? "Placing order…" : `Pay ${formatPrice(total)}`}
              </button>
              <p className="text-center text-xs text-neutral-500">🔒 Secure checkout via Razorpay (or simulated in dev).</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
