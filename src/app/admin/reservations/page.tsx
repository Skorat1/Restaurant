"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode,
  Download,
  Send,
  Eye,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  PhoneCall,
  Mail,
  MapPin,
  Utensils,
  Wine,
  Tag,
  Check,
  ChevronRight,
  Layers,
  LayoutGrid,
  List
} from "lucide-react";
import API_BASE_URL from "@/lib/api";
import FloorPlanView, { ReservationItem } from "./FloorPlanView";

const STATUS_FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Seated",
  "Waitlisted",
  "Completed",
  "Declined",
];

const AVAILABLE_TABLES = [
  { tableNo: "T1", area: "Main Room", capacity: 4 },
  { tableNo: "T2", area: "Main Room", capacity: 4 },
  { tableNo: "T3", area: "Main Room", capacity: 4 },
  { tableNo: "T4", area: "Main Room", capacity: 6 },
  { tableNo: "T5", area: "Main Room", capacity: 6 },
  { tableNo: "T6", area: "Main Room", capacity: 4 },
  { tableNo: "T7", area: "Main Room", capacity: 4 },
  { tableNo: "T8", area: "Main Room", capacity: 4 },
  { tableNo: "T9", area: "Main Room", capacity: 4 },
  { tableNo: "T10", area: "Main Room", capacity: 4 },
  { tableNo: "T11", area: "Main Room", capacity: 4 },
  { tableNo: "T12", area: "Main Room", capacity: 4 },
  { tableNo: "P1", area: "Patio", capacity: 2 },
  { tableNo: "P2", area: "Patio", capacity: 2 },
  { tableNo: "P3", area: "Patio", capacity: 4 },
  { tableNo: "P4", area: "Patio", capacity: 4 },
  { tableNo: "P5", area: "Patio", capacity: 4 },
  { tableNo: "P6", area: "Patio", capacity: 4 },
  { tableNo: "R1", area: "Terrace", capacity: 4 },
  { tableNo: "R2", area: "Terrace", capacity: 4 },
  { tableNo: "R3", area: "Terrace", capacity: 6 },
  { tableNo: "R4", area: "Terrace", capacity: 6 },
  { tableNo: "R5", area: "Terrace", capacity: 4 },
  { tableNo: "R6", area: "Terrace", capacity: 4 },
  { tableNo: "L1", area: "Lounge", capacity: 4 },
  { tableNo: "L2", area: "Lounge", capacity: 6 },
  { tableNo: "L3", area: "Lounge", capacity: 4 },
  { tableNo: "L4", area: "Lounge", capacity: 6 },
];

