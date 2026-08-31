"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Mail,
  Users,
  Send,
  Plus,
  Search,
  Trash2,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
  Tag,
  X,
  Loader2,
  Check,
  Megaphone
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New Subscriber Form
  const [newSubForm, setNewSubForm] = useState({ email: "", name: "" });

  // Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    subject: "✨ Exclusive VIP Dining Invitation — 20% Off at VELORA",
    heading: "Secret Vintage Tasting & Seasonal Menu Preview",
    message: `Dear Patron,\n\nWe are delighted to invite you to an exclusive tasting of our new seasonal tasting menu. As a VIP member, enjoy a complimentary vintage wine pairing with voucher code VIPGUEST on your next reservation.\n\nWe look forward to serving you.`,
    offerCode: "VIPGUEST",
    ctaText: "Reserve Your VIP Table",
    ctaLink: "/reserve",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSubscribers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Add Subscriber Manually
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubForm.email) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSubForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Subscriber ${newSubForm.email} added successfully!`);
        setIsAddModalOpen(false);
        setNewSubForm({ email: "", name: "" });
        fetchSubscribers();
      } else {
        showToast(data.msg || "Failed to add subscriber");
      }
    } catch (err) {
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from the newsletter list?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Subscriber removed.");
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Error removing subscriber:", err);
    }
  };

  // Send Broadcast Email Campaign
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to broadcast this campaign to ${subscribers.length} subscribers?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(campaignForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`🚀 Campaign sent successfully to ${data.sentCount || subscribers.length} subscribers!`);
        setIsCampaignModalOpen(false);
      } else {
        showToast(data.msg || "Failed to send campaign");
      }
    } catch (err) {
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showToast("No subscribers to export");
      return;
    }

    const headers = "Name,Email,Subscribed Date\n";
    const rows = subscribers
      .map((s) => `"${s.name || ""}", "${s.email}", "${new Date(s.subscribedAt).toLocaleString()}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Subscriber list exported to CSV!");
  };

  // Filtered subscribers
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;
    const q = searchQuery.toLowerCase();
    return subscribers.filter(
      (s) => s.email?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q)
    );
  }, [subscribers, searchQuery]);

  return (
    <div className="space-y-6 pb-16 text-neutral-100 max-w-[1400px] mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Marketing &amp; Audience
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Newsletter &amp; VIP Club
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Manage subscriber database, track growth, and dispatch broadcast email campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-2xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-2xl text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subscriber</span>
          </button>

          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-2xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Megaphone className="w-4 h-4" />
            <span>Send Campaign</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Total Subscribers</span>
            <span className="text-3xl font-serif font-bold text-white mt-1 block">{subscribers.length}</span>
            <p className="text-[11px] text-emerald-400 mt-1">Active VIP Audience</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Welcome Gift Promo</span>
            <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">VIPGUEST</span>
            <p className="text-[11px] text-neutral-400 mt-1">20% VIP Dining Privilege</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Email Delivery Engine</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">Connected &amp; Ready</span>
            <p className="text-[11px] text-neutral-400 mt-1">Automated Welcome Pass</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── SEARCH & SUBSCRIBERS TABLE ── */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email or name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span>Showing {filteredSubscribers.length} of {subscribers.length} Subscribers</span>
            <button
              onClick={fetchSubscribers}
              disabled={loading}
              title="Refresh"
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-4 px-5">Subscriber</th>
                <th className="py-4 px-4">Email Address</th>
                <th className="py-4 px-4">Subscribed Date</th>
                <th className="py-4 px-4">Membership Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-neutral-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-xs">Loading subscriber audience…</p>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-neutral-500 space-y-2">
                    <Mail className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm font-semibold text-neutral-400">No subscribers found.</p>
                    <p className="text-xs text-neutral-500">
                      When visitors join the newsletter on the website, they will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => {
                  const initials = (sub.name || sub.email || "VIP")
                    .substring(0, 2)
                    .toUpperCase();

                  const dateStr = sub.subscribedAt
                    ? new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <tr key={sub._id} className="hover:bg-neutral-800/40 transition group">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">
                              {sub.name || "VIP Patron"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-neutral-300">
                        {sub.email}
                      </td>

                      <td className="py-4 px-4 text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                          {dateStr}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> VIP Active
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                          title="Remove Subscriber"
                          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-rose-950/40 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BROADCAST EMAIL CAMPAIGN MODAL ── */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative text-white animate-in fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Broadcast VIP Email Campaign</h3>
                <p className="text-xs text-neutral-400">Sending to {subscribers.length} active subscribers</p>
              </div>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Email Subject Line *</label>
                <input
                  required
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Email Heading / Banner Title</label>
                <input
                  value={campaignForm.heading}
                  onChange={(e) => setCampaignForm({ ...campaignForm, heading: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Message Body *</label>
                <textarea
                  rows={5}
                  required
                  value={campaignForm.message}
                  onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-white focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Promo / Voucher Code</label>
                  <input
                    value={campaignForm.offerCode}
                    onChange={(e) => setCampaignForm({ ...campaignForm, offerCode: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">CTA Button Text</label>
                  <input
                    value={campaignForm.ctaText}
                    onChange={(e) => setCampaignForm({ ...campaignForm, ctaText: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">CTA Button Link</label>
                  <input
                    value={campaignForm.ctaLink}
                    onChange={(e) => setCampaignForm({ ...campaignForm, ctaLink: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || subscribers.length === 0}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Broadcasting to {subscribers.length} Subscribers…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Send Campaign to All ({subscribers.length})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD SUBSCRIBER MANUALLY MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Add Newsletter Subscriber</h3>
                <p className="text-xs text-neutral-400">Enroll new patron into the VIP club</p>
              </div>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Subscriber Full Name (Optional)</label>
                <input
                  placeholder="e.g. James Bond"
                  value={newSubForm.name}
                  onChange={(e) => setNewSubForm({ ...newSubForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newSubForm.email}
                  onChange={(e) => setNewSubForm({ ...newSubForm, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {actionLoading ? "Saving…" : "Add Subscriber"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
