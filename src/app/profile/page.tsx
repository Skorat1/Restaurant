"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User, Mail, Lock, Phone, MapPin, Crown, Sparkles,
  Utensils, CheckCircle2, GlassWater,
  Save, Share2, Copy, Star,
  Plus, Trash2, Eye, EyeOff, TrendingUp, Package,
  CalendarDays, Camera, Home, Briefcase, ChevronRight,
  Flame, Award, Coffee, ShieldCheck, Heart, UploadCloud,
  Check, Image as ImageIcon, Link2, X
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCart } from "@/components/CartContext";
import API_BASE_URL from "@/lib/api";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

export interface AddressItem {
  id: string;
  label: string;
  line: string;
  city: string;
  pincode: string;
  isPrimary?: boolean;
}

// ── 10 Luxury Themed Badges ──────────────────────────────────────────────
const AVATAR_ICONS = [
  { id: "crown", icon: Crown, label: "VIP Royal Crown", desc: "Velvet VIP Member" },
  { id: "wine", icon: GlassWater, label: "Grand Sommelier", desc: "Vintage Cellar Connoisseur" },
  { id: "utensils", icon: Utensils, label: "Master Epicurean", desc: "Haute Gastronomy Patron" },
  { id: "star", icon: Star, label: "Michelin Étoile", desc: "Star Dining Connoisseur" },
  { id: "sparkles", icon: Sparkles, label: "Golden Luxe", desc: "Elite Circle Member" },
  { id: "flame", icon: Flame, label: "Fire & Ember", desc: "Charcoal Wagyu Aficionado" },
  { id: "award", icon: Award, label: "Distinguished Patron", desc: "Grand Tasting Circle" },
  { id: "coffee", icon: Coffee, label: "Salon Royale", desc: "Private Lounge Club" },
  { id: "shield", icon: ShieldCheck, label: "Velvet Guardian", desc: "Founding Dining Member" },
  { id: "heart", icon: Heart, label: "Gastronomic Passion", desc: "Culinary Enthusiast" },
];

