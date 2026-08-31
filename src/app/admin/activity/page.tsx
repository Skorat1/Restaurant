"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Shield,
  Search,
  RefreshCw,
  Trash2,
  Download,
  Calendar,
  Clock,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Globe,
  Laptop,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  Copy,
  Eye,
  X,
  Fingerprint
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface ActivityLogItem {
  _id: string;
  user?: string;
  name: string;
  email: string;
  role: string;
  action: string;
  details?: string;
  deviceId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

const ACTION_FILTERS = [
  { id: "all", label: "All Events" },
  { id: "login", label: "Logins" },
  { id: "signup", label: "Signups" },
  { id: "logout", label: "Logouts" },
];

export default function AdminActivity() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActionFilter, setActiveActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchLogs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/admin/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Clear All Logs
  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/activity/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("All activity logs cleared.");
        setLogs([]);
      } else {
        showToast("Failed to clear activity logs.");
      }
    } catch (err) {
      showToast("Server connection error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Single Log
  const handleDeleteLog = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/admin/activity/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Log entry deleted.");
        setLogs((prev) => prev.filter((l) => l._id !== id));
      }
    } catch (err) {
      console.error("Error deleting log:", err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast("No activity logs to export.");
      return;
    }

    const headers = "Timestamp,User,Email,Role,Action,Device ID,IP Address,User Agent\n";
    const rows = logs
      .map(
        (l) =>
          `"${new Date(l.createdAt).toLocaleString()}","${l.name}","${l.email}","${l.role}","${l.action}","${l.deviceId || "DEV-DEFAULT"}","${l.ip || ""}","${(l.userAgent || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Activity logs exported to CSV!");
  };

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: logs.length,
      logins: logs.filter((l) => l.action === "login").length,
      signups: logs.filter((l) => l.action === "signup").length,
      logouts: logs.filter((l) => l.action === "logout").length,
      uniqueDevices: new Set(logs.map((l) => l.deviceId || l.ip || "unknown")).size,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (activeActionFilter !== "all" && log.action !== activeActionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.name?.toLowerCase().includes(q) ||
          log.email?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.deviceId?.toLowerCase().includes(q) ||
          log.ip?.includes(q) ||
          log.role?.toLowerCase().includes(q) ||
          log.userAgent?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, activeActionFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-16 text-neutral-100 max-w-[1550px] mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Audit &amp; Security
            </span>
            <span className="text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-400 px-2.5 py-0.5 rounded-full">
              Device Tracking Active
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Activity &amp; Audit Logs
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Monitor real-time user authentications, device identifiers, and system audit events.
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
            onClick={fetchLogs}
            disabled={loading}
            title="Refresh Logs"
            className="p-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-2xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            onClick={handleClearLogs}
            disabled={actionLoading || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 rounded-2xl text-xs font-semibold transition disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Total Events</span>
            <span className="text-3xl font-serif font-bold text-white mt-1 block">{metrics.total}</span>
            <p className="text-[11px] text-neutral-400 mt-1">Recorded audit entries</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Unique Devices</span>
            <span className="text-3xl font-serif font-bold text-purple-400 mt-1 block">{metrics.uniqueDevices}</span>
            <p className="text-[11px] text-purple-400/80 mt-1">Tracked Hardware</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Fingerprint className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">User Logins</span>
            <span className="text-3xl font-serif font-bold text-emerald-400 mt-1 block">{metrics.logins}</span>
            <p className="text-[11px] text-emerald-500/80 mt-1">Active sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">New Signups</span>
            <span className="text-3xl font-serif font-bold text-sky-400 mt-1 block">{metrics.signups}</span>
            <p className="text-[11px] text-sky-500/80 mt-1">Accounts created</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">User Logouts</span>
            <span className="text-3xl font-serif font-bold text-neutral-400 mt-1 block">{metrics.logouts}</span>
            <p className="text-[11px] text-neutral-500 mt-1">Sessions closed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-400 flex items-center justify-center">
            <LogOut className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── FILTERS & SEARCH BAR ── */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Action Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
            {ACTION_FILTERS.map((tab) => {
              const isSel = activeActionFilter === tab.id;
              let count = metrics.total;
              if (tab.id === "login") count = metrics.logins;
              if (tab.id === "signup") count = metrics.signups;
              if (tab.id === "logout") count = metrics.logouts;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveActionFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    isSel
                      ? "bg-amber-500 text-black shadow-md"
                      : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isSel ? "bg-black/20 text-black font-bold" : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Device ID, Name, Email, IP, Action…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ── ACTIVITY & AUDIT LOGS TABLE ── */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                <th className="py-4 px-5">Event Action</th>
                <th className="py-4 px-4">User Details</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Device ID</th>
                <th className="py-4 px-4">IP &amp; Client Platform</th>
                <th className="py-4 px-4">Timestamp</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-xs">Loading activity logs…</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-neutral-500 space-y-2">
                    <Activity className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm font-semibold text-neutral-400">No activity logs found.</p>
                    <p className="text-xs text-neutral-500">
                      System authentication events, device IDs, and user actions will be recorded here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = new Date(log.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const timeStr = new Date(log.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  const deviceIdentifier = log.deviceId || "DEV-DEFAULT";
                  const isCopied = copiedId === log._id;

                  return (
                    <tr key={log._id} className="hover:bg-neutral-800/40 transition group">
                      {/* Action Type */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                            log.action === "login"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : log.action === "signup"
                              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                              : log.action === "logout"
                              ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {log.action === "login" && <LogIn className="w-3 h-3" />}
                          {log.action === "signup" && <UserPlus className="w-3 h-3" />}
                          {log.action === "logout" && <LogOut className="w-3 h-3" />}
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">
                            {log.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{log.email}</p>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            log.role === "admin"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : log.role === "staff"
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                              : "bg-neutral-800 text-neutral-300 border-neutral-700"
                          }`}
                        >
                          {log.role || "customer"}
                        </span>
                      </td>

                      {/* Device ID */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 text-amber-400 font-mono text-[11px] px-2.5 py-1 rounded-xl font-bold transition">
                            <Laptop className="w-3 h-3 text-neutral-400" />
                            <span>{deviceIdentifier}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(deviceIdentifier, log._id)}
                            title="Copy Device ID"
                            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* IP & Platform */}
                      <td className="py-4 px-4">
                        <div className="space-y-1 text-[11px]">
                          <span className="flex items-center gap-1 text-neutral-300 font-mono">
                            <Globe className="w-3 h-3 text-neutral-500" />
                            {log.ip || "127.0.0.1"}
                          </span>
                          {log.userAgent && (
                            <span className="text-neutral-500 block truncate max-w-[180px]" title={log.userAgent}>
                              {log.userAgent}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 text-neutral-300">
                        <div className="space-y-0.5 text-xs">
                          <span className="font-medium text-white block">{dateStr}</span>
                          <span className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400/70" />
                            {timeStr}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLog(log)}
                            title="View Full Audit Details"
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(log._id)}
                            title="Delete entry"
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-rose-950/40 hover:border-rose-500/40 text-neutral-400 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── LOG DETAILS POPUP MODAL ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Audit Event Details</h3>
                <p className="text-xs text-amber-400 font-mono uppercase">{selectedLog.action} Event</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">User</span>
                  <span className="font-bold text-white text-sm">{selectedLog.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">User Role</span>
                  <span className="font-mono text-amber-400 font-bold uppercase">{selectedLog.role}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-neutral-500 uppercase block">Email Address</span>
                  <span className="font-mono text-neutral-300">{selectedLog.email}</span>
                </div>
              </div>

              {/* Device ID Row */}
              <div className="border-b border-neutral-800 pb-4">
                <span className="text-[10px] text-neutral-500 uppercase block mb-1">Hardware Device Identifier (Device ID)</span>
                <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {selectedLog.deviceId || "DEV-DEFAULT"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedLog.deviceId || "DEV-DEFAULT", "modal")}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-white transition flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Client IP Address</span>
                  <p className="text-neutral-300 font-mono">{selectedLog.ip || "127.0.0.1"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Event Timestamp</span>
                  <p className="text-neutral-300">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedLog.userAgent && (
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Client Platform / User Agent</span>
                  <p className="text-neutral-400 text-[11px] font-mono bg-neutral-900 p-3 rounded-xl border border-neutral-800 break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
