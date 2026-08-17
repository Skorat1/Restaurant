"use client";
import { useState } from "react";
import { MessageSquare, Users, Sparkles, Send, Gift, Calendar, Megaphone, Crown, Cake } from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

type CampaignType = "promo" | "retention" | "vip" | "birthday";

export default function CRMPage() {
  const { token } = useAuth();
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

  // Extract a preview message to show in the phone mockup
  const previewText = promoMessage || campaignConfig[campaignType].placeholder;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-amber-500" /> CRM & Marketing
        </h1>
        <p className="text-neutral-400 mt-2 text-sm sm:text-base">Engage with your customers through automated WhatsApp messaging and targeted broadcasts.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Stats & Triggers (STICKY) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" /> Audience Insights
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
                <span className="text-xs font-bold text-neutral-300">Total Contacts</span>
                <span className="font-mono text-white font-bold">1,204</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-950/20 border border-emerald-900/30">
                <span className="text-xs font-bold text-emerald-500">Active (Ordered &lt; 30 days)</span>
                <span className="font-mono text-emerald-400 font-bold">412</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-amber-950/20 border border-amber-900/30">
                <span className="text-xs font-bold text-amber-500">At Risk (No orders &gt; 90 days)</span>
                <span className="font-mono text-amber-400 font-bold">289</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-2xl bg-purple-950/20 border border-purple-900/30">
                <span className="text-xs font-bold text-purple-500">Platinum VIPs</span>
                <span className="font-mono text-purple-400 font-bold">45</span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 shadow-2xl">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Active Automations
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
                <Calendar className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Booking Confirmations</p>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">Triggers immediately when a reservation is confirmed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-950/50 border border-neutral-800">
                <MessageSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Post-Dining Feedback</p>
                  <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">Triggers 1 hour after an order is marked as Delivered.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Campaign Builder */}
        <div className="lg:col-span-8">
          <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
              <Megaphone className="w-5 h-5 text-amber-500" /> New Broadcast Campaign
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 relative z-10">
              {(Object.keys(campaignConfig) as CampaignType[]).map((type) => (
                <button 
                  key={type}
                  onClick={() => setCampaignType(type)}
                  className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl transition-all duration-300 ${
                    campaignType === type 
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 border shadow-inner" 
                      : "bg-neutral-950/50 border-neutral-800 border text-neutral-500 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {campaignConfig[type].icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{campaignConfig[type].label}</span>
                </button>
              ))}
            </div>

            {successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold animate-fade-in relative z-10">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSendCampaign} className="relative z-10 grid lg:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 flex flex-col shadow-inner">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Message Body</label>
                  <textarea 
                    className="w-full h-40 bg-transparent text-white text-sm resize-none outline-none placeholder-neutral-700 custom-scrollbar"
                    placeholder={campaignConfig[campaignType].placeholder}
                    value={promoMessage}
                    onChange={(e) => setPromoMessage(e.target.value)}
                    maxLength={500}
                  />
                  <div className="text-right text-[10px] text-neutral-600 mt-2 font-mono">
                    {promoMessage.length}/500 chars
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
                  <Gift className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Variables like <strong className="text-amber-400">{"{customer_name}"}</strong> will be dynamically replaced when the message is sent. Ensure you have explicit opt-in for marketing messages.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isSending || !promoMessage}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-black font-extrabold px-8 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Launch Campaign
                    </>
                  )}
                </button>
              </div>

              {/* Live WhatsApp Preview */}
              <div className="hidden sm:flex flex-col items-center justify-center bg-neutral-950/50 rounded-2xl border border-neutral-800 p-6">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">Live Preview</span>
                
                {/* Phone Frame */}
                <div className="w-[280px] h-[550px] bg-neutral-900 border-4 border-neutral-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Status Bar Mock */}
                  <div className="h-6 w-full flex items-center justify-between px-6 pt-1 text-[10px] text-white/80 bg-[#075e54] z-10 font-medium">
                    <span>9:41</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="w-3 h-2.5 bg-white/80 rounded-[2px]" />
                      <div className="w-4 h-2.5 bg-white/80 rounded-[2px]" />
                    </div>
                  </div>
                  
                  {/* WhatsApp Header */}
                  <div className="bg-[#075e54] text-white p-3 flex items-center gap-3 z-10 shadow-md">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                      <img src="https://ui-avatars.com/api/?name=V&background=f59e0b&color=fff" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">VELORA</h3>
                      <p className="text-[10px] text-white/70">Official Business Account</p>
                    </div>
                  </div>
                  
                  {/* Chat Background */}
                  <div className="flex-1 bg-[#efeae2] relative p-4 overflow-y-auto flex flex-col justify-end">
                    {/* Background pattern via CSS */}
                    <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                    
                    {/* Message Bubble */}
                    <div className="bg-white rounded-xl rounded-tl-sm p-2.5 pb-5 text-[13px] text-neutral-800 shadow-sm relative max-w-[90%] whitespace-pre-wrap leading-relaxed self-start border border-black/5 animate-fade-in-up">
                      <span className="font-bold text-[#075e54] text-xs block mb-1">VELORA</span>
                      {previewText.replace('{customer_name}', 'Vikram')}
                      <div className="absolute bottom-1 right-2 text-[10px] text-neutral-400 flex items-center gap-1">
                        9:41 AM
                      </div>
                    </div>
                  </div>
                  
                  {/* WhatsApp Input Mock */}
                  <div className="bg-[#f0f0f0] p-2 flex items-center gap-2">
                    <div className="flex-1 bg-white rounded-full h-9 flex items-center px-4 text-[13px] text-neutral-400">
                      Message
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#00897b] flex items-center justify-center shrink-0">
                      <div className="w-4 h-4 border-t-2 border-r-2 border-white transform rotate-45 -translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
