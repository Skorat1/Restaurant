"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Log {
  _id: string;
  name: string;
  email: string;
  role: string;
  action: "login" | "logout" | "signup";
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const ACTION_STYLES = {
  login:  { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Login" },
  logout: { bg: "bg-red-500/10 text-red-400 border-red-500/20",            label: "Logout" },
  signup: { bg: "bg-sky-500/10 text-sky-400 border-sky-500/20",            label: "Signup" },
};

export default function AdminActivity() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "login" | "logout" | "signup">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/admin/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject("Failed to load activity logs."))
      .then(setLogs)
      .catch((e) => setError(typeof e === "string" ? e : "Unable to reach the server."))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = logs.filter((l) => {
    const matchAction = filter === "all" || l.action === filter;
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const formatTime = (d: string) =>
    new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const counts = {
    login:  logs.filter((l) => l.action === "login").length,
    logout: logs.filter((l) => l.action === "logout").length,
    signup: logs.filter((l) => l.action === "signup").length,
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-2 text-3xl font-serif text-white">User Activity</h1>
          <p className="mt-2 text-neutral-400">Track who logged in, logged out, and signed up.</p>
        </div>
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-mono shrink-0">
          Total Events: {logs.length}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{counts.login}</p>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Logins</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{counts.logout}</p>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Logouts</p>
        </div>
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-center">
          <p className="text-2xl font-bold text-sky-400">{counts.signup}</p>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wide">Signups</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {(["all", "login", "logout", "signup"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition capitalize ${
                filter === f
                  ? "bg-amber-500 text-black"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-white outline-none focus:border-amber-500"
        />
      </div>

      {/* Logs table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          No activity logs found.
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">User</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Role</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Action</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">Time</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider text-neutral-500 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filtered.map((log) => {
                  const style = ACTION_STYLES[log.action];
                  return (
                    <tr key={log._id} className="hover:bg-neutral-800/30 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-white">{log.name}</p>
                        <p className="text-xs text-neutral-500">{log.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${
                          log.role === "admin"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-neutral-700/40 text-neutral-400 border-neutral-700"
                        }`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${style.bg}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-neutral-400 text-xs font-mono whitespace-nowrap">
                        {formatTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 text-xs font-mono">
                        {log.ip || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
