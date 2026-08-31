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

const AVATAR_ICONS = [
  { id: "crown", icon: Crown, label: "VIP Crown" },
  { id: "wine", icon: GlassWater, label: "Sommelier" },
  { id: "utensils", icon: Utensils, label: "Epicurean" },
  { id: "star", icon: Star, label: "Étoile Star" },
  { id: "sparkles", icon: Sparkles, label: "Golden Luxe" },
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

  // UI Status State
  const [activeTab, setActiveTab] = useState("overview"); // overview | personal | addresses | avatar | referral
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

  // Referral Link Copy
  const referralCode = `VELORA-${(user?.name || "VIP").split(" ")[0].toUpperCase()}-2026`;
  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://restaurant-psi-henna-35.vercel.app/signup?ref=${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
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

  // Submit Profile Changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

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
      const payload: any = { name: form.name };
      if (showPasswordField && form.password) {
        payload.password = form.password;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Failed to update profile.");
        return;
      }

      setMessage("Profile credentials updated successfully!");
      setShowPasswordField(false);
      setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
      if (refreshUser) refreshUser();
    } catch {
      setError("An unexpected error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputBaseCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-xs text-white placeholder-neutral-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
  const inputWithIconCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 pl-11 pr-4 py-3.5 text-xs text-white placeholder-neutral-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <EmailVerificationBanner />

        {/* ── PROFILE HEADER HERO CARD ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            
            {/* User Info & Avatar */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-amber-500/50 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-xl overflow-hidden">
                  {customPhotoUrl ? (
                    <img src={customPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Crown className="w-10 h-10" />
                  )}
                </div>
                <button
                  onClick={() => setActiveTab("avatar")}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-black shadow-lg hover:bg-amber-400 transition"
                  title="Change Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">{user?.name || "VIP Member"}</h1>
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    {user?.tier || "Gold VIP"}
                  </span>
                </div>
                <p className="text-neutral-400 text-xs">{user?.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-amber-400 font-semibold font-mono">
                  <span>Reward Points: 850 pts</span>
                  <span>•</span>
                  <span>VIP Lounge Access</span>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Link
                href="/profile/reservations"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold transition flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>My Reservations</span>
              </Link>
              <Link
                href="/reserve"
                className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-black text-xs font-bold text-amber-300 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Book Table</span>
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
        </div>

        {/* ── DASHBOARD LAYOUT (Sidebar + Main Content) ─────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── SIDEBAR (COLUMN 1) ─────────────────────────────────────── */}
          <div className="w-full lg:w-64 shrink-0 space-y-2 lg:sticky lg:top-24">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === "overview" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === "personal" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <User className="w-4 h-4" /> Personal Details
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === "addresses" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <MapPin className="w-4 h-4" /> Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab("avatar")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === "avatar" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Camera className="w-4 h-4" /> Avatar Settings
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === "referral" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Share2 className="w-4 h-4" /> Referrals
            </button>
          </div>

          {/* ── MAIN CONTENT (COLUMN 2) ────────────────────────────── */}
          <div className="flex-1 min-h-[50vh] w-full">
            
            {/* 1. OVERVIEW DASHBOARD */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">VIP Reward Points</p>
                    <p className="text-2xl text-amber-400 font-bold font-serif">850 pts</p>
                  </div>
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">Membership Tier</p>
                    <p className="text-2xl text-white font-bold font-serif">{user?.tier || "Gold VIP"}</p>
                  </div>
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">Saved Addresses</p>
                    <p className="text-2xl text-white font-bold font-serif">{addresses.length}</p>
                  </div>
                </div>

                {/* Direct Link to My Reservations */}
                <div className="bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Dining Reservations</span>
                    <h4 className="text-lg font-serif font-bold text-white">
                      View Your Reserved Tables &amp; Dining Passes
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Check table numbers, seating zones, and digital entry pass codes.
                    </p>
                  </div>
                  <Link
                    href="/profile/reservations"
                    className="px-5 py-2.5 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 shrink-0"
                  >
                    Open Reservations
                  </Link>
                </div>
                
                {/* Recent Activity Timeline Card */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <h3 className="text-lg font-serif text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-400" /> Recent Activity Timeline
                    </h3>
                    <span className="text-xs text-neutral-400">Activity Log</span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
                    {recentTimeline.map(({ id, icon: Icon, title, detail, time, color }) => (
                      <div key={id} className="relative flex items-start gap-4 group">
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
                    <button
                      type="button"
                      onClick={openCart}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1"
                    >
                      View Cart &amp; Active Orders <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <div className="animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2.5">
                      <User className="w-5 h-5 text-amber-400" />
                      Personal Credentials
                    </h3>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-5">
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

                    {/* Security Password Field */}
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
                </div>
              </div>
            )}

            {/* 3. SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl animate-fade-up">
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

                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition ${
                        addr.isPrimary ? "border-amber-500/50 bg-amber-500/5" : "border-neutral-800 bg-neutral-950/80"
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

                {addingAddress && (
                  <div className="space-y-3.5 border border-amber-500/30 bg-neutral-950 rounded-2xl p-4 animate-fade-up">
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add New Delivery Location</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {["Home", "Office", "Villa", "Other"].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition ${
                            newAddr.label === lbl
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
            )}

            {/* 4. AVATAR SETTINGS */}
            {activeTab === "avatar" && (
              <div className="animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2.5">
                      <Camera className="w-5 h-5 text-amber-400" />
                      Avatar Settings
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold mb-4">Choose your Avatar Badge Icon:</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {AVATAR_ICONS.map((a) => {
                      const IconComp = a.icon;
                      const isSelected = selectedAvatar === a.id && !customPhotoUrl;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedAvatar(a.id)}
                          className={`px-4 py-3 rounded-xl border transition flex items-center gap-2 text-xs font-medium ${
                            isSelected
                              ? "bg-amber-500 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20"
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
              </div>
            )}

            {/* 5. REFERRAL */}
            {activeTab === "referral" && (
              <div className="animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-serif text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-amber-400" /> Invite Friends &amp; Earn 250 Points
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Share your personal invitation link with family &amp; friends. Earn 250 VIP reward points when they complete their first dining reservation.
                  </p>
                  
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
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