export default function AdminReservations() {
  const [viewMode, setViewMode] = useState<"list" | "floorplan">("floorplan");
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    res: ReservationItem | null;
    tableNo: string;
    area: string;
  }>({ open: false, res: null, tableNo: "T1", area: "Main Room" });

  const [detailsModal, setDetailsModal] = useState<ReservationItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // New reservation form state
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    time: "7:30 PM",
    guests: 2,
    area: "Main Room",
    tableNo: "T1",
    occasion: "General",
    notes: "",
    isWaitlist: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const url = new URL(`${API_BASE_URL}/api/reservations/all`);
      url.searchParams.append("all", "true");

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Update reservation status and table assignment
  const handleUpdateStatus = async (
    id: string,
    status: string,
    tableNo?: string,
    area?: string
  ) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...(tableNo ? { tableNo } : {}),
          ...(area ? { area } : {}),
        }),
      });

      if (res.ok) {
        showToast(`Reservation status updated to "${status}"!`);
        fetchReservations();
      } else {
        showToast("Failed to update reservation");
      }
    } catch (err) {
      console.error("Error updating reservation:", err);
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
      setAssignModal({ open: false, res: null, tableNo: "T1", area: "Main Room" });
    }
  };

  // Delete reservation
  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this reservation?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Reservation removed.");
        setReservations((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Error deleting reservation:", err);
    }
  };

  // Create manual reservation
  const handleCreateManualReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const token = localStorage.getItem("token");
      const combinedDate = `${newForm.date}T${newForm.time}`;

      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newForm.name,
          email: newForm.email,
          phone: newForm.phone,
          date: combinedDate,
          guests: newForm.guests,
          area: newForm.area,
          tableNo: newForm.tableNo,
          occasion: newForm.occasion,
          notes: newForm.notes,
          isWaitlist: newForm.isWaitlist,
        }),
      });

      if (res.ok) {
        showToast(`Reservation created for ${newForm.name}!`);
        setIsNewModalOpen(false);
        setNewForm({
          name: "",
          email: "",
          phone: "",
          date: new Date().toISOString().split("T")[0],
          time: "7:30 PM",
          guests: 2,
          area: "Main Room",
          tableNo: "T1",
          occasion: "General",
          notes: "",
          isWaitlist: false,
        });
        fetchReservations();
      } else {
        showToast("Failed to create reservation");
      }
    } catch (err) {
      console.error("Error creating reservation:", err);
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayList = reservations.filter((r) => {
      if (!r.date) return false;
      const d = new Date(r.date).toISOString().split("T")[0];
      return d === todayStr;
    });

    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === "Pending").length;
    const confirmed = reservations.filter((r) => r.status === "Confirmed").length;
    const seated = reservations.filter((r) => r.status === "Seated").length;
    const waitlisted = reservations.filter((r) => r.status === "Waitlisted").length;

    return { total, pending, confirmed, seated, waitlisted, todayCount: todayList.length };
  }, [reservations]);

  // Filtered reservations for the master table list view
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Status filter
      if (selectedStatus !== "All" && r.status !== selectedStatus) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all" && r.date) {
        const rDate = new Date(r.date).toISOString().split("T")[0];
        if (dateFilter === "today") {
          const today = new Date().toISOString().split("T")[0];
          if (rDate !== today) return false;
        } else if (dateFilter === "tomorrow") {
          const tom = new Date();
          tom.setDate(tom.getDate() + 1);
          const tomStr = tom.toISOString().split("T")[0];
          if (rDate !== tomStr) return false;
        } else if (rDate !== dateFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name?.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.passCode?.toLowerCase().includes(q) ||
          r.tableNo?.toLowerCase().includes(q) ||
          r.area?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [reservations, selectedStatus, dateFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12 text-neutral-100">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-amber-500 text-black font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER & VIEW TOGGLES ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Floor &amp; Host Stand Operations
            </span>
            {metrics.pending > 0 && (
              <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                {metrics.pending} Pending Review
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Table Reservations &amp; Host Stand
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Live interactive seating management, floor plan status, and reservation passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual View Switcher */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode("floorplan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "floorplan"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Live Floor Map</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              <span>Reservations List ({reservations.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-2xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS BANNER ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Total Bookings</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-white">{metrics.total}</span>
            <span className="text-[11px] text-amber-400 font-mono">All Time</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Currently Seated</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-emerald-400">{metrics.seated}</span>
            <span className="text-[11px] text-emerald-500/80 font-mono">Active Tables</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Confirmed Tables</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-amber-400">{metrics.confirmed}</span>
            <span className="text-[11px] text-amber-500/80 font-mono">Reserved</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Pending Review</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-rose-400">{metrics.pending}</span>
            <span className="text-[11px] text-rose-500/80 font-mono">Needs Action</span>
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Priority Waitlist</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-blue-400">{metrics.waitlisted}</span>
            <span className="text-[11px] text-blue-500/80 font-mono">Walk-in Queue</span>
          </div>
        </div>
      </div>

      {/* ── VIEW MODE 1: INTERACTIVE FLOOR PLAN / HOST STAND ── */}
      {viewMode === "floorplan" && (
        <div className="space-y-4">
          <FloorPlanView
            initialReservations={reservations}
            onDataRefresh={fetchReservations}
          />
        </div>
      )}

      {/* ── VIEW MODE 2: RESERVATIONS MASTER TABLE / LIST ── */}
      {viewMode === "list" && (
        <div className="space-y-5">
          {/* Controls Bar: Status Filter, Date Selector & Search */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedStatus === st
                      ? "bg-amber-500 text-black shadow-md"
                      : "text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800"
                  }`}
                >
                  {st}
                  {st === "Pending" && metrics.pending > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                      {metrics.pending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Controls: Date Selector & Search Input */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Date Filter */}
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs">
                <button
                  onClick={() => setDateFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    dateFilter === "all" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  All Dates
                </button>
                <button
                  onClick={() => setDateFilter("today")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    dateFilter === "today" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter("tomorrow")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    dateFilter === "tomorrow" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Tomorrow
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest, code, table…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={fetchReservations}
                title="Refresh List"
                className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:border-amber-500 transition"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="py-4 px-5">Guest &amp; Pass Code</th>
                    <th className="py-4 px-4">Date &amp; Shift</th>
                    <th className="py-4 px-4">Party &amp; Area</th>
                    <th className="py-4 px-4">Assigned Table</th>
                    <th className="py-4 px-4">Occasion &amp; Addons</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 italic">
                        No reservations found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => {
                      const resDate = res.date
                        ? new Date(res.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A";

                      const resTime = res.date
                        ? new Date(res.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "7:30 PM";

                      return (
                        <tr
                          key={res._id || res.id}
                          className="hover:bg-neutral-800/40 transition group"
                        >
                          {/* Guest Name & Code */}
                          <td className="py-4 px-5">
                            <div>
                              <p className="font-bold text-white text-sm group-hover:text-amber-400 transition">
                                {res.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-neutral-400">
                                <span className="font-mono text-[11px] text-amber-400/90 font-semibold">
                                  {res.passCode || "RES-GUEST"}
                                </span>
                                <span>·</span>
                                <span>{res.phone || "No phone"}</span>
                              </div>
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white block">{resDate}</span>
                              <span className="text-[11px] text-amber-400/80 font-mono block flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {resTime}
                              </span>
                            </div>
                          </td>

                          {/* Party Size & Area */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{res.guests} Guests</span>
                              <span className="text-[11px] text-neutral-400 block font-medium">
                                {res.area || "Main Room"}
                              </span>
                            </div>
                          </td>

                          {/* Assigned Table */}
                          <td className="py-4 px-4">
                            {res.tableNo ? (
                              <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-xl font-bold font-mono text-xs">
                                Table {res.tableNo}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic text-[11px]">Unassigned</span>
                            )}
                          </td>

                          {/* Occasion & Preorders */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {res.occasion && res.occasion !== "General" && (
                                <span className="bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                  🎉 {res.occasion}
                                </span>
                              )}
                              {res.preOrders && res.preOrders.length > 0 && (
                                <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                  🍾 {res.preOrders.length} Pre-Orders
                                </span>
                              )}
                              {res.dietary && res.dietary.length > 0 && (
                                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                  ✓ {res.dietary.length} Dietary
                                </span>
                              )}
                              {(!res.occasion || res.occasion === "General") &&
                                (!res.preOrders || res.preOrders.length === 0) &&
                                (!res.dietary || res.dietary.length === 0) && (
                                  <span className="text-neutral-500 text-[11px]">—</span>
                                )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                                res.status === "Confirmed"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                  : res.status === "Seated"
                                  ? "bg-sky-500/15 text-sky-400 border-sky-500/30 animate-pulse"
                                  : res.status === "Pending"
                                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                  : res.status === "Waitlisted"
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                  : res.status === "Completed"
                                  ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                                  : "bg-red-950/40 text-red-400 border-red-500/20"
                              }`}
                            >
                              {res.status === "Seated" && <Users className="w-3 h-3" />}
                              {res.status === "Confirmed" && <Check className="w-3 h-3" />}
                              {res.status === "Pending" && <Clock className="w-3 h-3" />}
                              <span>{res.status}</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* If Pending, Confirm button */}
                              {res.status === "Pending" && (
                                <button
                                  onClick={() =>
                                    setAssignModal({
                                      open: true,
                                      res,
                                      tableNo: res.tableNo || "T1",
                                      area: res.area || "Main Room",
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Confirm &amp; Assign
                                </button>
                              )}

                              {/* If Confirmed, Seat Guest button */}
                              {res.status === "Confirmed" && (
                                <button
                                  onClick={() => handleUpdateStatus(res._id!, "Seated", res.tableNo, res.area)}
                                  className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold transition flex items-center gap-1"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  Seat Now
                                </button>
                              )}

                              {/* If Seated, Complete button */}
                              {res.status === "Seated" && (
                                <button
                                  onClick={() => handleUpdateStatus(res._id!, "Completed", res.tableNo, res.area)}
                                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-bold transition"
                                >
                                  Complete
                                </button>
                              )}

                              {/* If Waitlisted, Assign Table & Seat */}
                              {res.status === "Waitlisted" && (
                                <button
                                  onClick={() =>
                                    setAssignModal({
                                      open: true,
                                      res,
                                      tableNo: "T1",
                                      area: "Main Room",
                                    })
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 font-bold transition"
                                >
                                  Seat at Table
                                </button>
                              )}

                              {/* View Details modal */}
                              <button
                                onClick={() => setDetailsModal(res)}
                                title="View Dining Pass Details"
                                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteReservation(res._id!)}
                                title="Delete"
                                className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 transition"
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
        </div>
      )}

      {/* ── ASSIGN TABLE & CONFIRM RESERVATION MODAL ── */}
      {assignModal.open && assignModal.res && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setAssignModal({ open: false, res: null, tableNo: "T1", area: "Main Room" })}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Assign Table &amp; Confirm</h3>
                <p className="text-xs text-neutral-400">Guest: {assignModal.res.name} ({assignModal.res.guests} Guests)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Seating Area</label>
                <select
                  value={assignModal.area}
                  onChange={(e) => setAssignModal({ ...assignModal, area: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Main Room">Main Dining Room</option>
                  <option value="Patio">Romantic Patio</option>
                  <option value="Terrace">Sky Terrace</option>
                  <option value="Lounge">VIP Lounge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Select Dining Table</label>
                <select
                  value={assignModal.tableNo}
                  onChange={(e) => setAssignModal({ ...assignModal, tableNo: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                >
                  {AVAILABLE_TABLES.filter((t) => t.area === assignModal.area).map((t) => (
                    <option key={t.tableNo} value={t.tableNo}>
                      Table {t.tableNo} — {t.capacity} Seats ({t.area})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModal({ open: false, res: null, tableNo: "T1", area: "Main Room" })}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    handleUpdateStatus(
                      assignModal.res!._id!,
                      "Confirmed",
                      assignModal.tableNo,
                      assignModal.area
                    )
                  }
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {actionLoading ? "Confirming…" : "Confirm & Send Pass"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESERVATION DETAILS & PASS MODAL ── */}
      {detailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setDetailsModal(null)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">VIP Reservation Pass</h3>
                <p className="text-xs text-amber-400 font-mono">{detailsModal.passCode || "RES-GUEST"}</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Guest Name</span>
                  <span className="font-bold text-white text-sm">{detailsModal.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Party Size</span>
                  <span className="font-bold text-amber-400 text-sm">{detailsModal.guests} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Date &amp; Time</span>
                  <span className="text-neutral-300 font-semibold">
                    {detailsModal.date ? new Date(detailsModal.date).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Assigned Table</span>
                  <span className="text-amber-300 font-mono font-bold">
                    Table {detailsModal.tableNo || "T1"} ({detailsModal.area || "Main Room"})
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase block">Contact Info</span>
                <p className="text-neutral-300">Phone: {detailsModal.phone || "N/A"}</p>
                <p className="text-neutral-300">Email: {detailsModal.email || "N/A"}</p>
              </div>

              {detailsModal.notes && (
                <div className="space-y-1 pt-2 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block">Special Notes &amp; Dietary</span>
                  <p className="text-neutral-300 text-[11px] italic bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                    &quot;{detailsModal.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDetailsModal(null)}
                className="w-full py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE MANUAL RESERVATION MODAL ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Create Direct Reservation</h3>
                <p className="text-xs text-neutral-400">Book and assign table directly</p>
              </div>
            </div>

            <form onSubmit={handleCreateManualReservation} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Guest Full Name</label>
                <input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Mobile Phone</label>
                  <input
                    required
                    placeholder="+91 98765 43210"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newForm.date}
                    onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Time</label>
                  <input
                    required
                    placeholder="7:30 PM"
                    value={newForm.time}
                    onChange={(e) => setNewForm({ ...newForm, time: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newForm.guests}
                    onChange={(e) => setNewForm({ ...newForm, guests: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Dining Area</label>
                  <select
                    value={newForm.area}
                    onChange={(e) => setNewForm({ ...newForm, area: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none"
                  >
                    <option value="Main Room">Main Dining Room</option>
                    <option value="Patio">Romantic Patio</option>
                    <option value="Terrace">Sky Terrace</option>
                    <option value="Lounge">VIP Lounge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Assign Table</label>
                  <select
                    value={newForm.tableNo}
                    onChange={(e) => setNewForm({ ...newForm, tableNo: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-3 py-2.5 text-white focus:outline-none font-mono"
                  >
                    {AVAILABLE_TABLES.filter((t) => t.area === newForm.area).map((t) => (
                      <option key={t.tableNo} value={t.tableNo}>
                        Table {t.tableNo} ({t.capacity} Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Special Notes / Requests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Celebrating birthday, window seat preference"
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
                >
                  {actionLoading ? "Saving…" : "Create &amp; Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
