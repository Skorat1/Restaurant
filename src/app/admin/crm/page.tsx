"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Users, Sparkles, Send, Gift, Calendar, Megaphone, Crown, Cake, Filter, Activity, Smartphone, CheckCircle, BarChart3, Clock, PlayCircle } from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

type Tab = "segments" | "workflows" | "broadcast" | "analytics";
type CampaignType = "promo" | "retention" | "vip" | "birthday";

export default function CRMPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("segments");

  // Segment State
  const [segments, setSegments] = useState<any[]>([]);
  const [filters, setFilters] = useState({ minSpend: "", minVisits: "", daysSinceLastVisit: "", tier: "" });
  const [audienceCount, setAudienceCount] = useState(0);

  // Workflow State
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  // Broadcast State
  const [campaignType, setCampaignType] = useState<CampaignType>("promo");
  const [promoMessage, setPromoMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const campaignConfig = {
    promo: { label: "Promotional", icon: <Megaphone className="w-4 h-4" />, placeholder: "e.g., Get 20% off our new Truffle Pasta this weekend! Show this message to claim." },
    retention: { label: "Retention", icon: <Users className="w-4 h-4" />, placeholder: "e.g., We miss you! Enjoy a complimentary dessert on your next visit with code COMEBACK." },
    vip: { label: "VIP Only", icon: <Crown className="w-4 h-4" />, placeholder: "e.g., Exclusive early access to our Chef's Tasting Menu for our Platinum VIPs." },
    birthday: { label: "Birthday", icon: <Cake className="w-4 h-4" />, placeholder: "e.g., Happy Birthday month! Celebrate with us and receive a complimentary champagne bottle." },
  };

  const fetchSegments = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE_URL}/api/crm/segments?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.users) setAudienceCount(data.count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'segments') fetchSegments();
  }, [filters, activeTab]);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoMessage) return;
    setIsSending(true);
    setSuccessMsg("");
    try {
      await new Promise(r => setTimeout(r, 1500));
      setSuccessMsg(`Campaign successfully dispatched to the targeted audience!`);
      setPromoMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-amber-500" /> Advanced CRM & Marketing
        </h1>
        <p className="text-neutral-400 mt-2 text-sm sm:text-base">Engage with your customers through automated WhatsApp journeys and targeted segments.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-4 mb-8 custom-scrollbar pb-2">
        {[
          { id: "segments", label: "Audience Segments", icon: <Filter className="w-4 h-4" /> },
          { id: "workflows", label: "Automated Workflows", icon: <Sparkles className="w-4 h-4" /> },
          { id: "broadcast", label: "Live Broadcast", icon: <Megaphone className="w-4 h-4" /> },
          { id: "analytics", label: "ROI Analytics", icon: <BarChart3 className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${activeTab === t.id
                ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-white"
              }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: SEGMENTS */}
      {activeTab === "segments" && (
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-500" /> Segment Builder
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Min Lifetime Spend (₹)</label>
                <input type="number" className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" placeholder="e.g. 50000" value={filters.minSpend} onChange={e => setFilters({ ...filters, minSpend: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Lapsed Days (No Visit Since)</label>
                <input type="number" className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" placeholder="e.g. 60" value={filters.daysSinceLastVisit} onChange={e => setFilters({ ...filters, daysSinceLastVisit: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Loyalty Tier</label>
                <select className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors" value={filters.tier} onChange={e => setFilters({ ...filters, tier: e.target.value })}>
                  <option value="">Any Tier</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum VIP</option>
                </select>
              </div>
            </div>
            <button className="w-full mt-6 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-colors">
              Save as Smart Cohort
            </button>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
            <h3 className="text-5xl font-mono font-bold text-white mb-2">{audienceCount}</h3>
            <p className="text-neutral-400 font-bold tracking-wide uppercase text-sm">Matching Audience Size</p>
            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <p className="text-xs text-emerald-400">Target this segment in Live Broadcasts or trigger an automated Workflow for them.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WORKFLOWS */}
      {activeTab === "workflows" && (
        <div className="animate-fade-in-up">
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" /> Automation Canvas
              </h2>
              <button className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-500 hover:text-white transition-colors">
                + Create Workflow
              </button>
            </div>

            {/* Node Graph Mockup */}
            <div className="relative border-2 border-dashed border-neutral-800 rounded-3xl p-8 flex flex-col items-center min-h-[400px] bg-neutral-950/30 overflow-x-auto custom-scrollbar">
              {/* Trigger Node */}
              <div className="bg-neutral-900 border border-sky-500/50 rounded-2xl p-4 w-64 shadow-xl z-10">
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest mb-1">Trigger</p>
                <p className="text-white text-sm font-bold flex items-center gap-2"><Crown className="w-4 h-4 text-sky-500" /> Lapsed Platinum VIP (60d)</p>
              </div>

              {/* Edge */}
              <div className="w-0.5 h-12 bg-sky-500/30"></div>

              {/* Action Node 1 */}
              <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-4 w-64 shadow-xl z-10">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Action • WhatsApp</p>
                <p className="text-white text-sm font-bold flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-500" /> Send Interactive Catalog (Free Vintage Champagne)</p>
              </div>

              {/* Edge */}
              <div className="w-0.5 h-12 bg-neutral-800"></div>

              {/* Condition Node */}
              <div className="bg-neutral-900 border border-amber-500/50 rounded-2xl p-4 w-64 shadow-xl z-10 text-center">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Wait 48 Hours</p>
                <p className="text-white text-sm font-bold"><Clock className="w-4 h-4 text-amber-500 inline-block mr-1" /> Check Reservation</p>
              </div>

              {/* Branching Edges */}
              <div className="flex w-64 mt-2 justify-between px-12">
                <div className="w-0.5 h-8 bg-neutral-800 transform -rotate-[30deg]"></div>
                <div className="w-0.5 h-8 bg-neutral-800 transform rotate-[30deg]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BROADCAST & WHATSAPP PREVIEW */}
      {activeTab === "broadcast" && (
        <div className="grid lg:grid-cols-12 gap-8 items-start animate-fade-in-up">
          <div className="lg:col-span-8 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Megaphone className="w-5 h-5 text-amber-500" /> WhatsApp Campaign Broadcast
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 relative z-10">
              {(Object.keys(campaignConfig) as CampaignType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setCampaignType(type)}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl transition-all duration-300 ${campaignType === type
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 border shadow-inner"
                      : "bg-neutral-950/50 border-neutral-800 border text-neutral-500 hover:text-white hover:bg-neutral-800"
                    }`}
                >
                  {campaignConfig[type].icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{campaignConfig[type].label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSendCampaign} className="relative z-10 space-y-6">
              <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 flex flex-col shadow-inner">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Message Body (Supports WhatsApp Formatting)</label>
                <textarea
                  className="w-full h-32 bg-transparent text-white text-sm resize-none outline-none placeholder-neutral-700 custom-scrollbar"
                  placeholder={campaignConfig[campaignType].placeholder}
                  value={promoMessage}
                  onChange={(e) => setPromoMessage(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Interactive Buttons Config */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2"><PlayCircle className="w-3 h-3" /> Interactive Buttons</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <input type="text" className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white" value="Reserve Table" readOnly />
                  <input type="text" className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white" value="View Menu" readOnly />
                </div>
              </div>

              <button type="submit" disabled={isSending} className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-extrabold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs">
                {isSending ? "Dispatching..." : "Launch Campaign"}
              </button>
            </form>
          </div>

          {/* Right Column: Live WhatsApp Preview */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center bg-neutral-950/50 rounded-[2rem] border border-neutral-800 p-6 lg:sticky lg:top-24 mt-8 lg:mt-0">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Live Template Preview</span>
            <div className="w-[280px] h-[550px] bg-[#efeae2] border-[8px] border-neutral-900 rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden">
              <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 z-10 shadow-md">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="https://ui-avatars.com/api/?name=V&background=f59e0b&color=fff" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">VELORA</h3>
                  <p className="text-[10px] text-white/70">Official Business Account</p>
                </div>
              </div>
              <div className="flex-1 relative p-4 overflow-y-auto flex flex-col justify-end">
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                <div className="bg-white rounded-xl p-3 text-[13px] text-neutral-800 shadow-sm relative max-w-full whitespace-pre-wrap leading-relaxed self-start border border-black/5 animate-fade-in-up">
                  <span className="font-bold text-[#075e54] text-xs block mb-1">VELORA</span>
                  {promoMessage || campaignConfig[campaignType].placeholder}

                  {/* WhatsApp Interactive Buttons */}
                  <div className="mt-3 border-t border-neutral-100 pt-2 flex flex-col gap-2">
                    <button className="w-full text-[#00a884] font-semibold text-sm flex items-center justify-center gap-2 py-1.5"><Calendar className="w-4 h-4" /> Reserve Table</button>
                    <div className="h-px w-full bg-neutral-100"></div>
                    <button className="w-full text-[#00a884] font-semibold text-sm flex items-center justify-center gap-2 py-1.5"><Sparkles className="w-4 h-4" /> View Menu</button>
                  </div>

                  <div className="absolute bottom-1 right-2 text-[10px] text-neutral-400">9:41 AM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROI ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-fade-in-up">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Total Attributed Revenue</p>
              <h3 className="text-4xl font-mono font-bold text-white mb-2">₹1,24,500</h3>
              <p className="text-emerald-400 text-xs font-bold flex items-center gap-1"><Activity className="w-3 h-3" /> +12% vs last month</p>
            </div>
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-6 rounded-[2rem] shadow-2xl">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Coupons Redeemed</p>
              <h3 className="text-4xl font-mono font-bold text-white">412</h3>
            </div>
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-6 rounded-[2rem] shadow-2xl">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Message Open Rate</p>
              <h3 className="text-4xl font-mono font-bold text-white">68%</h3>
            </div>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-8 rounded-[2rem] shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6">Recent Campaign Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-xs uppercase tracking-widest text-neutral-500">
                    <th className="pb-4 font-bold">Campaign</th>
                    <th className="pb-4 font-bold">Sent</th>
                    <th className="pb-4 font-bold">Read Rate</th>
                    <th className="pb-4 font-bold">Bookings</th>
                    <th className="pb-4 font-bold text-emerald-400">Revenue (₹)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                    <td className="py-4 font-bold text-white">Platinum VIP Tasting Invite</td>
                    <td className="py-4 text-neutral-300">45</td>
                    <td className="py-4 text-sky-400 font-mono">92%</td>
                    <td className="py-4 text-neutral-300">18</td>
                    <td className="py-4 text-emerald-400 font-bold font-mono">₹75,000</td>
                  </tr>
                  <tr className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors">
                    <td className="py-4 font-bold text-white">Weekend Promo Drop</td>
                    <td className="py-4 text-neutral-300">850</td>
                    <td className="py-4 text-sky-400 font-mono">45%</td>
                    <td className="py-4 text-neutral-300">34</td>
                    <td className="py-4 text-emerald-400 font-bold font-mono">₹49,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
