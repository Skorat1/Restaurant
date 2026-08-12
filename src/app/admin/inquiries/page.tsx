"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "Pending" | "Confirmed" | "Declined";
  notes: string;
  adminReply: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminInquiries() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState("");

  const fetchInquiries = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInquiries(await res.json());
      else setError("Failed to load inquiries.");
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, [token]); // eslint-disable-line

  const [emailSent, setEmailSent] = useState<Record<string, boolean>>({});

  const handleStatusChange = async (id: string, newStatus: "Confirmed" | "Declined") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries((prev) => prev.map((i) => i._id === id ? data.inquiry : i));
        setEmailSent((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => setEmailSent((prev) => ({ ...prev, [id]: false })), 4000);
      } else {
        alert(data.msg || "Failed to update status.");
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

  const sendReply = async (inquiry: Inquiry) => {
    const reply = replyText[inquiry._id]?.trim();
    if (!reply) return;
    setSending(inquiry._id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/${inquiry._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries((prev) => prev.map((i) => i._id === inquiry._id ? data.inquiry : i));
        setReplyText((prev) => ({ ...prev, [inquiry._id]: "" }));
        setReplyOpen((prev) => ({ ...prev, [inquiry._id]: false }));
      } else {
        alert(data.msg || "Failed to send reply.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setSending("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-2 text-3xl font-serif text-white">Table Inquiries</h1>
          <p className="mt-2 text-neutral-400">Manage, confirm, and reply to guest requests.</p>
        </div>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-mono shrink-0">
          Total Requests: {inquiries.length}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {inquiries.length === 0 ? (
          <p className="text-neutral-500 text-center py-10">No inquiries recorded yet.</p>
        ) : (
          inquiries.map((inquiry) => (
            <div
              key={inquiry._id}
              className={`p-6 bg-neutral-900/60 border rounded-2xl transition flex flex-col gap-4 ${
                inquiry.status === "Confirmed"
                  ? "border-emerald-500/30"
                  : inquiry.status === "Declined"
                  ? "border-rose-500/30"
                  : "border-neutral-800"
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-medium text-lg text-white">{inquiry.name}</h3>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="text-xs font-mono text-amber-400 hover:underline"
                    >
                      {inquiry.email}
                    </a>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                      inquiry.status === "Confirmed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : inquiry.status === "Declined"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {inquiry.status}
                    </span>
                    {inquiry.adminReply && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-sky-500/10 text-sky-400">
                        Replied
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-300 font-light leading-relaxed">
                    &ldquo;{inquiry.message}&rdquo;
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Submitted: {new Date(inquiry.createdAt).toLocaleString()}
                  </p>
                  {emailSent[inquiry._id] && (
                    <p className="text-[11px] text-emerald-400 font-medium">✅ Email sent to {inquiry.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {inquiry.status === "Pending" && (
                    <>
                      <button
                        onClick={() => handleStatusChange(inquiry._id, "Confirmed")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(inquiry._id, "Declined")}
                        className="px-4 py-2 bg-neutral-800 hover:bg-rose-950 hover:text-rose-400 text-neutral-400 font-medium text-xs rounded-xl transition border border-neutral-700"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setReplyOpen((prev) => ({ ...prev, [inquiry._id]: !prev[inquiry._id] }))}
                    className="px-4 py-2 bg-neutral-800 hover:bg-amber-500/10 hover:text-amber-400 text-neutral-300 font-medium text-xs rounded-xl transition border border-neutral-700"
                  >
                    {replyOpen[inquiry._id] ? "Cancel" : inquiry.adminReply ? "Edit Reply" : "Reply"}
                  </button>
                </div>
              </div>

              {/* Existing reply */}
              {inquiry.adminReply && !replyOpen[inquiry._id] && (
                <div className="rounded-xl bg-sky-500/5 border border-sky-500/20 px-4 py-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-sky-400 font-semibold">Admin Reply</p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">{inquiry.adminReply}</p>
                  {inquiry.repliedAt && (
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Sent: {new Date(inquiry.repliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Reply box */}
              {replyOpen[inquiry._id] && (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    placeholder={`Write your reply to ${inquiry.name}…`}
                    value={replyText[inquiry._id] || inquiry.adminReply || ""}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [inquiry._id]: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-neutral-500">
                      Will be emailed to <span className="text-amber-400">{inquiry.email}</span>
                    </p>
                    <button
                      onClick={() => sendReply(inquiry)}
                      disabled={sending === inquiry._id || !replyText[inquiry._id]?.trim()}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl transition disabled:opacity-50"
                    >
                      {sending === inquiry._id ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
