"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

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
  const [working, setWorking] = useState("");

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
    if (!confirm("Delete this review?")) return;
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

  const filtered = filter === "All" ? reviews : reviews.filter((r) => r.status === filter);

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";
    switch (status) {
      case "Approved": return `${base} bg-emerald-500/15 text-emerald-300`;
      case "Rejected": return `${base} bg-red-500/15 text-red-300`;
      default: return `${base} bg-amber-500/15 text-amber-300`;
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

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
          <h1 className="mt-2 text-3xl font-serif text-white">Reviews & Feedback</h1>
          <p className="mt-2 text-neutral-400">Moderate customer reviews and respond to feedback.</p>
        </div>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-mono shrink-0">
          Total Reviews: {reviews.length}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === s
                ? "bg-amber-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {s}
            {s !== "All" && (
              <span className="ml-1.5 opacity-60">
                {reviews.filter((r) => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          No reviews {filter !== "All" ? `with status "${filter}"` : "yet"}.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review._id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold text-amber-400 shrink-0">
                      {review.userName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{review.userName}</p>
                      <p className="text-xs text-neutral-500">{review.menuItemName} · {formatDate(review.createdAt)}</p>
                    </div>
                    <span className="text-amber-400">{"★".repeat(review.rating)}<span className="text-neutral-600">{"★".repeat(5 - review.rating)}</span></span>
                    <span className={statusBadge(review.status)}>{review.status}</span>
                  </div>

                  <p className="mt-3 text-sm text-neutral-300 leading-6">&ldquo;{review.comment}&rdquo;</p>

                  {review.adminReply && (
                    <div className="mt-3 rounded-xl bg-neutral-950/70 border border-amber-500/20 p-3">
                      <p className="text-xs font-semibold text-amber-400 mb-1">Your response</p>
                      <p className="text-xs text-neutral-400 leading-5">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Reply box */}
                  <div className="mt-3 flex gap-2">
                    <input
                      key={review.adminReply + review._id}
                      defaultValue={review.adminReply}
                      id={`reply-${review._id}`}
                      placeholder="Write a reply…"
                      className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`reply-${review._id}`) as HTMLInputElement;
                        updateReview(review._id, { adminReply: input.value });
                      }}
                      disabled={working === review._id}
                      className="rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {review.status !== "Approved" && (
                    <button
                      onClick={() => updateReview(review._id, { status: "Approved" })}
                      disabled={working === review._id}
                      className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/25 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "Rejected" && (
                    <button
                      onClick={() => updateReview(review._id, { status: "Rejected" })}
                      disabled={working === review._id}
                      className="rounded-full bg-red-500/15 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/25 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={working === review._id}
                    className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

