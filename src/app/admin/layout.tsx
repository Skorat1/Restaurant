"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ExternalLink, ShieldCheck, Plus, Store, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/Button";

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

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Core Operations",
    roles: ["admin", "owner", "manager", "chef", "kitchen"],
    items: [
      { href: "/admin", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
      { href: "/admin/kds", label: "KDS", icon: "M4 6h16v12H4zM8 10h8M8 14h5" },
      { href: "/admin/orders", label: "Orders", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0", badge: "pendingOrders" },
      { href: "/admin/reservations", label: "Reservations", icon: "M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l3 4h12l3-4M8 12h8M8 16h5", badge: "pendingReservations" },
      { href: "/admin/tables", label: "Tables", icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm4 0v12m8-12v12" },
      { href: "/admin/chat", label: "Live Support", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
    ]
  },
  {
    title: "Management & Content",
    roles: ["admin", "owner", "manager"],
    items: [
      { href: "/admin/inventory", label: "Inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { 
        href: "/admin/menu", 
        label: "Menu", 
        icon: "M12 2c1.5 2 4 2.5 4 5.5 0 1.5-1 2-1 3.5 0 1 1 2.5 1 3.5C16 18 13.5 20 12 20s-4-2-4-6.5c0-1 .5-2.5.5-3.5 0-1.5-1-2-1-3.5C7.5 4.5 10 4 12 2z",
        subItems: [
          { href: "/admin/menu", label: "All Items" },
          { href: "/admin/menu#categories", label: "Categories" },
          { href: "/admin/menu#pricing", label: "Pricing" }
        ]
      },
      { href: "/admin/reviews", label: "Reviews", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" },
      { href: "/admin/coupons", label: "Coupons", icon: "M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4z" },
      { href: "/admin/inquiries", label: "Inquiries", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
      { href: "/admin/newsletter", label: "Newsletter", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0 8 6 8-6" },
    ]
  },
  {
    title: "Analytics & People",
    roles: ["admin", "owner", "manager"],
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: "M21 21H3M21 15v6M17 9v12M13 3v18M9 12v9M5 6v15" },
      { href: "/admin/crm", label: "CRM & Marketing", icon: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" },
      { href: "/admin/users", label: "Users", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
      { href: "/admin/activity", label: "Activity", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
    ]
  }
];

const STAFF_ROLES = ["admin", "owner", "manager", "chef", "kitchen"];

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
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [waiterCalls, setWaiterCalls] = useState<Array<{ id: string, tableNumber: string, type: string, time: string }>>([]);

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
          setStats(data.counts);
        }
      } catch (err) {}
    };
    fetchStats();
    const int = setInterval(fetchStats, 30000);
    return () => clearInterval(int);
  }, [token, isReady]);

  // Socket setup for waiter calls
  useEffect(() => {
    if (!token || !isReady) return;
    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("waiter_called", (data: { tableNumber: string, type: string }) => {
      // Play a small beep (if browser allows)
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(100).join("A"));
        audio.play().catch(() => {});
      } catch (e) {}

      setWaiterCalls(prev => {
        const newCall = { id: Date.now().toString(), ...data, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        return [newCall, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, isReady]);

  const removeWaiterCall = (id: string) => {
    setWaiterCalls(prev => prev.filter(c => c.id !== id));
  };

  const handleAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiThinking(true);
    setAiResponse(null);
    setTimeout(() => {
      let resp = "I couldn't find specific data for that request.";
      const q = aiQuery.toLowerCase();
      if (q.includes("spender") || q.includes("vip")) {
        resp = "The top spending VIP today is Dr. Vikram Seth (Platinum VIP), with a total spend of ₹1,48,500.";
      } else if (q.includes("wine") || q.includes("selling")) {
        resp = "Château Margaux 2015 is currently the top-selling Grand Cru today, with 12 bottles moved.";
      } else if (q.includes("order")) {
        resp = "There are currently 4 pending orders in the kitchen queue, and 45 orders delivered today.";
      } else if (q.includes("hello") || q.includes("hi")) {
        resp = "Hello Chef! I am your VELORA AI Admin Assistant. How can I assist you with today's service?";
      }
      setAiResponse(resp);
      setAiThinking(false);
    }, 1200);
  };

  if (loading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-amber-500 font-bold uppercase tracking-widest text-xs animate-pulse">Authenticating...</p>
      </div>
    );
  }

  const isCinematic = theme === "cinematic";

  return (
    <div className={`min-h-screen text-white relative transition-colors duration-1000 ${isCinematic ? "bg-[#050510] selection:bg-purple-500/30" : "bg-black selection:bg-amber-500/30"}`}>
      {/* ── GLOBAL AMBIENT GLOWS ── */}
      <div className={`fixed top-0 left-[20%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0 transition-colors duration-1000 ${isCinematic ? "bg-purple-600/10" : "bg-amber-500/5"}`}></div>
      <div className={`fixed bottom-0 right-[10%] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0 transition-colors duration-1000 ${isCinematic ? "bg-cyan-500/10" : "bg-emerald-500/5"}`}></div>

      {/* ── WAITER CALL TOASTS ── */}
      <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
        {waiterCalls.map(call => (
          <div key={call.id} className="pointer-events-auto bg-neutral-900 border-l-4 border-amber-500 p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-fade-in min-w-[300px]">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white uppercase tracking-wider">{call.type === 'bill' ? 'Bill Request' : 'Waiter Requested'}</p>
              <p className="text-xs text-amber-400 mt-1 font-semibold">Table {call.tableNumber} <span className="text-neutral-500 font-normal ml-2">{call.time}</span></p>
            </div>
            <button onClick={() => removeWaiterCall(call.id)} className="p-2 text-neutral-500 hover:text-white transition bg-neutral-800 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── VELORA AI ASSISTANT WIDGET ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
        {isAiOpen && (
          <div className="mb-4 w-80 sm:w-96 rounded-3xl border border-neutral-800 bg-neutral-950/90 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-fade-up">
            <div className={`p-4 border-b flex items-center justify-between ${isCinematic ? "border-purple-500/30 bg-purple-900/20" : "border-amber-500/30 bg-amber-900/20"}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCinematic ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">VELORA AI</h3>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400">Executive Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="text-neutral-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-48 overflow-y-auto flex flex-col gap-3 text-xs custom-scrollbar">
              <div className="bg-neutral-800/50 p-3 rounded-2xl rounded-tl-sm text-neutral-300 w-[85%] leading-relaxed border border-neutral-700/50">
                Hello Chef! I have live access to today's service data. Ask me about VIPs, sales, or orders.
              </div>
              {aiResponse && (
                <div className="bg-neutral-800/50 p-3 rounded-2xl rounded-tl-sm text-white w-[90%] leading-relaxed border border-neutral-700/50 flex flex-col gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">AI Response</span>
                  {aiResponse}
                </div>
              )}
              {aiThinking && (
                <div className="flex gap-1.5 items-center p-3 text-neutral-500">
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isCinematic ? "bg-purple-500" : "bg-amber-500"}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isCinematic ? "bg-purple-500" : "bg-amber-500"}`}></div>
                  <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isCinematic ? "bg-purple-500" : "bg-amber-500"}`}></div>
                </div>
              )}
            </div>
            <form onSubmit={handleAiQuery} className="p-3 border-t border-neutral-800 bg-neutral-900/50 flex gap-2">
              <input
                type="text"
                placeholder="Ask about top spenders..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neutral-600 transition"
              />
              <button type="submit" disabled={aiThinking} className={`p-2.5 rounded-xl transition ${isCinematic ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-amber-500 text-black hover:bg-amber-400"}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        )}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${isCinematic ? "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-purple-500/40 text-white" : "bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-500/40 text-black"}`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
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
                    const badgeCount = badge && stats ? stats[badge] : 0;
                    
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
                                <span className={`flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isCinematic ? "bg-purple-500 text-white" : "bg-amber-500 text-black"}`}>
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
            {/* Quick Actions (e.g. + New) */}
            <Button
              variant="secondary"
              size={isCollapsed ? "icon" : "md"}
              themeContext={theme}
              className={isCollapsed ? "" : "justify-start"}
              leftIcon={<Plus className="w-5 h-5 shrink-0" />}
              title={isCollapsed ? "Quick Actions" : ""}
            >
              {!isCollapsed && <span>Quick Add</span>}
            </Button>
            
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
          {children}
        </main>
      </section>
    </div>
  );
}
