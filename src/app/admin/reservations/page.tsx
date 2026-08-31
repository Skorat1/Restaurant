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
  ChevronDown,
  X,
  UserCheck,
  ArrowUpDown,
  Layers,
  ListFilter,
  CalendarDays
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

export interface ReservationItem {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  date?: string | Date;
  guests: number;
  area: string;
  tableNo: string;
  status: "Pending" | "Confirmed" | "Seated" | "Completed" | "Declined" | "Waitlisted";
  occasion?: string;
  notes?: string;
  passCode?: string;
  dietary?: string[];
  preOrders?: Array<{ id: string; name: string; price: number; icon?: string }>;
  specialRequests?: string;
  totalAmount?: number;
  createdAt?: string;
}

const STATUS_TABS = [
  { id: "All", label: "All Bookings" },
  { id: "Pending", label: "Pending Review" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "Seated", label: "Seated Diners" },
  { id: "Waitlisted", label: "Waitlist" },
  { id: "Completed", label: "Completed" },
  { id: "Declined", label: "Declined" },
];

const DATE_TIMELINE_FILTERS = [
  { id: "all", label: "All Dates" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
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
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [timelineFilter, setTimelineFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_asc" | "date_desc" | "created_desc" | "status" | "name">("date_asc");
  const [groupByDate, setGroupByDate] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedRes, setSelectedRes] = useState<ReservationItem | null>(null);
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    res: ReservationItem | null;
    tableNo: string;
    area: string;
  }>({ open: false, res: null, tableNo: "T1", area: "Main Room" });

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
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchReservations = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/reservations/all?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching client reservations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Update Status & Table Assignment
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
        showToast(`Reservation marked as ${status}`);
        fetchReservations();
      } else {
        showToast("Failed to update reservation");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
      setAssignModal({ open: false, res: null, tableNo: "T1", area: "Main Room" });
    }
  };

  // Delete Reservation
  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Reservation deleted.");
        setReservations((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Error deleting reservation:", err);
    }
  };

  // Create Manual Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
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
        });
        fetchReservations();
      } else {
        showToast("Error creating reservation");
      }
    } catch (err) {
      console.error("Error creating reservation:", err);
      showToast("Server connection error");
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((r) => r.status === "Pending").length,
      confirmed: reservations.filter((r) => r.status === "Confirmed").length,
      seated: reservations.filter((r) => r.status === "Seated").length,
      waitlisted: reservations.filter((r) => r.status === "Waitlisted").length,
      completed: reservations.filter((r) => r.status === "Completed").length,
      declined: reservations.filter((r) => r.status === "Declined").length,
    };
  }, [reservations]);

  // Filtered & Sorted reservations list
  const filteredAndSortedReservations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const filtered = reservations.filter((r) => {
      // Tab filter
      if (activeTab !== "All" && r.status !== activeTab) {
        return false;
      }

      // Timeline Filter
      if (timelineFilter !== "all" && r.date) {
        const rDate = new Date(r.date);
        const rDateMidnight = new Date(rDate);
        rDateMidnight.setHours(0, 0, 0, 0);

        if (timelineFilter === "today") {
          if (rDateMidnight.getTime() !== today.getTime()) return false;
        } else if (timelineFilter === "tomorrow") {
          if (rDateMidnight.getTime() !== tomorrow.getTime()) return false;
        } else if (timelineFilter === "upcoming") {
          if (rDateMidnight.getTime() < today.getTime()) return false;
        } else if (timelineFilter === "past") {
          if (rDateMidnight.getTime() >= today.getTime()) return false;
        }
      }

      // Search filter
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

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "date_asc") {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }
      if (sortBy === "date_desc") {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortBy === "created_desc") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "status") {
        const priority: Record<string, number> = { Pending: 1, Confirmed: 2, Seated: 3, Waitlisted: 4, Completed: 5, Declined: 6 };
        return (priority[a.status] || 99) - (priority[b.status] || 99);
      }
      return 0;
    });
  }, [reservations, activeTab, timelineFilter, searchQuery, sortBy]);

  // Grouped by Date structure
  const groupedReservations = useMemo(() => {
    const groups: { [key: string]: { label: string; dateObj: Date; items: ReservationItem[] } } = {};

    filteredAndSortedReservations.forEach((item) => {
      const d = item.date ? new Date(item.date) : new Date();
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dMidnight = new Date(d);
      dMidnight.setHours(0, 0, 0, 0);

      let label = d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (dMidnight.getTime() === today.getTime()) {
        label = `Today — ${label}`;
      } else if (dMidnight.getTime() === tomorrow.getTime()) {
        label = `Tomorrow — ${label}`;
      } else if (dMidnight.getTime() < today.getTime()) {
        label = `${label} (Past)`;
      }

      if (!groups[dateKey]) {
        groups[dateKey] = { label, dateObj: dMidnight, items: [] };
      }
      groups[dateKey].items.push(item);
    });

    return Object.entries(groups).map(([key, val]) => ({
      dateKey: key,
      label: val.label,
      dateObj: val.dateObj,
      items: val.items,
    }));
  }, [filteredAndSortedReservations]);

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
              Operations Center
            </span>
            {metrics.pending > 0 && (
              <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                {metrics.pending} Pending Review
              </span>
            )}
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Client Reservations
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Organized timeline of all client bookings, table assignments, and guest requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReservations}
            disabled={loading}
            title="Refresh List"
            className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 hover:text-white hover:border-amber-500 transition shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Reservation</span>
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab("All")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "All" ? "bg-neutral-900 border-amber-500/50 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">Total</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-white">{metrics.total}</span>
            <span className="text-[10px] text-neutral-500">Bookings</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Pending")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "Pending" ? "bg-neutral-900 border-rose-500/50 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400 block">Pending</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-rose-400">{metrics.pending}</span>
            <span className="text-[10px] text-rose-500/70">Need Action</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Confirmed")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "Confirmed" ? "bg-neutral-900 border-amber-500/50 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">Confirmed</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-amber-400">{metrics.confirmed}</span>
            <span className="text-[10px] text-amber-500/70">Reserved</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Seated")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "Seated" ? "bg-neutral-900 border-sky-500/50 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400 block">Seated</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-sky-400">{metrics.seated}</span>
            <span className="text-[10px] text-sky-500/70">At Table</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Waitlisted")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "Waitlisted" ? "bg-neutral-900 border-blue-500/50 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block">Waitlist</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-blue-400">{metrics.waitlisted}</span>
            <span className="text-[10px] text-blue-500/70">Queue</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("Completed")}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            activeTab === "Completed" ? "bg-neutral-900 border-neutral-600 shadow-md" : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">Completed</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-serif text-neutral-300">{metrics.completed}</span>
            <span className="text-[10px] text-neutral-500">Done</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & ORGANIZATION BAR ── */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl space-y-4 shadow-xl">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {STATUS_TABS.map((tab) => {
            const isSel = activeTab === tab.id;
            let count = metrics.total;
            if (tab.id === "Pending") count = metrics.pending;
            else if (tab.id === "Confirmed") count = metrics.confirmed;
            else if (tab.id === "Seated") count = metrics.seated;
            else if (tab.id === "Waitlisted") count = metrics.waitlisted;
            else if (tab.id === "Completed") count = metrics.completed;
            else if (tab.id === "Declined") count = metrics.declined;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  isSel
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-neutral-950 border border-neutral-800/80 text-neutral-400 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isSel
                      ? "bg-black/20 text-black font-bold"
                      : "bg-neutral-800 text-neutral-300 font-semibold"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Date Timeline Filter + Sort + Group Toggle + Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
          {/* Timeline Pills */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            {DATE_TIMELINE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTimelineFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  timelineFilter === f.id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort & Group Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="date_asc" className="bg-neutral-900">Date (Upcoming First)</option>
                <option value="date_desc" className="bg-neutral-900">Date (Latest First)</option>
                <option value="created_desc" className="bg-neutral-900">Recently Booked</option>
                <option value="status" className="bg-neutral-900">Status Priority</option>
                <option value="name" className="bg-neutral-900">Client Name (A-Z)</option>
              </select>
            </div>

            {/* Group by Date Toggle */}
            <button
              onClick={() => setGroupByDate(!groupByDate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                groupByDate
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{groupByDate ? "Grouped by Date" : "Flat List"}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, code, table…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ── RESERVATIONS LIST / TIMELINE DISPLAY ── */}
      {loading ? (
        <div className="py-24 text-center rounded-3xl border border-neutral-800 bg-neutral-900/60">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
          <p className="text-sm font-semibold text-neutral-300">Loading client reservations…</p>
        </div>
      ) : filteredAndSortedReservations.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-neutral-800 bg-neutral-900/40 space-y-3">
          <Utensils className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
          <p className="text-base font-semibold text-neutral-300">No client reservations found.</p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            No bookings match your current filter criteria. Try clearing search or selecting a different status tab.
          </p>
        </div>
      ) : groupByDate ? (
        /* ================= GROUPED BY DATE VIEW ================= */
        <div className="space-y-6">
          {groupedReservations.map((group) => (
            <div key={group.dateKey} className="rounded-3xl border border-neutral-800 bg-neutral-900/80 overflow-hidden shadow-xl">
              {/* Date Section Header */}
              <div className="px-6 py-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white tracking-wide">{group.label}</h3>
                    <p className="text-[10px] text-neutral-400">{group.items.length} Booking{group.items.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 px-3 py-1 rounded-full">
                  Total Guests: {group.items.reduce((sum, r) => sum + (r.guests || 2), 0)}
                </span>
              </div>

              {/* Table of items for this date */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-800/60 bg-neutral-950/40 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                      <th className="py-3 px-5">Client</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Party &amp; Area</th>
                      <th className="py-3 px-4">Table</th>
                      <th className="py-3 px-4">Occasion &amp; Addons</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/40">
                    {group.items.map((res) => (
                      <ReservationRow
                        key={res._id || res.id}
                        res={res}
                        onSelectDetails={() => setSelectedRes(res)}
                        onOpenAssign={() =>
                          setAssignModal({
                            open: true,
                            res,
                            tableNo: res.tableNo || "T1",
                            area: res.area || "Main Room",
                          })
                        }
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDeleteReservation}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= FLAT TABLE VIEW ================= */
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 uppercase tracking-wider font-mono text-[10px]">
                  <th className="py-4 px-5">Client</th>
                  <th className="py-4 px-4">Date &amp; Time</th>
                  <th className="py-4 px-4">Party &amp; Area</th>
                  <th className="py-4 px-4">Table</th>
                  <th className="py-4 px-4">Occasion &amp; Addons</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredAndSortedReservations.map((res) => (
                  <ReservationRow
                    key={res._id || res.id}
                    res={res}
                    showFullDate={true}
                    onSelectDetails={() => setSelectedRes(res)}
                    onOpenAssign={() =>
                      setAssignModal({
                        open: true,
                        res,
                        tableNo: res.tableNo || "T1",
                        area: res.area || "Main Room",
                      })
                    }
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteReservation}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CLIENT RESERVATION DETAILS MODAL ── */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-white animate-in fade-in">
            <button
              onClick={() => setSelectedRes(null)}
              className="absolute right-5 top-5 text-neutral-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Client Reservation Details</h3>
                <p className="text-xs text-amber-400 font-mono">{selectedRes.passCode || "RES-GUEST"}</p>
              </div>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Client Name</span>
                  <span className="font-bold text-white text-sm">{selectedRes.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Party Size</span>
                  <span className="font-bold text-amber-400 text-sm">{selectedRes.guests} Guests</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Date &amp; Time</span>
                  <span className="text-neutral-300 font-semibold">
                    {selectedRes.date ? new Date(selectedRes.date).toLocaleString() : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Seating Area &amp; Table</span>
                  <span className="text-amber-300 font-mono font-bold">
                    Table {selectedRes.tableNo || "T1"} ({selectedRes.area || "Main Room"})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Mobile Phone</span>
                  <p className="text-neutral-300 font-mono">{selectedRes.phone || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Email Address</span>
                  <p className="text-neutral-300">{selectedRes.email || "N/A"}</p>
                </div>
              </div>

              {selectedRes.dietary && selectedRes.dietary.length > 0 && (
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Dietary Preferences</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRes.dietary.map((d, i) => (
                      <span key={i} className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRes.preOrders && selectedRes.preOrders.length > 0 && (
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Pre-Ordered Items</span>
                  <div className="space-y-1">
                    {selectedRes.preOrders.map((p, i) => (
                      <div key={i} className="flex justify-between text-[11px] bg-neutral-900 px-2.5 py-1 rounded">
                        <span>{p.name}</span>
                        <span className="text-amber-400 font-bold">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRes.notes && (
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase block mb-1">Client Special Requests / Notes</span>
                  <p className="text-neutral-300 text-[11px] italic bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                    &quot;{selectedRes.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {selectedRes.status === "Pending" && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedRes._id!, "Confirmed", selectedRes.tableNo, selectedRes.area);
                    setSelectedRes(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider"
                >
                  Confirm Reservation
                </button>
              )}
              <button
                onClick={() => setSelectedRes(null)}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN TABLE MODAL ── */}
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
                <h3 className="font-serif text-lg font-bold text-white">Assign Table to Client</h3>
                <p className="text-xs text-neutral-400">{assignModal.res.name} ({assignModal.res.guests} Guests)</p>
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
                  {actionLoading ? "Confirming…" : "Confirm Table"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE DIRECT RESERVATION MODAL ── */}
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
                <h3 className="font-serif text-lg font-bold text-white">Add Direct Reservation</h3>
                <p className="text-xs text-neutral-400">Create client booking</p>
              </div>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Client Full Name</label>
                <input
                  required
                  placeholder="e.g. Amit Patel"
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
                    placeholder="client@example.com"
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
                <label className="block text-neutral-400 font-semibold mb-1">Special Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special requests or dietary needs..."
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
                  {actionLoading ? "Saving…" : "Save Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── REUSABLE RESERVATION ROW COMPONENT ──
function ReservationRow({
  res,
  showFullDate = false,
  onSelectDetails,
  onOpenAssign,
  onUpdateStatus,
  onDelete,
}: {
  res: ReservationItem;
  showFullDate?: boolean;
  onSelectDetails: () => void;
  onOpenAssign: () => void;
  onUpdateStatus: (id: string, status: string, tableNo?: string, area?: string) => void;
  onDelete: (id: string) => void;
}) {
  const resTime = res.date
    ? new Date(res.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "7:30 PM";

  const resDateStr = res.date
    ? new Date(res.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const clientInitials = res.name
    ? res.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CL";

  return (
    <tr className="hover:bg-neutral-800/40 transition group">
      {/* Client Info */}
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/80 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            {clientInitials}
          </div>
          <div>
            <p className="font-bold text-white text-sm group-hover:text-amber-400 transition">
              {res.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
              <span className="text-amber-400/90 font-mono font-semibold">
                {res.passCode || "RES-GUEST"}
              </span>
              <span>·</span>
              <span className="font-mono">{res.phone || "No phone"}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Date & Time */}
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          {showFullDate && <span className="font-semibold text-white block text-xs">{resDateStr}</span>}
          <span className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            {resTime}
          </span>
        </div>
      </td>

      {/* Party & Area */}
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          <span className="font-bold text-white block text-xs">{res.guests} Guests</span>
          <span className="text-[11px] text-neutral-400 block font-medium">
            {res.area || "Main Room"}
          </span>
        </div>
      </td>

      {/* Table */}
      <td className="py-3.5 px-4">
        {res.tableNo ? (
          <button
            onClick={onOpenAssign}
            title="Click to change table"
            className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl font-bold font-mono text-xs transition"
          >
            Table {res.tableNo}
          </button>
        ) : (
          <button
            onClick={onOpenAssign}
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl"
          >
            + Assign Table
          </button>
        )}
      </td>

      {/* Occasion & Addons */}
      <td className="py-3.5 px-4">
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
      <td className="py-3.5 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
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

      {/* Actions */}
      <td className="py-3.5 px-5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* If Pending, Confirm button */}
          {res.status === "Pending" && (
            <button
              onClick={onOpenAssign}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1 text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Confirm
            </button>
          )}

          {/* If Confirmed, Seat Now */}
          {res.status === "Confirmed" && (
            <button
              onClick={() => onUpdateStatus(res._id!, "Seated", res.tableNo, res.area)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold transition flex items-center gap-1 text-xs"
            >
              <Users className="w-3.5 h-3.5" />
              Seat
            </button>
          )}

          {/* If Seated, Complete */}
          {res.status === "Seated" && (
            <button
              onClick={() => onUpdateStatus(res._id!, "Completed", res.tableNo, res.area)}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-bold transition text-xs"
            >
              Complete
            </button>
          )}

          {/* View details */}
          <button
            onClick={onSelectDetails}
            title="View Details"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(res._id!)}
            title="Delete"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
