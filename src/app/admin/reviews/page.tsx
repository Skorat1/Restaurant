"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { Search, ChevronLeft, ChevronRight, Star, CheckCircle2, XCircle, MessageSquare, Trash2 } from "lucide-react";

interface Review {
  _id: string;
  userName: string;
  menuItemName: string;
  rating: number;
  comment: string;
  serviceRating?: number;
  status: "Pending" | "Approved" | "Rejected";
  adminReply: string;
  createdAt: string;
}

export default function AdminReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [working, setWorking] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!token) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setReviews(await res.json());
        } else {
          setError("Failed to load reviews.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  const updateReview = async (id: string, data: Record<string, unknown>) => {
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setReviews((prev) => prev.map((r) => (r._id === id ? result.review : r)));
      } else {
        const result = await res.json();
        alert(result.msg || "Failed to update review.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this customer review permanently?")) return;
    setWorking(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  // Search & Filter Logic
  const filtered = reviews.filter((r) => {
    const matchesStatus = filter === "All" || r.status === filter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.userName?.toLowerCase().includes(q) ||
      r.menuItemName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedReviews = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border";
    switch (status) {
      case "Approved": return `${base} bg-emerald-500/15 border-emerald-500/30 text-emerald-300`;
      case "Rejected": return `${base} bg-red-500/15 border-red-500/30 text-red-300`;
      default: return `${base} bg-amber-500/15 border-amber-500/30 text-amber-300`;
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Reputation Management
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Reviews &amp; Guest Feedback</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Moderate public customer reviews, inspect star ratings, and reply to guest comments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-white font-bold">{avgRating} Avg Rating</span>
            <span className="text-neutral-500">({reviews.length} total)</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-200">
          {error}
        </div>
      )}

      {/* ── SEARCH & FILTER BAR ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by customer name, dish, or comment content..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {["All", "Pending", "Approved", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === s
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1 opacity-70">
                  ({reviews.filter((r) => r.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── REVIEWS DATA LIST ───────────────────────────────────────────── */}
      {paginatedReviews.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-2">
          <MessageSquare className="w-10 h-10 mx-auto text-neutral-600" />
          <p className="text-sm font-semibold">No reviews matching filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <div key={review._id} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-5 sm:p-6 transition hover:border-neutral-700 shadow-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300 shrink-0">
                      {review.userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{review.userName}</p>
                      <p className="text-xs text-neutral-400">
                        <span className="text-amber-400 font-semibold">{review.menuItemName}</span> · {formatDate(review.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs font-bold">
                      {"★".repeat(review.rating)}
                      <span className="text-neutral-600">{"★".repeat(5 - review.rating)}</span>
                    </div>

                    <span className={statusBadge(review.status)}>{review.status}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
                    &ldquo;{review.comment}&rdquo;
                  </p>

                  {review.adminReply && (
                    <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3.5 space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Staff Response:</p>
                      <p className="text-xs text-neutral-300">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Inline Staff Response Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      key={review.adminReply + review._id}
                      defaultValue={review.adminReply}
                      id={`reply-${review._id}`}
                      placeholder="Write a public staff reply…"
                      className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs text-white outline-none focus:border-amber-500 transition"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`reply-${review._id}`) as HTMLInputElement;
                        updateReview(review._id, { adminReply: input.value });
                      }}
                      disabled={working === review._id}
                      className="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition shrink-0"
                    >
                      Save Response
                    </button>
                  </div>
                </div>

                {/* 1-Click Moderation Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {review.status !== "Approved" && (
                    <button
                      onClick={() => updateReview(review._id, { status: "Approved" })}
                      disabled={working === review._id}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition"
                    >
                      Approve Review
                    </button>
                  )}
                  {review.status !== "Rejected" && (
                    <button
                      onClick={() => updateReview(review._id, { status: "Rejected" })}
                      disabled={working === review._id}
                      className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-500/25 transition"
                    >
                      Reject Review
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={working === review._id}
                    className="p-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-red-400 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION CONTROLS ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs">
          <span className="text-neutral-400 font-medium">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


