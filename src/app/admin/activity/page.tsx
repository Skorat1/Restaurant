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
  AlertTriangle,
  Filter,
  Check,
  Copy,
  Eye,
  X,
  Fingerprint,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  SlidersHorizontal,
  Layers,
  History,
  Lock,
  Sparkles,
  Terminal
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
  { id: "admin", label: "Admin Only" },
];

const TIME_FILTERS = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "Last 7 Days" },
  { id: "month", label: "Last 30 Days" },
];

export default function AdminActivity() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "timeline">("timeline");
  const [activeActionFilter, setActiveActionFilter] = useState("all");
  const [activeTimeFilter, setActiveTimeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDrawerLog, setSelectedDrawerLog] = useState<ActivityLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied to clipboard: ${text}`);
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
        setSelectedDrawerLog(null);
      } else {
        showToast("Failed to clear activity logs.");
      }
    } catch {
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
        if (selectedDrawerLog?._id === id) setSelectedDrawerLog(null);
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
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Audit logs exported to CSV!");
  };

  // Top Statistics Cards
  const metrics = useMemo(() => {
    const total = logs.length;
    const logins = logs.filter((l) => l.action === "login").length;
    const signups = logs.filter((l) => l.action === "signup").length;
    const logouts = logs.filter((l) => l.action === "logout").length;
    const adminEvents = logs.filter((l) => l.role === "admin" || (l.action && l.action.toLowerCase().includes("admin"))).length;
    const uniqueDevices = new Set(logs.map((l) => l.deviceId || l.ip || "unknown")).size;
    const uniqueUsers = new Set(logs.map((l) => l.email || l.name)).size;

    return {
      total,
      logins,
      signups,
      logouts,
      adminEvents,
      uniqueDevices,
      uniqueUsers,
    };
  }, [logs]);

  // Needs Attention / Security Alerts Engine
  const securityAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      level: "critical" | "warning" | "info";
      title: string;
      desc: string;
      log: ActivityLogItem;
    }> = [];

    // Group logs by email to find multi-device or rapid access
    const emailToLogs: Record<string, ActivityLogItem[]> = {};
    logs.forEach((l) => {
      const em = (l.email || l.name || "guest").toLowerCase();
      if (!emailToLogs[em]) emailToLogs[em] = [];
      emailToLogs[em].push(l);
    });

    // 1. Check for Multiple Device IDs on single account
    Object.entries(emailToLogs).forEach(([email, userLogs]) => {
      const devices = new Set(userLogs.map((u) => u.deviceId).filter(Boolean));
      if (devices.size >= 2) {
        const latest = userLogs[0];
        alerts.push({
          id: `multi-dev-${email}`,
          level: "warning",
          title: `Multiple Devices for ${latest.name}`,
          desc: `Account "${email}" was authenticated across ${devices.size} distinct hardware Device IDs.`,
          log: latest,
        });
      }
    });

    // 2. Check for Admin Login events
    logs.forEach((l) => {
      if (l.role === "admin" && l.action === "login") {
        alerts.push({
          id: `admin-login-${l._id}`,
          level: "info",
          title: `Privileged Admin Session: ${l.name}`,
          desc: `Admin authenticated from IP ${l.ip || "127.0.0.1"} (${l.deviceId || "DEV-DEFAULT"}).`,
          log: l,
        });
      }
    });

    return alerts.filter((a) => !dismissedAlerts.includes(a.id)).slice(0, 3);
  }, [logs, dismissedAlerts]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date().getTime();

    return logs.filter((log) => {
      // Action Filter
      if (activeActionFilter === "admin") {
        if (log.role !== "admin" && !log.action.toLowerCase().includes("admin")) return false;
      } else if (activeActionFilter !== "all" && log.action !== activeActionFilter) {
        return false;
      }

      // Role Filter
      if (roleFilter !== "all" && (log.role || "customer").toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      // Time Filter
      if (activeTimeFilter !== "all") {
        const logTime = new Date(log.createdAt).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);

        if (activeTimeFilter === "today" && diffHours > 24) return false;
        if (activeTimeFilter === "week" && diffHours > 24 * 7) return false;
        if (activeTimeFilter === "month" && diffHours > 24 * 30) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.name?.toLowerCase().includes(q) ||
          log.email?.toLowerCase().includes(q) ||
          log.action?.toLowerCase().includes(q) ||
          log.deviceId?.toLowerCase().includes(q) ||
          log.ip?.includes(q) ||
          log.role?.toLowerCase().includes(q) ||
          log.userAgent?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, activeActionFilter, roleFilter, activeTimeFilter, searchQuery]);

  // Timeline Grouping (Grouped by Date)
  const timelineGroups = useMemo(() => {
    const groups: Record<string, ActivityLogItem[]> = {};

    filteredLogs.forEach((log) => {
      const dateKey = new Date(log.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });

    return Object.entries(groups);
  }, [filteredLogs]);

  const getTimeAgo = (dateStr: string) => {
    const diffSeconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6 pb-20 text-neutral-100 max-w-[1550px] mx-auto relative">
      {/* ── TOAST ALERT ── */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── HEADER & LIVE STATUS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Audit &amp; Security Intelligence
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Hardware Device Tracking
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Activity &amp; Audit Intelligence Center
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Real-time audit trails, biometric &amp; hardware device fingerprints, and automated security monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "timeline"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

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

      {/* ── 1. TOP STATISTICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Events */}
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

        {/* Unique Hardware Devices */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Unique Devices</span>
            <span className="text-3xl font-serif font-bold text-purple-400 mt-1 block">{metrics.uniqueDevices}</span>
            <p className="text-[11px] text-purple-400/80 mt-1">Fingerprinted Hardware</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Fingerprint className="w-6 h-6" />
          </div>
        </div>

        {/* User Logins */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Active Logins</span>
            <span className="text-3xl font-serif font-bold text-emerald-400 mt-1 block">{metrics.logins}</span>
            <p className="text-[11px] text-emerald-500/80 mt-1">Authenticated Sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>
        </div>

        {/* New Signups */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">New Signups</span>
            <span className="text-3xl font-serif font-bold text-sky-400 mt-1 block">{metrics.signups}</span>
            <p className="text-[11px] text-sky-500/80 mt-1">Patron accounts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
        </div>

        {/* Admin Audit Actions */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block">Admin Sessions</span>
            <span className="text-3xl font-serif font-bold text-amber-300 mt-1 block">{metrics.adminEvents}</span>
            <p className="text-[11px] text-amber-400/80 mt-1">Privileged events</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── 2. NEEDS ATTENTION / SECURITY ALERTS SECTION ── */}
      {securityAlerts.length > 0 && (
        <div className="bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-serif font-bold text-white text-sm">
                Needs Attention &amp; Security Highlights ({securityAlerts.length})
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-mono">Automated Threat Engine</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-1">
            {securityAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        alert.level === "critical"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : alert.level === "warning"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      {alert.level}
                    </span>
                    <button
                      onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                      className="text-neutral-500 hover:text-white text-xs"
                      title="Dismiss alert"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-xs">{alert.title}</h4>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-light">{alert.desc}</p>
                </div>

                <button
                  onClick={() => setSelectedDrawerLog(alert.log)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start"
                >
                  <span>Inspect Audit Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. ACTIVITY FILTERS + SEARCH ── */}
      <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl space-y-3 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {ACTION_FILTERS.map((tab) => {
              const isSel = activeActionFilter === tab.id;
              let count = metrics.total;
              if (tab.id === "login") count = metrics.logins;
              if (tab.id === "signup") count = metrics.signups;
              if (tab.id === "logout") count = metrics.logouts;
              if (tab.id === "admin") count = metrics.adminEvents;

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

          {/* Time & Role Selectors + Search */}
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
            {/* Time Filter */}
            <select
              value={activeTimeFilter}
              onChange={(e) => setActiveTimeFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none focus:border-amber-500"
            >
              {TIME_FILTERS.map((tf) => (
                <option key={tf.id} value={tf.id}>
                  {tf.label}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 outline-none focus:border-amber-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Device ID, Name, IP…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. REAL-TIME ACTIVITY TIMELINE VIEW ── */}
      {viewMode === "timeline" && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-neutral-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
              <p className="text-xs">Loading activity timeline…</p>
            </div>
          ) : timelineGroups.length === 0 ? (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-16 text-center text-neutral-500 space-y-2">
              <Activity className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
              <p className="text-sm font-semibold text-neutral-300">No activity events found.</p>
              <p className="text-xs text-neutral-500">Try clearing filters or search terms.</p>
            </div>
          ) : (
            timelineGroups.map(([dateKey, groupLogs]) => (
              <div key={dateKey} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-neutral-900 border border-neutral-800 px-3.5 py-1 rounded-full shadow-md">
                    📅 {dateKey}
                  </span>
                  <div className="h-[1px] bg-neutral-800 flex-1" />
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {groupLogs.length} event{groupLogs.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Timeline Items */}
                <div className="relative pl-6 sm:pl-8 space-y-3 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-[2px] before:bg-neutral-800/80">
                  {groupLogs.map((log) => {
                    const isCopied = copiedId === log._id;
                    const deviceIdentifier = log.deviceId || "DEV-DEFAULT";
                    const timeAgo = getTimeAgo(log.createdAt);

                    return (
                      <div
                        key={log._id}
                        onClick={() => setSelectedDrawerLog(log)}
                        className="bg-neutral-900/70 border border-neutral-800/80 hover:border-amber-500/40 p-4 rounded-3xl shadow-lg transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative group"
                      >
                        {/* Timeline Node Icon */}
                        <div className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-950 border-2 border-amber-500 group-hover:scale-125 transition-transform" />

                        {/* Left Info */}
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              log.action === "login"
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                : log.action === "signup"
                                ? "bg-sky-500/15 border border-sky-500/30 text-sky-400"
                                : log.action === "logout"
                                ? "bg-neutral-800 border border-neutral-700 text-neutral-400"
                                : "bg-amber-500/15 border border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {log.action === "login" && <LogIn className="w-5 h-5" />}
                            {log.action === "signup" && <UserPlus className="w-5 h-5" />}
                            {log.action === "logout" && <LogOut className="w-5 h-5" />}
                            {log.action !== "login" && log.action !== "signup" && log.action !== "logout" && (
                              <Activity className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                                {log.name}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  log.role === "admin"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : "bg-neutral-800 text-neutral-400"
                                }`}
                              >
                                {log.role || "customer"}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 font-mono">{log.email}</p>
                          </div>
                        </div>

                        {/* Right Metadata */}
                        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800/80">
                          {/* Device ID */}
                          <span className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-xl text-[11px] font-mono text-amber-400 font-bold">
                            <Laptop className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{deviceIdentifier}</span>
                          </span>

                          {/* IP */}
                          <span className="text-[11px] font-mono text-neutral-400 hidden md:inline-block">
                            {log.ip || "127.0.0.1"}
                          </span>

                          {/* Time Ago */}
                          <span className="text-xs font-mono text-neutral-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                            {timeAgo})
                          </span>

                          <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TABLE VIEW (ALTERNATE) ── */}
      {viewMode === "table" && (
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

                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">
                              {log.name}
                            </p>
                            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{log.email}</p>
                          </div>
                        </td>

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
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

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

                        <td className="py-4 px-4 text-neutral-300">
                          <div className="space-y-0.5 text-xs">
                            <span className="font-medium text-white block">{dateStr}</span>
                            <span className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400/70" />
                              {timeStr}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedDrawerLog(log)}
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
      )}

      {/* ── 5. ACTIVITY DETAILS SLIDE-OVER DRAWER ── */}
      {selectedDrawerLog && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedDrawerLog(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-neutral-950 border-l border-amber-500/30 p-6 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-base">Audit Intelligence Drawer</h3>
                    <p className="text-[11px] text-amber-400 font-mono uppercase">
                      {selectedDrawerLog.action} Event Inspector
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDrawerLog(null)}
                  className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="space-y-4 py-6 text-xs flex-1">
                {/* User Identity Card */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                    Authenticated Patron
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{selectedDrawerLog.name}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase border ${
                        selectedDrawerLog.role === "admin"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}
                    >
                      {selectedDrawerLog.role || "customer"}
                    </span>
                  </div>
                  <p className="font-mono text-neutral-300 text-xs">{selectedDrawerLog.email}</p>
                </div>

                {/* Hardware Device Fingerprint Card */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                      Hardware Device Fingerprint
                    </span>
                    <Fingerprint className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {selectedDrawerLog.deviceId || "DEV-DEFAULT"}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedDrawerLog.deviceId || "DEV-DEFAULT", "drawer-dev")}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Network & Platform Telemetry */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">
                    Network &amp; Client Telemetry
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">IP Address</span>
                      <p className="font-mono text-white text-xs mt-0.5">{selectedDrawerLog.ip || "127.0.0.1"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Event Timestamp</span>
                      <p className="text-white text-xs mt-0.5">
                        {new Date(selectedDrawerLog.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {selectedDrawerLog.userAgent && (
                    <div className="pt-2 border-t border-neutral-800">
                      <span className="text-[10px] text-neutral-500 block mb-1">User Agent String</span>
                      <p className="font-mono text-[11px] text-neutral-400 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 break-all leading-relaxed">
                        {selectedDrawerLog.userAgent}
                      </p>
                    </div>
                  )}
                </div>

                {/* Raw JSON Payload */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Raw Audit Record</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedDrawerLog, null, 2), "raw-json")}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedDrawerLog, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-neutral-800 flex gap-2">
                <button
                  onClick={() => handleDeleteLog(selectedDrawerLog._id)}
                  className="flex-1 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-red-500/40 text-neutral-400 hover:text-red-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
                <button
                  onClick={() => setSelectedDrawerLog(null)}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
