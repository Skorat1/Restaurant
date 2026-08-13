"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, MapPin, Crown, Sparkles,
  Utensils, CheckCircle2, Gift, GlassWater,
  LogOut, Save, Share2, Copy, Bell, Star,
  Plus, Trash2, Eye, EyeOff, TrendingUp, Package,
  CalendarDays, Camera, Home, Briefcase, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/components/CartContext";
import API_BASE_URL from "@/lib/api";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Nut Allergy", "Dairy-Free", "Halal"
];

const PREFERRED_SEATS = [
  "Main Salon", "VIP Skylight Booth", "Quiet Window Seat", "Garden Patio", "Chef's Table"
];

const AVATAR_ICONS = [
  { id: "crown", icon: Crown, label: "VIP Crown" },
  { id: "wine", icon: GlassWater, label: "Sommelier" },
  { id: "utensils", icon: Utensils, label: "Epicurean" },
  { id: "star", icon: Star, label: "Étoile Star" },
  { id: "sparkles", icon: Sparkles, label: "Golden Luxe" },
];

const REWARD_PERKS = [
  { id: "perk-1", title: "Complimentary Champagne Flute", points: 450, code: "PERK-CHAMPAGNE-2026", desc: "Enjoy a glass of Dom Pérignon Brut on arrival." },
  { id: "perk-2", title: "Pastry Chef Dessert Tasting", points: 700, code: "PERK-DESSERT-TASTING", desc: "Signature Soufflé & Artisanal Chocolate Course." },
  { id: "perk-3", title: "VIP Sommelier Cellar Tour", points: 1200, code: "PERK-CELLAR-ACCESS", desc: "Private 30-min guided tasting in our underground cellar." },
];

const POINTS_HISTORY = [
  { id: "ph-1", label: "Order #ORD-20260804-3821 Placed", points: +142, date: "Aug 4, 2026", type: "earn" },
  { id: "ph-2", label: "Table Reservation – VIP Skylight", points: +50, date: "Aug 2, 2026", type: "earn" },
  { id: "ph-3", label: "Champagne Perk Redeemed", points: -450, date: "Jul 28, 2026", type: "spend" },
  { id: "ph-4", label: "Friend Referral Bonus", points: +250, date: "Jul 20, 2026", type: "earn" },
];

const INITIAL_ADDRESSES = [
  { id: "addr-1", label: "Home", line: "23, Boat Club Road", city: "Pune, MH", pincode: "411001", isPrimary: true },
  { id: "addr-2", label: "Office", line: "Suite 4B, Quadra Tower, Magarpatta", city: "Pune, MH", pincode: "411028", isPrimary: false },
];

