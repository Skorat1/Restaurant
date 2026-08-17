"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, ExternalLink, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/admin/analytics", label: "Analytics", icon: "M3 3v18h18M18 9l-5 5-4-4-5 5" },
  { href: "/admin/kds", label: "KDS", icon: "M4 6h16v12H4zM8 10h8M8 14h5" },
  { href: "/admin/orders", label: "Orders", icon: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" },
  { href: "/admin/reservations", label: "Reservations", icon: "M3 4h18M3 4v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4M3 4l3 4h12l3-4M8 12h8M8 16h5" },
  { href: "/admin/menu", label: "Menu", icon: "M12 2c1.5 2 4 2.5 4 5.5 0 1.5-1 2-1 3.5 0 1 1 2.5 1 3.5C16 18 13.5 20 12 20s-4-2-4-6.5c0-1 .5-2.5.5-3.5 0-1.5-1-2-1-3.5C7.5 4.5 10 4 12 2z" },
  { href: "/admin/reviews", label: "Reviews", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" },
  { href: "/admin/coupons", label: "Coupons", icon: "M20 12V8H6a2 2 0 0 1 0-4h12v4M4 6v12a2 2 0 0 0 2 2h14v-4M18 12a2 2 0 0 0 0 4h4v-4z" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 0 8 6 8-6" },
  { href: "/admin/users", label: "Users", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/tables", label: "Tables", icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm4 0v12m8-12v12" },
  { href: "/admin/activity", label: "Activity", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
];

const STAFF_ROLES = ["admin", "owner", "manager", "chef", "kitchen"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isReady = !loading && !!token && STAFF_ROLES.includes(user?.role || "");

  const [theme, setTheme] = useState<"classic" | "cinematic">("classic");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/login");
      } else if (user && !STAFF_ROLES.includes(user.role || "")) {
        router.replace("/");
      }
    }
  }, [loading, token, user, router]);

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

      <section className="mx-auto max-w-[1600px] px-3 sm:px-6 py-4 sm:py-8 relative z-10">
        
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-neutral-900/60 backdrop-blur-2xl p-4 rounded-2xl border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl bg-neutral-800/80 text-neutral-300 hover:text-white border border-neutral-700/50 hover:bg-neutral-700 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${isCinematic ? "text-purple-400" : "text-amber-500"}`} />
              {NAV_ITEMS.find((n) => n.href === pathname)?.label || "Admin Panel"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-10 lg:grid-cols-[260px_1fr]">
          
          {/* Mobile Sidebar Overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`fixed inset-0 bg-black/60 backdrop-blur-md z-[9998] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          />

          {/* Sidebar Navigation */}
          <aside className={`fixed lg:sticky top-0 left-0 h-full lg:h-[calc(100vh-4rem)] lg:top-8 w-[280px] lg:w-auto z-[9999] lg:z-10 bg-neutral-950/90 lg:bg-neutral-900/40 backdrop-blur-3xl border-r lg:border border-neutral-800/80 lg:rounded-3xl p-5 flex flex-col justify-between shadow-2xl transition-transform duration-500 ease-out lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto custom-scrollbar`}>
            
            <div>
              {/* Profile Section & Theme Toggle */}
              <div className="flex flex-col gap-4 px-2 py-4 mb-4">
                <div className="flex items-center justify-between relative group">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg ${isCinematic ? "bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-purple-500/30" : "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-amber-500/30 font-black"}`}>
                      {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className={`text-[10px] uppercase tracking-widest font-black mt-0.5 ${isCinematic ? "text-cyan-400" : "text-amber-400"}`}>Admin Ops</p>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 rounded-xl bg-neutral-800/80 text-neutral-400 hover:text-white border border-neutral-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Cinematic Toggle */}
                <button
                  onClick={() => setTheme(t => t === "classic" ? "cinematic" : "classic")}
                  className={`w-full py-2 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${isCinematic ? "border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20" : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {isCinematic ? "Cinematic Mode On" : "Classic Mode"}
                </button>
              </div>

              {/* Navigation Stack */}
              <nav className="flex flex-col gap-2 border-t border-neutral-800/60 pt-4">
                {NAV_ITEMS.map(({ href, label, icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 shrink-0 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 group ${
                        active
                          ? isCinematic 
                              ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]"
                          : "text-neutral-400 hover:bg-neutral-800/60 hover:text-white hover:scale-[1.01]"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${active ? "bg-black/10" : "bg-neutral-800/50 group-hover:bg-neutral-700/50 group-hover:text-white"}`}>
                        <svg className={`w-4 h-4 shrink-0 ${active && !isCinematic ? "text-black" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={icon} />
                        </svg>
                      </div>
                      <span className="tracking-wide">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800/60">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-neutral-400 hover:bg-neutral-800/60 hover:text-white hover:border-neutral-700 border border-transparent transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-neutral-800/50 group-hover:bg-neutral-700/50 transition-colors">
                  <ExternalLink className="w-4 h-4 group-hover:text-sky-400 transition-colors" />
                </div>
                View Public Site
              </Link>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="min-h-[50vh] lg:max-w-[calc(100vw-340px)] animate-fade-in relative z-10 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </section>
    </div>
  );
}
