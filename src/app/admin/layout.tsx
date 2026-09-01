"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ExternalLink, ShieldCheck, Plus, Store, ChevronRight, PanelLeftClose, PanelLeft, Bell, MessageSquare, Volume2, VolumeX, Sparkles, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/Button";
import PushNotificationBanner from "@/components/PushNotificationBanner";

interface NavSubItem {
  href: string;
  label: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  subItems?: NavSubItem[];
}

interface NavGroup {
  title: string;
  roles: string[];
  items: NavItem[];
}

export interface LiveNotification {
  id: string;
  type: "chat" | "waiter" | "order";
  title: string;
  subtitle?: string;
  message: string;
  customerName?: string;
  sessionId?: string;
  tableNumber?: string;
  time: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Kitchen & Floor Ops",
    roles: ["admin", "owner", "manager", "chef", "kitchen", "waiter", "captain", "staff"],
    items: [
      { href: "/admin/kds", label: "KDS Display", icon: "M4 6h16v12H4zM8 10h8M8 14h5" },
      { href: "/admin/orders", label: "Orders & POS", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0", badge: "pendingOrders" },
      { href: "/admin/reservations", label: "Floor Plan & Bookings", icon: "M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l3 4h12l3-4M8 12h8M8 16h5", badge: "pendingReservations" },
      { href: "/admin/chat", label: "Live Support & Desk", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", badge: "activeChats" },
    ]
  },
  {
    title: "Executive & Content",
    roles: ["admin", "owner", "manager", "chef"],
    items: [
      { href: "/admin", label: "Executive Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
      { href: "/admin/inventory", label: "Inventory & Stock", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { 
        href: "/admin/menu", 
        label: "Menu & Pricing", 
        icon: "M12 2c1.5 2 4 2.5 4 5.5 0 1.5-1 2-1 3.5 0 1 1 2.5 1 3.5C16 18 13.5 20 12 20s-4-2-4-6.5c0-1 .5-2.5.5-3.5 0-1.5-1-2-1-3.5C7.5 4.5 10 4 12 2z"
      },
      { href: "/admin/reviews", label: "Reviews", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" },
      { href: "/admin/coupons", label: "Coupons", icon: "M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4z" },
      { href: "/admin/inquiries", label: "Inquiries", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
      { href: "/admin/newsletter", label: "Newsletter", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0 8 6 8-6" },
    ]
  },
  {
    title: "Intelligence & Access",
    roles: ["admin", "owner", "manager"],
    items: [
      { href: "/admin/analytics", label: "Financial Analytics", icon: "M18 20V10M12 20V4M6 20v-6" },
      { href: "/admin/users", label: "Users & Staff", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { href: "/admin/notifications", label: "Push Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
      { href: "/admin/activity", label: "Audit Intelligence", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
    ]
  }
];

const STAFF_ROLES = ["admin", "owner", "manager", "chef", "kitchen", "waiter", "captain", "staff"];

// Sound Synthesizer for live notifications
function playChimeAlert(type: "chat" | "waiter" = "chat") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "chat") {
      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(1174.66, now); // D6
      osc1.frequency.setValueAtTime(1479.98, now + 0.12); // F#6
      osc2.frequency.setValueAtTime(587.33, now);
      osc2.frequency.setValueAtTime(739.99, now + 0.12);
    } else {
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1320, now + 0.15);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(660, now + 0.15);
    }

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio permission errors
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [storeActive, setStoreActive] = useState(true);
  const isReady = !loading && !!token && STAFF_ROLES.includes(user?.role || "");

  const [theme, setTheme] = useState<"classic" | "cinematic">("classic");
  
  // Real-time notifications state
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activeToasts, setActiveToasts] = useState<LiveNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "chat" | "waiter">("all");

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/login");
      } else if (user && !STAFF_ROLES.includes(user.role || "")) {
        router.replace("/");
      }
    }
  }, [loading, token, user, router]);

  useEffect(() => {
    if (!token || !isReady) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [token, isReady]);

  const addLiveNotification = (notif: Omit<LiveNotification, "id" | "time" | "timestamp" | "read">) => {
    const newNotif: LiveNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    setActiveToasts(prev => [newNotif, ...prev.slice(0, 4)]);

    if (soundEnabled) {
      playChimeAlert(notif.type === "chat" ? "chat" : "waiter");
    }

    // Auto-remove toast after 8 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== newNotif.id));
    }, 8000);
  };

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Socket for live updates (Live Support Chat, Waiter Calls, Orders)
  useEffect(() => {
    if (!token || !isReady) return;
    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    // 1. Waiter Call listener
    socket.on("waiter_called", (data: any) => {
      const table = data.tableNumber || (data.tableId ? `Table ${data.tableId}` : "T1");
      const requestType = data.requestType || "assistance";
      addLiveNotification({
        type: "waiter",
        title: requestType === "bill" ? "Bill Requested" : "Waiter Assistance Requested",
        subtitle: `Table ${table}`,
        message: `Guest at Table ${table} requested ${requestType}.`,
        tableNumber: table,
        link: "/admin/reservations"
      });
    });

    // 2. Live Support Message listener
    socket.on("support_message", (data: any) => {
      const sender = data.sender || data.message?.sender;
      const text = data.text || data.message?.text || "New message received";
      const sessionId = data.sessionId || data.message?.sessionId || "General";
      const customerName = data.customerName || "Customer";

      if (sender === "customer") {
        addLiveNotification({
          type: "chat",
          title: `Live Support: ${customerName}`,
          subtitle: `Session #${sessionId.slice(0, 10)}`,
          message: text,
          customerName,
          sessionId,
          link: `/admin/chat`
        });

        // Increment active stats
        setStats((prev: any) => {
          if (!prev) return prev;
          const currentChats = prev.activeChats || prev.counts?.activeChats || 0;
          return {
            ...prev,
            activeChats: currentChats + 1,
            counts: {
              ...(prev.counts || {}),
              activeChats: currentChats + 1,
            }
          };
        });
      }
    });

    // 3. Active chats updated listener
    socket.on("active_chats_updated", (data: any) => {
      const msg = data.message;
      if (msg && msg.sender === "customer" && !data.fromSelf) {
        // Updated chat message
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, isReady, soundEnabled]);

  if (loading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-amber-500 font-bold uppercase tracking-widest text-xs animate-pulse">Authenticating...</p>
      </div>
    );
  }

  const isCinematic = theme === "cinematic";
  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === "chat") return n.type === "chat";
    if (notificationFilter === "waiter") return n.type === "waiter";
    return true;
  });

  return (
    <div className={`min-h-screen text-white relative transition-colors duration-1000 ${isCinematic ? "bg-[#050510] selection:bg-purple-500/30" : "bg-black selection:bg-amber-500/30"}`}>
      {/* ── GLOBAL AMBIENT GLOWS ── */}
      <div className={`fixed top-0 left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0 transition-colors duration-1000 ${isCinematic ? "bg-purple-600/10" : "bg-amber-500/5"}`}></div>
      <div className={`fixed bottom-0 right-[10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0 transition-colors duration-1000 ${isCinematic ? "bg-cyan-500/10" : "bg-emerald-500/5"}`}></div>

      {/* ── REAL-TIME FLOATING TOAST NOTIFICATION BAR (LIVE SUPPORT & WAITER) ── */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {activeToasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto border p-4 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col gap-2.5 transition-all duration-300 animate-in slide-in-from-top-4 ${
              toast.type === 'chat'
                ? isCinematic 
                  ? "bg-neutral-950/95 border-purple-500/50 shadow-purple-500/20" 
                  : "bg-neutral-950/95 border-amber-500/50 shadow-amber-500/20"
                : "bg-neutral-950/95 border-emerald-500/50 shadow-emerald-500/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  toast.type === 'chat'
                    ? isCinematic ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {toast.type === 'chat' ? <MessageSquare className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {toast.type === 'chat' ? '💬 Live Support' : '🛎️ Waiter Call'}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                      NEW
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-neutral-300 mt-0.5 truncate max-w-[200px]">
                    {toast.customerName ? `${toast.customerName}` : toast.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-neutral-500">{toast.time}</span>
                <button 
                  onClick={() => removeToast(toast.id)} 
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-xs text-neutral-300 line-clamp-2 bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800/80 font-medium">
              "{toast.message}"
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  removeToast(toast.id);
                  if (toast.link) router.push(toast.link);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-lg ${
                  toast.type === 'chat'
                    ? isCinematic 
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30" 
                      : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                }`}
              >
                <span>{toast.type === 'chat' ? 'Reply in Live Support' : 'View Floor'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="mx-auto max-w-[1600px] px-3 sm:px-6 py-4 sm:py-8 relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-2 z-[50] flex items-center justify-between mb-4 bg-neutral-900/60 backdrop-blur-2xl p-4 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700/50 hover:bg-neutral-700 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isCinematic ? "text-purple-400" : "text-amber-500"}`} />
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition ${soundEnabled ? "bg-neutral-800 text-amber-400 border-neutral-700" : "bg-neutral-900 text-neutral-500 border-neutral-800"}`}
              title={soundEnabled ? "Mute Alerts" : "Unmute Alerts"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700/50 hover:bg-neutral-700 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />

        {/* Sidebar Navigation */}
        <aside className={`fixed lg:sticky lg:self-start top-0 left-0 h-[100dvh] lg:h-[calc(100vh-4rem)] z-[9999] lg:z-10 bg-neutral-950/90 lg:bg-neutral-900/40 backdrop-blur-3xl border-r lg:border border-neutral-800/80 lg:rounded-3xl p-4 flex flex-col justify-between shadow-2xl transition-all duration-500 ease-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "w-[88px]" : "w-[280px]"} overflow-y-auto custom-scrollbar group/sidebar`}>
          
          <div>
            {/* Header & Toggle */}
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6`}>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Workspace</span>
                  <span className={`text-base font-black uppercase tracking-widest ${isCinematic ? "text-purple-400" : "text-amber-500"}`}>VELORA</span>
                </div>
              )}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg bg-neutral-800/80 text-neutral-400 hover:text-white border border-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Section */}
            <div className={`flex items-center gap-3 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 mb-6 ${isCollapsed ? "justify-center" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${isCinematic ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-purple-500/30" : "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-amber-500/30 font-black"}`}>
                {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black mt-0.5 ${isCinematic ? "text-cyan-400" : "text-amber-400"}`}>{user?.role}</p>
                </div>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="flex flex-col gap-6">
              {NAV_GROUPS.filter(g => g.roles.includes(user?.role || "")).map((group, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  {!isCollapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-3 mb-1">
                      {group.title}
                    </span>
                  )}
                  {group.items.map(({ href, label, icon, subItems, badge }) => {
                    const active = pathname === href || pathname.startsWith(href + '/');
                    const isSubOpen = openSubMenu === label;
                    const badgeCount = badge && stats ? (stats[badge] ?? stats.counts?.[badge] ?? 0) : 0;
                    
                    return (
                      <div key={href} className="flex flex-col">
                        <Link
                          href={subItems ? "#" : href}
                          onClick={(e) => {
                            if (subItems) {
                              e.preventDefault();
                              if (!isCollapsed) setOpenSubMenu(isSubOpen ? null : label);
                            } else {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative group/item ${
                            active
                              ? isCinematic 
                                  ? "bg-purple-500/10 text-white"
                                  : "bg-amber-500/10 text-white"
                              : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                          } ${isCollapsed ? "justify-center px-0" : ""}`}
                          title={isCollapsed ? label : ""}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-colors ${active ? (isCinematic ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400") : "bg-transparent group-hover/item:bg-neutral-700/50"}`}>
                              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d={icon} />
                              </svg>
                            </div>
                            {!isCollapsed && <span className="text-sm font-semibold tracking-wide">{label}</span>}
                          </div>
                          
                          {!isCollapsed && (
                            <div className="flex items-center gap-2">
                              {badgeCount > 0 && (
                                <span className={`flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isCinematic ? "bg-purple-500 text-white" : "bg-amber-500 text-black animate-pulse"}`}>
                                  {badgeCount}
                                </span>
                              )}
                              {subItems && (
                                <ChevronRight className={`w-4 h-4 text-neutral-500 transition-transform ${isSubOpen ? "rotate-90" : ""}`} />
                              )}
                            </div>
                          )}
                        </Link>
                        
                        {/* Sub Menu Accordion */}
                        {!isCollapsed && subItems && isSubOpen && (
                          <div className="mt-1 ml-10 flex flex-col gap-1 border-l border-neutral-800 pl-3">
                            {subItems.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-xs font-medium text-neutral-400 hover:text-white py-1.5 px-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-800 flex flex-col gap-3">
            {/* Store Status Toggle */}
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between px-3"} py-2 rounded-xl bg-neutral-900 border border-neutral-800`} title={isCollapsed ? (storeActive ? "Store Open" : "Store Closed") : ""}>
              <div className="flex items-center gap-2">
                <Store className={`w-4 h-4 ${storeActive ? "text-emerald-400" : "text-neutral-500"}`} />
                {!isCollapsed && <span className="text-xs font-bold text-neutral-300">Store Status</span>}
              </div>
              {!isCollapsed && (
                <button
                  onClick={() => setStoreActive(!storeActive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${storeActive ? (isCinematic ? "bg-purple-500" : "bg-amber-500") : "bg-neutral-700"}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${storeActive ? "translate-x-2" : "-translate-x-2"}`} />
                </button>
              )}
            </div>
            
            {/* View Public Site */}
            <Link
              href="/"
              className={`flex items-center ${isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"} rounded-xl text-sm font-semibold text-neutral-400 hover:bg-neutral-800/60 hover:text-white transition-all`}
              title={isCollapsed ? "View Site" : ""}
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>View Site</span>}
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 animate-fade-in relative z-10 pb-20 lg:pb-0 min-h-[50vh]">
          {/* ── TOP NOTIFICATION & OPERATIONS BAR ── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 p-3.5 sm:px-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Live Desk & Floor Stream
              </span>
              {stats?.activeChats > 0 && (
                <Link
                  href="/admin/chat"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{stats.activeChats} Active Support {stats.activeChats === 1 ? 'Chat' : 'Chats'}</span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Sound Chime Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  soundEnabled
                    ? isCinematic ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-neutral-900 border-neutral-800 text-neutral-500"
                }`}
                title={soundEnabled ? "Notification sound enabled" : "Notification sound muted"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
              </button>

              {/* Notification Center Dropdown Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                    unreadCount > 0
                      ? isCinematic ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30" : "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30"
                      : "bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:text-white hover:bg-neutral-700"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-black">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* ── NOTIFICATION DROPDOWN FLYOUT ── */}
                {isNotificationOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[9990]" 
                      onClick={() => setIsNotificationOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-[9991] w-80 sm:w-96 rounded-2xl bg-neutral-950/95 border border-neutral-800 shadow-2xl backdrop-blur-2xl p-4 animate-in fade-in zoom-in-95">
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                        <div className="flex items-center gap-2">
                          <Bell className={`w-4 h-4 ${isCinematic ? "text-purple-400" : "text-amber-500"}`} />
                          <span className="text-xs font-black uppercase tracking-wider text-white">Live Notifications</span>
                          {notifications.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-300">
                              {notifications.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[10px] font-bold text-neutral-400 hover:text-white transition"
                              title="Mark all as read"
                            >
                              Mark Read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 transition flex items-center gap-1"
                              title="Clear all"
                            >
                              <Trash2 className="w-3 h-3" />
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1 my-3 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
                        <button
                          onClick={() => setNotificationFilter("all")}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${notificationFilter === "all" ? (isCinematic ? "bg-purple-600 text-white" : "bg-amber-500 text-black") : "text-neutral-400 hover:text-white"}`}
                        >
                          All ({notifications.length})
                        </button>
                        <button
                          onClick={() => setNotificationFilter("chat")}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${notificationFilter === "chat" ? (isCinematic ? "bg-purple-600 text-white" : "bg-amber-500 text-black") : "text-neutral-400 hover:text-white"}`}
                        >
                          💬 Support ({notifications.filter(n => n.type === 'chat').length})
                        </button>
                        <button
                          onClick={() => setNotificationFilter("waiter")}
                          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${notificationFilter === "waiter" ? (isCinematic ? "bg-purple-600 text-white" : "bg-amber-500 text-black") : "text-neutral-400 hover:text-white"}`}
                        >
                          🛎️ Waiter ({notifications.filter(n => n.type === 'waiter').length})
                        </button>
                      </div>

                      {/* List */}
                      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                        {filteredNotifications.length === 0 ? (
                          <div className="text-center py-8 text-neutral-500">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs font-semibold">No notifications right now</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">Live Support messages & Waiter requests will appear here instantly.</p>
                          </div>
                        ) : (
                          filteredNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
                                if (notif.link) {
                                  setIsNotificationOpen(false);
                                  router.push(notif.link);
                                }
                              }}
                              className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                                !notif.read
                                  ? isCinematic ? "bg-purple-950/20 border-purple-500/40 hover:border-purple-500" : "bg-amber-950/20 border-amber-500/40 hover:border-amber-500"
                                  : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${!notif.read ? (notif.type === 'chat' ? 'bg-purple-400 animate-ping' : 'bg-amber-400 animate-ping') : 'bg-transparent'}`} />
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {notif.type === 'chat' ? '💬 Live Support' : '🛎️ Waiter Request'}
                                  </span>
                                </div>
                                <span className="text-[10px] text-neutral-500">{notif.time}</span>
                              </div>
                              <p className="text-[11px] font-bold text-neutral-300">
                                {notif.customerName ? notif.customerName : notif.subtitle}
                              </p>
                              <p className="text-xs text-neutral-400 line-clamp-2 bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/60">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                        <Link
                          href="/admin/chat"
                          onClick={() => setIsNotificationOpen(false)}
                          className={`font-bold hover:underline flex items-center gap-1 ${isCinematic ? "text-purple-400" : "text-amber-400"}`}
                        >
                          <span>Open Live Support Desk</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <PushNotificationBanner role="admin" className="mb-6" />
          {children}
        </main>
      </section>
    </div>
  );
}
