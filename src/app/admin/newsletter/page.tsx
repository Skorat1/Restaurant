"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const { token } = useAuth();
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const fetchSubs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/newsletter`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setSubs(await res.json());
        } else {
          setError("Failed to load subscribers.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [token]);

  const removeSub = async (id: string) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSubs((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
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
      <div className="mb-8">
        <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
        <h1 className="mt-2 text-3xl font-serif text-white">Newsletter Subscribers</h1>
        <p className="mt-2 text-neutral-400">Manage email subscribers.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <p className="text-sm text-neutral-400">
            <span className="font-semibold text-white">{subs.length}</span> subscribers
          </p>
        </div>

        {subs.length === 0 ? (
          <p className="p-12 text-center text-neutral-500 text-sm">No subscribers yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {subs.map((sub) => (
              <li key={sub._id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold text-amber-400 shrink-0">
                    {(sub.name || sub.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{sub.email}</p>
                    <p className="text-xs text-neutral-500">Subscribed {formatDate(sub.subscribedAt)}{sub.name ? ` · ${sub.name}` : ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeSub(sub._id)}
                  className="shrink-0 rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

