      "use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount: number;
  startsAt?: string;
  expiresAt?: string;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percent" as "percent" | "flat",
  value: "",
  minOrder: "0",
  maxDiscount: "0",
  usageLimit: "0",
  startsAt: "",
  expiresAt: "",
  active: true,
};

export default function AdminCoupons() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/coupons/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setCoupons(await res.json());
        } else {
          setError("Failed to load coupons.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [token]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      value: String(c.value),
      minOrder: String(c.minOrder),
      maxDiscount: String(c.maxDiscount),
      usageLimit: String(c.usageLimit),
      startsAt: c.startsAt ? c.startsAt.slice(0, 10) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      active: c.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        active: form.active,
      };
      const url = editing
        ? `${API_BASE_URL}/api/coupons/${editing._id}`
        : `${API_BASE_URL}/api/coupons`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        const fetchRes = await fetch(`${API_BASE_URL}/api/coupons/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (fetchRes.ok) setCoupons(await fetchRes.json());
      } else {
        setError(data.msg || "Failed to save coupon.");
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${c._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !c.active }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons((prev) => prev.map((x) => (x._id === c._id ? data.coupon : x)));
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

  const inputCls = "w-full rounded-xl border border-neutral-800 bg-neutral-950/50 backdrop-blur-xl px-5 py-3 text-sm text-white outline-none focus:border-amber-500 focus:bg-neutral-900 transition-all shadow-inner";
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2";

  const isExpired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Marketing Engine
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Promotions & Coupons</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Create discount codes and manage special promotional offers.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-bold text-black hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Coupon
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-amber-500/30 bg-neutral-900/80 backdrop-blur-2xl p-8 mb-8 space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none"></div>
          <h2 className="text-2xl font-serif font-bold text-white relative z-10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {editing ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label className={labelCls}>Coupon Code *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                className={`${inputCls} uppercase`}
                disabled={!!editing}
              />
            </div>
            <div>
              <label className={labelCls}>Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as "percent" | "flat" })}
                className={inputCls}
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount ($)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{form.discountType === "percent" ? "Discount % *" : "Discount $ *"}</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Minimum Order ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Max Discount Cap ($) — 0 for none</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Usage Limit — 0 for unlimited</label>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Start Date (optional)</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Expiry Date (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Festival special — 10% off all mains"
                className={inputCls}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-neutral-300 cursor-pointer font-medium relative z-10 mt-2">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-amber-500 w-4 h-4" />
            Activate coupon immediately
          </label>

          <div className="flex gap-4 relative z-10 pt-4">
            <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-3 text-sm font-bold text-black hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20">
              {saving ? "Saving..." : editing ? "Save Changes" : "Create Coupon"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-neutral-700 px-8 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {coupons.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-2">
          <p className="text-sm font-semibold">No coupons yet.</p>
          <p className="text-xs text-neutral-500">Create your first promo code to boost sales!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => (
            <div key={c._id} className={`rounded-[2rem] border bg-neutral-900/60 backdrop-blur-xl p-8 transition-all hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden group ${isExpired(c) ? "border-neutral-800 opacity-60 grayscale-[0.5]" : "border-neutral-800 hover:border-amber-500/30"}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-2xl font-mono font-bold text-amber-400 tracking-wider bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 inline-block">{c.code}</p>
                  <p className="text-xs text-neutral-400 mt-3 line-clamp-2">{c.description || "No description provided."}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                  c.active && !isExpired(c)
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-neutral-800/50 text-neutral-500 border border-neutral-700"
                }`}>
                  {isExpired(c) ? "Expired" : c.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-6 text-4xl font-serif font-bold text-white relative z-10">
                {c.discountType === "percent" ? `${c.value}%` : `₹${c.value}`}
                <span className="text-sm text-neutral-500 font-sans ml-2 font-medium tracking-wide uppercase">off</span>
              </div>

              <div className="mt-5 space-y-2 text-xs text-neutral-400 font-medium relative z-10">
                {c.minOrder > 0 && <p className="flex justify-between border-b border-neutral-800/50 pb-1"><span>Min order</span> <span className="text-white">₹{c.minOrder.toFixed(0)}</span></p>}
                {c.maxDiscount > 0 && <p className="flex justify-between border-b border-neutral-800/50 pb-1"><span>Max discount</span> <span className="text-white">₹{c.maxDiscount.toFixed(0)}</span></p>}
                <p className="flex justify-between border-b border-neutral-800/50 pb-1">
                  <span>Usage</span> 
                  <span className="text-white">{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : " / ∞"}</span>
                </p>
                {c.expiresAt && <p className="flex justify-between pt-1"><span>Expires</span> <span className="text-amber-400/80">{new Date(c.expiresAt).toLocaleDateString()}</span></p>}
              </div>

              <div className="mt-6 flex gap-3 relative z-10">
                <button
                  onClick={() => toggleActive(c)}
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900/50 px-3 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all shadow-sm"
                >
                  {c.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => openEdit(c)}
                  className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900/50 px-3 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all shadow-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCoupon(c._id)}
                  className="rounded-xl border border-red-900/30 bg-red-500/5 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