export default function ProfilePage() {
  const { user, token, loading, logout, refreshUser } = useAuth();
  const { openCart } = useCart();
  const router = useRouter();

  // Basic Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+91 98765 43210",
    password: "",
    confirmPassword: "",
  });

  // Password Edit State
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Avatar & Custom Photo State
  const [selectedAvatar, setSelectedAvatar] = useState("crown");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Addresses State
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", line: "", city: "Pune, MH", pincode: "" });

  // Points & Rewards State
  const [userPoints, setUserPoints] = useState(1450);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<typeof REWARD_PERKS[0] | null>(null);
  const [redeemedCode, setRedeemedCode] = useState("");

  // Preferences State
  const [selectedSeat, setSelectedSeat] = useState("VIP Skylight Booth");
  const [selectedDietary, setSelectedDietary] = useState<string[]>(["Gluten-Free", "Nut Allergy"]);
  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    emailReceipts: true,
    wineReleases: true,
  });

  // UI Status State
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Recent Activity Timeline Data
  const recentTimeline = [
    { id: "t1", icon: Package, title: "Order #ORD-20260804-3821", detail: "Delivered · 3 course meal · ₹2,840", time: "Aug 4, 2026", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
    { id: "t2", icon: CalendarDays, title: "VIP Skylight Reservation", detail: "Confirmed · Table T7 (Skylight) · 8:00 PM", time: "Aug 2, 2026", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
    { id: "t3", icon: GlassWater, title: "Cellar Wine Tasting Reserved", detail: "Château Margaux 2018 reserved by Sommelier", time: "Jul 28, 2026", color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  ];

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [loading, token, router]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
    }));
  }, [user]);

  // Profile Picture Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError("Image size should be less than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomPhotoUrl(reader.result as string);
        setMessage("Custom profile photo preview updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setCustomPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleDietary = (tag: string) => {
    setSelectedDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Referral Link Copy
  const referralCode = `ETOILE-${(user?.name || "VIP").split(" ")[0].toUpperCase()}-2026`;
  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://velora.in/signup?ref=${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Redeem Confirmation Handler
  const openRedeemModal = (perk: typeof REWARD_PERKS[0]) => {
    if (userPoints < perk.points) {
      setError(`Insufficient points. You need ${perk.points} pts (current: ${userPoints} pts).`);
      return;
    }
    setRedeemTarget(perk);
  };

  const confirmRedeem = () => {
    if (!redeemTarget) return;
    setUserPoints((prev) => prev - redeemTarget.points);
    setRedeemedCode(`Redeemed "${redeemTarget.title}"! Promo Code: ${redeemTarget.code}`);
    setMessage(`🎉 Perk unlocked! Use promo code ${redeemTarget.code} at checkout.`);
    setRedeemTarget(null);
  };

  // Address Handlers
  const setPrimaryAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isPrimary: a.id === id }))
    );
  };

  const saveNewAddress = () => {
    if (!newAddr.line.trim()) {
      setError("Please enter a valid street address.");
      return;
    }
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr-${Date.now()}`,
        label: newAddr.label,
        line: newAddr.line,
        city: newAddr.city,
        pincode: newAddr.pincode,
        isPrimary: prev.length === 0,
      },
    ]);
    setNewAddr({ label: "Home", line: "", city: "Pune, MH", pincode: "" });
    setAddingAddress(false);
    setMessage("New address added successfully!");
  };

  const removeAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  // Profile Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (showPasswordField) {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (form.name !== user?.name) body.name = form.name;
      if (form.email !== user?.email) body.email = form.email;
      if (showPasswordField && form.password) body.password = form.password;

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Profile credentials & preferences saved successfully!");
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setShowPasswordField(false);
        await refreshUser();
      } else {
        setError(data.msg || "Failed to update profile.");
      }
    } catch {
      setError("Unable to reach backend server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ActiveAvatarIcon = AVATAR_ICONS.find((a) => a.id === selectedAvatar)?.icon || Crown;

  // Form input high-contrast styling
  const inputBaseCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition";
  const inputWithIconCls = `${inputBaseCls} pl-11`;

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-8 overflow-x-hidden">

      {/* ── REDEEM CONFIRMATION MODAL ───────────────────────────────────── */}
      {redeemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-neutral-900 p-6 sm:p-8 shadow-2xl shadow-black/80 animate-fade-up">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">Confirm Perk Redemption</h3>
                <p className="text-xs text-neutral-400">Exclusive VIP Reward Redemption</p>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-5 mb-6 space-y-2">
              <p className="text-sm font-bold text-white">{redeemTarget.title}</p>
              <p className="text-xs text-neutral-300 leading-relaxed">{redeemTarget.desc}</p>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-400">Deduction:</span>
                <span className="text-amber-400 font-bold">{redeemTarget.points} Reward Points</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-neutral-400">Remaining Balance:</span>
                <span className="text-emerald-400 font-bold">{userPoints - redeemTarget.points} Points</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRedeemTarget(null)}
                className="flex-1 py-3.5 rounded-full border border-neutral-700 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRedeem}
                className="flex-1 py-3.5 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
              >
                Confirm &amp; Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER TITLE & TOP ACTIONS ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>VIP Patron Membership</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
              My Profile &amp; Preferences
            </h1>
            <p className="mt-2 text-neutral-400 text-xs sm:text-sm max-w-xl">
              Customize your dining preferences, manage delivery addresses, track VIP points, and review recent activities.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <Link
              href="/reserve"
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-black hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
            >
            </Link>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <EmailVerificationBanner />

        {/* ── VIP MEMBER BANNER CARD ──────────────────────────────────── */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">

              {/* Profile Image / Avatar Picker */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-amber-500/30">
                  {customPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={customPhotoUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <ActiveAvatarIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                  )}
                </div>

                {/* Upload Button overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-neutral-900 border border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black transition shadow-lg"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">{user?.name}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500 text-black px-3 py-1 rounded-full shadow-md">
                    {user?.role === "admin" ? "Master Admin" : "Étoile Gold Member"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1">{user?.email}</p>

                {/* Points counter */}
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowPointsHistory(!showPointsHistory)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold hover:border-amber-400 transition"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{userPoints} VIP Reward Points</span>
                    <span className="text-[10px] text-amber-400/80 underline font-normal">
                      {showPointsHistory ? "Hide History" : "Points History"}
                    </span>
                  </button>

                  {customPhotoUrl && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-[11px] text-neutral-400 hover:text-red-400 transition underline"
                    >
                      Remove Custom Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Nav Links */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/track"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/reserve"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Reservations</span>
              </Link>
              <Link
                href="/cellar"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition flex items-center gap-2"
              >
                <GlassWater className="w-4 h-4 text-amber-400" />
                <span>Wine Cellar</span>
              </Link>
            </div>
          </div>

          {/* Points History Panel */}
          {showPointsHistory && (
            <div className="mt-6 pt-6 border-t border-neutral-800/90 animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Points History Log</p>
                <span className="text-[11px] text-neutral-400">Total Earned: +442 pts</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {POINTS_HISTORY.map((h) => (
                  <div key={h.id} className="flex items-center justify-between bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-3 text-xs">
                    <div>
                      <p className="text-white font-semibold">{h.label}</p>
                      <p className="text-neutral-400 text-[11px] mt-0.5">{h.date}</p>
                    </div>
                    <span className={`font-bold text-sm ${h.type === "earn" ? "text-emerald-400" : "text-red-400"}`}>
                      {h.type === "earn" ? "+" : ""}{h.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Avatar Badge Icon Selector */}
          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-neutral-300 font-semibold">Avatar Badge Icon:</span>
            {AVATAR_ICONS.map((a) => {
              const IconComp = a.icon;
              const isSelected = selectedAvatar === a.id && !customPhotoUrl;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAvatar(a.id)}
                  className={`px-3 py-2 rounded-xl border transition flex items-center gap-2 text-xs font-medium ${isSelected
                    ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md"
                    : "bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MAIN BALANCED 2-COLUMN RESPONSIVE GRID ─────────────────── */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT COLUMN (COLUMN 1): Personal Credentials, Addresses & Preferences ── */}
          <div className="space-y-8">

            {/* 1. Personal Credentials Form */}
            <form onSubmit={handleSubmit} className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="text-xl font-serif text-white flex items-center gap-2.5 border-b border-neutral-800 pb-4">
                <User className="w-5 h-5 text-amber-400" />
                Personal Credentials
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputWithIconCls}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputWithIconCls}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputWithIconCls}
                  />
                </div>
              </div>

              {/* Security Password Field with In-line Change Password */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordField(!showPasswordField);
                      setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition underline underline-offset-2"
                  >
                    {showPasswordField ? "Cancel Edit" : "Change Password"}
                  </button>
                </div>

                {showPasswordField ? (
                  <div className="space-y-3 p-4 rounded-2xl border border-amber-500/30 bg-neutral-950 animate-fade-up">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className={`${inputWithIconCls} pr-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                          className={inputWithIconCls}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-400 flex items-center justify-between">
                    <span className="tracking-[0.25em]">••••••••••••</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono tracking-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Encrypted</span>
                      <button
                        type="button"
                        onClick={() => setShowPasswordField(true)}
                        className="text-xs font-bold text-amber-400 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {message && (
                <p className="text-xs text-emerald-300 font-semibold bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-300 font-semibold bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
                  {error}
                </p>
              )}

              {/* Right-Aligned Golden Save Profile Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-amber-500 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-amber-400 transition shadow-xl shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving…" : "Save Profile"}</span>
                </button>
              </div>
            </form>

            {/* 2. Saved Delivery Addresses */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-serif text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Saved Delivery Addresses
                </h3>
                <button
                  type="button"
                  onClick={() => setAddingAddress(!addingAddress)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition ${addr.isPrimary
                      ? "border-amber-500/50 bg-amber-500/5"
                      : "border-neutral-800 bg-neutral-950/80"
                      }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {addr.label === "Home" ? <Home className="w-3.5 h-3.5 text-amber-400" /> : <Briefcase className="w-3.5 h-3.5 text-sky-400" />}
                          {addr.label}
                        </span>
                        {addr.isPrimary && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-300">{addr.line}</p>
                      <p className="text-[11px] text-neutral-400">{addr.city} — {addr.pincode}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryAddress(addr.id)}
                          className="text-[11px] font-semibold text-neutral-400 hover:text-amber-400 transition"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAddress(addr.id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 transition"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Form */}
              {addingAddress && (
                <div className="space-y-3.5 border border-amber-500/30 bg-neutral-950 rounded-2xl p-4 animate-fade-up">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Delivery Location</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["Home", "Office", "Villa", "Other"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${newAddr.label === lbl
                          ? "bg-amber-500 text-black border-amber-400 font-bold"
                          : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
                          }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                  <input
                    placeholder="Street address (e.g. 23 Boat Club Rd)"
                    value={newAddr.line}
                    onChange={(e) => setNewAddr({ ...newAddr, line: e.target.value })}
                    className={inputBaseCls}
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      placeholder="City, State"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className={inputBaseCls}
                    />
                    <input
                      placeholder="Pincode (e.g. 411001)"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className={inputBaseCls}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveNewAddress}
                      className="flex-1 py-3 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingAddress(false)}
                      className="flex-1 py-3 rounded-xl border border-neutral-700 text-neutral-300 text-xs font-bold hover:bg-neutral-800 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Dining Preferences */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="text-xl font-serif text-white flex items-center gap-2.5 border-b border-neutral-800 pb-4">
                <Utensils className="w-5 h-5 text-amber-400" /> Dining Preferences
              </h3>

              {/* Seating Atmosphere */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2.5">
                  Preferred Table Seating Area
                </label>
                <div className="space-y-2">
                  {PREFERRED_SEATS.map((seat) => (
                    <div
                      key={seat}
                      onClick={() => setSelectedSeat(seat)}
                      className={`p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${selectedSeat === seat
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-neutral-950 border-neutral-800 text-neutral-200 hover:border-neutral-700 hover:text-white"
                        }`}
                    >
                      <span className="font-semibold">{seat}</span>
                      {selectedSeat === seat && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Contrast Dietary Restrictions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2.5">
                  Saved Dietary Restrictions &amp; Allergies
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {DIETARY_OPTIONS.map((tag) => {
                    const isSel = selectedDietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietary(tag)}
                        className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${isSel
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md"
                          : "bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                          }`}
                      >
                        {isSel ? "✓ " : ""}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  <Bell className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
                  Notification Preferences
                </label>
                {[
                  { key: "smsAlerts" as const, label: "SMS Waitlist & Seating Alerts" },
                  { key: "emailReceipts" as const, label: "Email Order Receipts & Pass Confirmation" },
                  { key: "wineReleases" as const, label: "Wine Cellar Exclusive Vintage Alerts" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer text-xs hover:border-neutral-700 transition"
                  >
                    <span className="text-neutral-200 font-medium">{label}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold transition ${notifications[key]
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-neutral-800 text-neutral-400"
                      }`}>
                      {notifications[key] ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (COLUMN 2): VIP Points, Rewards Store & Timeline ────── */}
          <div className="space-y-8">

            {/* 1. VIP Points Dashboard & Tier Level */}
            <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Étoile Rewards
                  </span>
                  <h3 className="text-xl font-serif text-white mt-1.5 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" /> VIP Points Dashboard
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-400 font-serif">{userPoints} <span className="text-xs font-sans text-neutral-400 font-normal">pts</span></p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Gold Status Member</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-300">Gold Tier Progression</span>
                  <span className="text-amber-400 font-mono">{userPoints} / 2,000 pts</span>
                </div>
                <div className="w-full h-3 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden relative p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-md transition-all duration-700"
                    style={{ width: `${Math.min(100, (userPoints / 2000) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-neutral-400 pt-0.5">
                  <span>Silver (0 pts)</span>
                  <span className="text-amber-400 font-bold">Gold Member (500 pts)</span>
                  <span className="text-purple-300">Platinum (2,000+ pts)</span>
                </div>
              </div>
            </div>

            {/* 2. VIP Points Store (Redeem Options with Golden Accent Buttons) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-xl font-serif text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" /> VIP Points Store
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">Redeem points for complimentary dining perks.</p>
                </div>
              </div>

              {redeemedCode && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-400" />
                  <span>{redeemedCode}</span>
                </div>
              )}

              <div className="space-y-3">
                {REWARD_PERKS.map((perk) => {
                  const canAfford = userPoints >= perk.points;
                  return (
                    <div
                      key={perk.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${canAfford
                        ? "border-neutral-800 bg-neutral-950/90 hover:border-amber-500/30"
                        : "border-neutral-800/50 bg-neutral-950/40 opacity-60"
                        }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{perk.title}</h4>
                        <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">{perk.desc}</p>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mt-2">
                          {perk.points} Points Required
                        </span>
                      </div>

                      {/* Golden Accent High-Contrast Redeem Button */}
                      <button
                        type="button"
                        onClick={() => openRedeemModal(perk)}
                        disabled={!canAfford}
                        className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black border border-amber-400 font-bold px-4 py-2.5 text-xs transition shrink-0 shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Invite Friends & Earn Points (Flex Aligned Input & Button) */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-serif text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-400" /> Invite Friends &amp; Earn 250 Points
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Share your personal invitation link with family &amp; friends. Earn 250 VIP reward points when they complete their first dining reservation.
              </p>

              {/* Clean Single Flex Line Alignment */}
              <div className="flex items-center gap-2.5 bg-neutral-950 border border-neutral-800 p-2.5 rounded-2xl w-full">
                <span className="text-xs font-mono font-bold text-amber-400 px-3 flex-1 truncate">{referralCode}</span>
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-500/20"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedReferral ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* 4. Recent Activity Timeline Card */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="text-lg font-serif text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" /> Recent Activity Timeline
                </h3>
                <span className="text-xs text-neutral-400">Live History</span>
              </div>

              {/* Vertical Timeline Element */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                {recentTimeline.map(({ id, icon: Icon, title, detail, time, color }) => (
                  <div key={id} className="relative flex items-start gap-4 group">
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${color} shadow-md`}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>

                    <div className="flex-1 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-3.5 transition group-hover:border-neutral-700">
                      <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                        <span>{title}</span>
                        <span className="text-[10px] text-neutral-500 font-normal">{time}</span>
                      </div>
                      <p className="text-xs text-neutral-300">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <button type="button" onClick={openCart} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1">
                  View Full Order &amp; Reservation History <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