// ── 6 Badge Accent Color Themes ──────────────────────────────────────────
const BADGE_COLORS = [
  { id: "amber", name: "Amber Gold", bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-400", ring: "ring-amber-500/40", hex: "#f59e0b" },
  { id: "rose", name: "Champagne Rose", bg: "bg-rose-500/20", border: "border-rose-500/50", text: "text-rose-400", ring: "ring-rose-500/40", hex: "#fb7185" },
  { id: "emerald", name: "Imperial Emerald", bg: "bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-400", ring: "ring-emerald-500/40", hex: "#10b981" },
  { id: "sky", name: "Sapphire Azure", bg: "bg-sky-500/20", border: "border-sky-500/50", text: "text-sky-400", ring: "ring-sky-500/40", hex: "#38bdf8" },
  { id: "purple", name: "Violet Royale", bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", ring: "ring-purple-500/40", hex: "#a855f7" },
  { id: "slate", name: "Obsidian Platinum", bg: "bg-slate-500/20", border: "border-slate-400/50", text: "text-slate-200", ring: "ring-slate-400/40", hex: "#94a3b8" },
];

// ── Curated Haute Cuisine & VIP Avatars ──────────────────────────────────
const PRESET_AVATARS = [
  {
    id: "preset-1",
    label: "Executive Chef",
    url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-2",
    label: "Master Sommelier",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-3",
    label: "Velvet Gentleman",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-4",
    label: "Golden Gala",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-5",
    label: "Modern Gourmet",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-6",
    label: "Michelin Dining",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-7",
    label: "Noir Connoisseur",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "preset-8",
    label: "Haute Elegance",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
];

const INITIAL_ADDRESSES: AddressItem[] = [
  { id: "addr-1", label: "Home", line: "23, Boat Club Road", city: "New York, USA", pincode: "401001", isPrimary: true },
  { id: "addr-2", label: "Office", line: "Suite 4B, Quadra Tower, Manhattan", city: "New York, USA", pincode: "411028", isPrimary: false },
];

export default function ProfilePage() {
  const { user, token, loading, logout, refreshUser } = useAuth();
  const { openCart } = useCart();
  const router = useRouter();

  // Basic Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Password Edit State
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Avatar & Custom Photo State
  const [selectedAvatar, setSelectedAvatar] = useState("crown");
  const [selectedColor, setSelectedColor] = useState("amber");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>(INITIAL_ADDRESSES);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", line: "", city: "New York, USA", pincode: "" });

  // UI Status State
  const [activeTab, setActiveTab] = useState("overview"); // overview | avatar | personal | addresses | referral
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Recent Activity Timeline Data
  const recentTimeline = [
    { id: "t1", icon: Package, title: "Order #ORD-20260804-3821", detail: "Delivered · 3 course meal · $124.00", time: "Aug 4, 2026", color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
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
      phone: user.phone || "+1 (555) 349-8201",
    }));

    if (user.avatar) {
      setCustomPhotoUrl(user.avatar);
    }
    if (user.avatarIcon) {
      setSelectedAvatar(user.avatarIcon);
    }
    if (user.avatarColor) {
      setSelectedColor(user.avatarColor);
    }
    if (user.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
    }
  }, [user]);

  // Profile Picture File Upload Handler
  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomPhotoUrl(reader.result as string);
      setMessage("Profile picture loaded! Click 'Save Avatar & Badges' to apply.");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImageFile(file);
    } else {
      setError("Please drop a valid image file (PNG, JPG, WEBP).");
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim() || !urlInput.startsWith("http")) {
      setError("Please enter a valid HTTP/HTTPS image URL.");
      return;
    }
    setCustomPhotoUrl(urlInput.trim());
    setUrlInput("");
    setShowUrlModal(false);
    setMessage("Profile picture updated from URL! Click 'Save Avatar & Badges' to apply.");
    setError("");
  };

  const removePhoto = () => {
    setCustomPhotoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage("Photo removed. Your avatar will display your VIP badge icon.");
  };

  // Save Avatar & Badge Settings to Backend
  const saveAvatarSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: customPhotoUrl || "",
          avatarIcon: selectedAvatar,
          avatarColor: selectedColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Failed to update avatar.");
        return;
      }

      setMessage("Avatar & VIP badge updated successfully across your account!");
      if (refreshUser) await refreshUser();
    } catch {
      setError("An unexpected error occurred while saving avatar.");
    } finally {
      setSaving(false);
    }
  };

  // Referral Link Copy
  const referralCode = `VELORA-${(user?.name || "VIP").split(" ")[0].toUpperCase()}-2026`;
  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://restaurant-psi-henna-35.vercel.app/signup?ref=${referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  // Address Handlers
  const setPrimaryAddress = async (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isPrimary: a.id === id }));
    setAddresses(updated);
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addresses: updated }),
      });
    }
  };

  const saveNewAddress = async () => {
    if (!newAddr.line.trim()) {
      setError("Please enter a valid street address.");
      return;
    }
    const newEntry: AddressItem = {
      id: `addr-${Date.now()}`,
      label: newAddr.label,
      line: newAddr.line,
      city: newAddr.city,
      pincode: newAddr.pincode,
      isPrimary: addresses.length === 0,
    };
    const updated = [...addresses, newEntry];
    setAddresses(updated);
    setNewAddr({ label: "Home", line: "", city: "New York, USA", pincode: "" });
    setAddingAddress(false);
    setMessage("New address saved successfully!");

    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addresses: updated }),
      });
    }
  };

  const removeAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addresses: updated }),
      });
    }
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
      const payload: any = {
        name: form.name,
        phone: form.phone,
        avatar: customPhotoUrl || "",
        avatarIcon: selectedAvatar,
        avatarColor: selectedColor,
        addresses,
      };
      if (showPasswordField && form.password) {
        payload.password = form.password;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
      if (refreshUser) await refreshUser();
    } catch {
      setError("An unexpected error occurred while saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const currentColorObj = BADGE_COLORS.find((c) => c.id === selectedColor) || BADGE_COLORS[0];
  const currentBadgeObj = AVATAR_ICONS.find((a) => a.id === selectedAvatar) || AVATAR_ICONS[0];
  const CurrentIcon = currentBadgeObj.icon;

  const inputBaseCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-xs text-white placeholder-neutral-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";
  const inputWithIconCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 pl-11 pr-4 py-3.5 text-xs text-white placeholder-neutral-500 transition focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 pt-28 pb-20 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-8">
        <EmailVerificationBanner />

        {/* Hidden Global File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/png, image/jpeg, image/webp, image/gif"
          className="hidden"
        />

        {/* ── PROFILE HEADER HERO CARD ─────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            
            {/* User Info & Avatar Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative group">
                <div
                  onClick={() => setActiveTab("avatar")}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 ${currentColorObj.border} ${currentColorObj.bg} flex items-center justify-center ${currentColorObj.text} shadow-2xl overflow-hidden cursor-pointer relative ring-4 ${currentColorObj.ring} transition-all duration-300 group-hover:scale-105`}
                >
                  {customPhotoUrl ? (
                    <img src={customPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <CurrentIcon className="w-12 h-12 stroke-[1.75]" />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Edit Photo</span>
                  </div>
                </div>

                {/* Quick Camera Action Pill */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl hover:from-amber-300 hover:to-amber-400 transition hover:scale-110 active:scale-95"
                  title="Upload New Profile Picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                    {user?.name || "VIP Member"}
                  </h1>
                  <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest shadow-sm">
                    {user?.role === "admin" ? "Master Admin" : user?.membership?.tier ? `${user.membership.tier} VIP` : "Gold VIP"}
                  </span>
                </div>
                
                <p className="text-neutral-400 text-xs font-mono">{user?.email}</p>
                
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-amber-400 font-semibold font-mono">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {user?.loyaltyPoints || 850} VIP Points
                  </span>
                  <span>•</span>
                  <span className="text-neutral-300">
                    Badge: <strong className="text-amber-300 capitalize">{currentBadgeObj.label}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("avatar")}
                className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Customize Avatar</span>
              </button>
              <Link
                href="/my-orders"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold transition flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-amber-400" />
                <span>My Orders</span>
              </Link>
              <Link
                href="/profile/reservations"
                className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-xs font-bold transition flex items-center gap-2"
              >
                <CalendarDays className="w-4 h-4 text-amber-400" />
                <span>Reservations</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {message && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-fade-up shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage("")} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold animate-fade-up shadow-lg">
            <div className="flex items-center gap-2.5">
              <X className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── DASHBOARD LAYOUT (Sidebar + Main Content) ─────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── SIDEBAR (COLUMN 1) ─────────────────────────────────────── */}
          <div className="w-full lg:w-64 shrink-0 space-y-2 lg:sticky lg:top-24">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 ${
                activeTab === "overview" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab("avatar")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 relative ${
                activeTab === "avatar" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Avatar &amp; Photo</span>
              <span className="ml-auto bg-amber-400/20 border border-amber-400/40 text-[9px] px-2 py-0.5 rounded-full font-mono text-amber-300">
                Studio
              </span>
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 ${
                activeTab === "personal" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <User className="w-4 h-4" /> Personal Details
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 ${
                activeTab === "addresses" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <MapPin className="w-4 h-4" /> Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-3 ${
                activeTab === "referral" ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Share2 className="w-4 h-4" /> Referrals &amp; VIP
            </button>
          </div>

          {/* ── MAIN CONTENT (COLUMN 2) ────────────────────────────── */}
          <div className="flex-1 min-h-[50vh] w-full">
            
            {/* 1. OVERVIEW DASHBOARD */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-up">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">VIP Reward Points</p>
                    <p className="text-2xl text-amber-400 font-bold font-serif">{user?.loyaltyPoints || 850} pts</p>
                  </div>
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">Membership Tier</p>
                    <p className="text-2xl text-white font-bold font-serif capitalize">
                      {user?.membership?.tier || "Gold VIP"}
                    </p>
                  </div>
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl">
                    <p className="text-neutral-400 text-xs font-semibold mb-1">Saved Addresses</p>
                    <p className="text-2xl text-white font-bold font-serif">{addresses.length}</p>
                  </div>
                </div>

                {/* Direct Link to Avatar Studio */}
                <div className="bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 border border-amber-500/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Profile Customization</span>
                    <h4 className="text-lg font-serif font-bold text-white">
                      Profile Picture &amp; VIP Badge Studio
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Upload your custom profile photo, select fine-dining avatars, or choose luxury icon badges.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("avatar")}
                    className="px-5 py-2.5 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 shrink-0"
                  >
                    Customize Avatar
                  </button>
                </div>

                {/* Direct Link to My Reservations */}
                <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">Dining Reservations</span>
                    <h4 className="text-lg font-serif font-bold text-white">
                      View Your Reserved Tables &amp; Digital Passes
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Check table numbers, seating zones, and digital entry pass codes.
                    </p>
                  </div>
                  <Link
                    href="/profile/reservations"
                    className="px-5 py-2.5 rounded-full border border-neutral-700 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition shrink-0"
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
                      View Dining Bag &amp; Active Orders <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. AVATAR & PROFILE PICTURE STUDIO ───────────────────── */}
            {activeTab === "avatar" && (
              <div className="space-y-6 animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-neutral-800 gap-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2.5 font-bold">
                        <Camera className="w-6 h-6 text-amber-400" />
                        Profile Picture &amp; Avatar Studio
                      </h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Upload your personal portrait, pick curated gourmet avatars, or select your VIP badge icon.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={saveAvatarSettings}
                      disabled={saving}
                      className="rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-black hover:shadow-lg hover:shadow-amber-500/25 transition disabled:opacity-50 flex items-center gap-2 shrink-0"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Saving…" : "Save Avatar & Badges"}</span>
                    </button>
                  </div>

                  {/* Live Avatar Preview Card */}
                  <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 rounded-2xl border border-neutral-800 p-6 flex flex-col md:flex-row items-center gap-6 shadow-inner">
                    <div className="relative">
                      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 ${currentColorObj.border} ${currentColorObj.bg} flex items-center justify-center ${currentColorObj.text} shadow-2xl overflow-hidden ring-4 ${currentColorObj.ring}`}>
                        {customPhotoUrl ? (
                          <img src={customPhotoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <CurrentIcon className="w-14 h-14 stroke-[1.75]" />
                        )}
                      </div>
                      
                      {customPhotoUrl && (
                        <div className={`absolute -bottom-1 -right-1 p-2 rounded-full ${currentColorObj.bg} border ${currentColorObj.border} ${currentColorObj.text} shadow-lg`}>
                          <CurrentIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center md:text-left flex-1">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-sm font-serif font-bold text-white">Live Appearance Preview</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentColorObj.bg} ${currentColorObj.text} border ${currentColorObj.border}`}>
                          {currentColorObj.name}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300">
                        {customPhotoUrl
                          ? "Using custom high-resolution photo with VIP badge overlay."
                          : `Using ${currentBadgeObj.label} (${currentBadgeObj.desc}).`}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setShowUrlModal(true)}
                          className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Image URL</span>
                        </button>

                        {customPhotoUrl && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Photo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section A: Drag & Drop Custom Photo Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Option 1: Upload Your Custom Profile Picture
                      </label>
                      <span className="text-[11px] text-neutral-500">Supports JPG, PNG, WEBP (Max 5MB)</span>
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                        isDragging
                          ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
                          : "border-neutral-800 hover:border-amber-500/40 bg-neutral-950/60 hover:bg-neutral-950"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Click to browse or drag &amp; drop your profile photo here
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-1">
                          Images are automatically fitted to your circular VIP profile badge
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Curated Haute Cuisine & VIP Avatars */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Option 2: Choose from Curated VIP &amp; Haute Cuisine Portraits
                    </label>
                    <p className="text-xs text-neutral-400">Select any of our signature fine-dining avatar portraits with one click:</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
                      {PRESET_AVATARS.map((preset) => {
                        const isChosen = customPhotoUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setCustomPhotoUrl(preset.url);
                              setMessage(`Selected "${preset.label}" portrait! Click 'Save Avatar & Badges' to apply.`);
                            }}
                            className={`group relative rounded-2xl overflow-hidden border p-2 text-left transition-all duration-300 ${
                              isChosen
                                ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/50"
                                : "border-neutral-800 bg-neutral-950/80 hover:border-neutral-700 hover:bg-neutral-900"
                            }`}
                          >
                            <div className="w-full aspect-square rounded-xl overflow-hidden relative mb-2">
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {isChosen && (
                                <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-white truncate px-0.5">{preset.label}</p>
                            <span className="text-[9px] text-neutral-400 block px-0.5 font-mono">Haute Portrait</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section C: VIP Avatar Badge Icons */}
                  <div className="space-y-4 pt-4 border-t border-neutral-800">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Crown className="w-4 h-4" /> Option 3: VIP Badge Icons &amp; Accents
                      </label>
                      <p className="text-xs text-neutral-400 mt-1">
                        Choose your primary icon badge displayed alongside your name across reservations and dining:
                      </p>
                    </div>

                    {/* Badge Icon Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {AVATAR_ICONS.map((a) => {
                        const IconComp = a.icon;
                        const isSelected = selectedAvatar === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(a.id);
                              setMessage(`Selected "${a.label}" badge!`);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center text-center gap-2 ${
                              isSelected
                                ? "bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]"
                                : "bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
                            }`}
                          >
                            <div className={`p-2 rounded-xl ${isSelected ? "bg-black/15 text-black" : "bg-neutral-900 text-amber-400"}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold leading-tight">{a.label}</p>
                              <span className={`text-[9px] block mt-0.5 ${isSelected ? "text-neutral-900" : "text-neutral-500"}`}>
                                {a.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Badge Accent Color Selector */}
                    <div className="pt-4">
                      <p className="text-xs text-neutral-300 font-semibold mb-2.5">Badge Accent Color Theme:</p>
                      <div className="flex flex-wrap gap-2.5">
                        {BADGE_COLORS.map((col) => {
                          const isSelected = selectedColor === col.id;
                          return (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => {
                                setSelectedColor(col.id);
                                setMessage(`Color theme updated to ${col.name}!`);
                              }}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                                isSelected
                                  ? `${col.bg} ${col.border} ${col.text} ring-2 ${col.ring}`
                                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                              }`}
                            >
                              <span
                                className="w-3 h-3 rounded-full border border-black/30 shadow-sm"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span>{col.name}</span>
                              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Save Bottom CTA */}
                  <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-400">
                      Changes will be reflected across your entire account, header navigation, and table reservation passes.
                    </p>
                    <button
                      type="button"
                      onClick={saveAvatarSettings}
                      disabled={saving}
                      className="w-full sm:w-auto rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:shadow-xl hover:shadow-amber-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Saving Changes…" : "Save Avatar & Badges"}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* 3. PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <div className="animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                    <h3 className="text-xl font-serif text-white flex items-center gap-2.5 font-bold">
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
                          placeholder="+1 (555) 000-0000"
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

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-black hover:from-amber-300 hover:to-amber-500 transition shadow-xl shadow-amber-500/25 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving…" : "Save Profile"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4. SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl animate-fade-up">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-lg font-serif text-white flex items-center gap-2 font-bold">
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
                        placeholder="Pincode (e.g. 10001)"
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

            {/* 5. REFERRAL */}
            {activeTab === "referral" && (
              <div className="animate-fade-up">
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <h3 className="text-lg font-serif text-white flex items-center gap-2 font-bold">
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

      {/* Direct Image URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-up">
          <div className="bg-neutral-950 border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-amber-400" /> Load Image from URL
              </h4>
              <button onClick={() => setShowUrlModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Paste direct image link (e.g. from Unsplash or Cloudinary):
            </p>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={inputBaseCls}
              autoFocus
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyUrl}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition"
              >
                Apply Image
              </button>
              <button
                type="button"
                onClick={() => setShowUrlModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-bold hover:bg-neutral-900 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
