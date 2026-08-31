"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Users,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Clock,
  PieChart,
  Star,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  PhoneCall,
  Flame,
  RotateCcw,
  Tag,
  MessageSquare,
  RefreshCw,
  UserCheck,
  Check,
  Coffee,
  AlertCircle
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

export interface ReservationItem {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  email?: string;
  date?: string | Date;
  time?: string;
  guests: number;
  area: string;
  tableNo: string;
  status: "Pending" | "Confirmed" | "Seated" | "Completed" | "Declined" | "Waitlisted" | "Waiting";
  vip?: boolean;
  leaf?: boolean;
  occasion?: string;
  notes?: string;
  passCode?: string;
  dietary?: string[];
  preOrders?: any[];
  specialRequests?: string;
  totalAmount?: number;
  waitTime?: string;
  addedAt?: number;
}

export interface TableData {
  id: string;
  _id?: string;
  tableNo: string;
  tableNumber?: number;
  area: "Main Room" | "Patio" | "Terrace" | "Lounge";
  capacity: number;
  status: "Occupied" | "Reserved" | "Vacant" | "Cleaning";
  guestName?: string;
  time?: string;
  phone?: string;
  guestsCount?: number;
  reservationId?: string;
  shape?: "normal" | "long" | "round";
  position?: { row: number; col: number };
  vip?: boolean;
  leaf?: boolean;
  occasion?: string;
  seatedMinutes?: number;
}

const DEFAULT_TABLE_CONFIGS: TableData[] = [
  // Main Room
  { id: "tbl-1", tableNo: "T1", tableNumber: 1, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 1, col: 1 } },
  { id: "tbl-2", tableNo: "T2", tableNumber: 2, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 2, col: 1 } },
  { id: "tbl-3", tableNo: "T3", tableNumber: 3, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 3, col: 1 } },
  { id: "tbl-4", tableNo: "T4", tableNumber: 4, area: "Main Room", capacity: 6, status: "Vacant", shape: "long", position: { row: 1, col: 2 } },
  { id: "tbl-5", tableNo: "T5", tableNumber: 5, area: "Main Room", capacity: 6, status: "Vacant", shape: "long", position: { row: 3, col: 2 } },
  { id: "tbl-6", tableNo: "T6", tableNumber: 6, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 1, col: 3 } },
  { id: "tbl-7", tableNo: "T7", tableNumber: 7, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 2, col: 3 } },
  { id: "tbl-8", tableNo: "T8", tableNumber: 8, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 3, col: 3 } },
  { id: "tbl-9", tableNo: "T9", tableNumber: 9, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 1, col: 4 } },
  { id: "tbl-10", tableNo: "T10", tableNumber: 10, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 2, col: 4 } },
  { id: "tbl-11", tableNo: "T11", tableNumber: 11, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 3, col: 4 } },
  { id: "tbl-12", tableNo: "T12", tableNumber: 12, area: "Main Room", capacity: 4, status: "Vacant", position: { row: 4, col: 3 } },

  // Patio
  { id: "tbl-p1", tableNo: "P1", tableNumber: 101, area: "Patio", capacity: 2, status: "Vacant", shape: "round", position: { row: 1, col: 1 } },
  { id: "tbl-p2", tableNo: "P2", tableNumber: 102, area: "Patio", capacity: 2, status: "Vacant", shape: "round", position: { row: 1, col: 2 } },
  { id: "tbl-p3", tableNo: "P3", tableNumber: 103, area: "Patio", capacity: 4, status: "Vacant", position: { row: 2, col: 1 } },
  { id: "tbl-p4", tableNo: "P4", tableNumber: 104, area: "Patio", capacity: 4, status: "Vacant", position: { row: 2, col: 2 } },
  { id: "tbl-p5", tableNo: "P5", tableNumber: 105, area: "Patio", capacity: 4, status: "Vacant", position: { row: 3, col: 1 } },
  { id: "tbl-p6", tableNo: "P6", tableNumber: 106, area: "Patio", capacity: 4, status: "Vacant", position: { row: 3, col: 2 } },

  // Terrace
  { id: "tbl-t1", tableNo: "R1", tableNumber: 201, area: "Terrace", capacity: 4, status: "Vacant", position: { row: 1, col: 1 } },
  { id: "tbl-t2", tableNo: "R2", tableNumber: 202, area: "Terrace", capacity: 4, status: "Vacant", position: { row: 1, col: 2 } },
  { id: "tbl-t3", tableNo: "R3", tableNumber: 203, area: "Terrace", capacity: 6, status: "Vacant", shape: "long", position: { row: 2, col: 1 } },
  { id: "tbl-t4", tableNo: "R4", tableNumber: 204, area: "Terrace", capacity: 6, status: "Vacant", shape: "long", position: { row: 2, col: 2 } },
  { id: "tbl-t5", tableNo: "R5", tableNumber: 205, area: "Terrace", capacity: 4, status: "Vacant", position: { row: 3, col: 1 } },
  { id: "tbl-t6", tableNo: "R6", tableNumber: 206, area: "Terrace", capacity: 4, status: "Vacant", position: { row: 3, col: 2 } },

  // Lounge
  { id: "tbl-l1", tableNo: "L1", tableNumber: 301, area: "Lounge", capacity: 4, status: "Vacant", position: { row: 1, col: 1 } },
  { id: "tbl-l2", tableNo: "L2", tableNumber: 302, area: "Lounge", capacity: 6, status: "Vacant", shape: "long", position: { row: 1, col: 2 } },
  { id: "tbl-l3", tableNo: "L3", tableNumber: 303, area: "Lounge", capacity: 4, status: "Vacant", position: { row: 2, col: 1 } },
  { id: "tbl-l4", tableNo: "L4", tableNumber: 304, area: "Lounge", capacity: 6, status: "Vacant", shape: "long", position: { row: 2, col: 2 } },
];

interface FloorPlanViewProps {
  token?: string;
  initialReservations?: ReservationItem[];
  onDataRefresh?: () => void;
}

export default function FloorPlanView({
  token: propToken,
  initialReservations = [],
  onDataRefresh,
}: FloorPlanViewProps) {
  const [activeTab, setActiveTab] = useState<"RESERVATION" | "WAITING">("RESERVATION");
  const [activeArea, setActiveArea] = useState<"Main Room" | "Patio" | "Terrace" | "Lounge">("Main Room");
  const [searchQuery, setSearchQuery] = useState("");
  const [mealPeriod, setMealPeriod] = useState("Dinner");
  
  const [tables, setTables] = useState<TableData[]>(DEFAULT_TABLE_CONFIGS);
  const [dbReservations, setDbReservations] = useState<ReservationItem[]>(initialReservations);
  const [waitlist, setWaitlist] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [smsModal, setSmsModal] = useState<{ open: boolean; name: string; phone: string } | null>(null);

  // Modals state
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isNewResModalOpen, setIsNewResModalOpen] = useState(false);
  const [isNewWaitlistOpen, setIsNewWaitlistOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAuthToken = useCallback(() => {
    return propToken || (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");
  }, [propToken]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch live reservations & tables from API
  const fetchLiveData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setLoading(true);
    try {
      // 1. Fetch reservations
      const resRes = await fetch(`${API_BASE_URL}/api/reservations/all?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let fetchedReservations: ReservationItem[] = [];
      if (resRes.ok) {
        fetchedReservations = await resRes.json();
        setDbReservations(fetchedReservations);
      }

      // Filter waitlist
      const waitlistItems = fetchedReservations.filter((r) => r.status === "Waitlisted");
      setWaitlist(waitlistItems);

      // 2. Map reservations onto table layout
      setTables((prevTables) => {
        return prevTables.map((tbl) => {
          // Find matching active seated or reserved reservation for this table
          const matchedSeated = fetchedReservations.find(
            (r) =>
              (r.tableNo === tbl.tableNo || r.tableId === tbl.tableNo) &&
              r.status === "Seated"
          );

          if (matchedSeated) {
            const timeStr = matchedSeated.date
              ? new Date(matchedSeated.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Now";
            return {
              ...tbl,
              status: "Occupied",
              guestName: matchedSeated.name,
              phone: matchedSeated.phone,
              time: timeStr,
              guestsCount: matchedSeated.guests,
              reservationId: matchedSeated._id,
              occasion: matchedSeated.occasion,
              seatedMinutes: tbl.seatedMinutes || 15,
            };
          }

          const matchedReserved = fetchedReservations.find(
            (r) =>
              (r.tableNo === tbl.tableNo || r.tableId === tbl.tableNo) &&
              r.status === "Confirmed"
          );

          if (matchedReserved) {
            const timeStr = matchedReserved.date
              ? new Date(matchedReserved.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "8:00 PM";
            return {
              ...tbl,
              status: "Reserved",
              guestName: matchedReserved.name,
              phone: matchedReserved.phone,
              time: timeStr,
              guestsCount: matchedReserved.guests,
              reservationId: matchedReserved._id,
              occasion: matchedReserved.occasion,
            };
          }

          // If no active reservation, keep vacant or cleaning
          if (tbl.status === "Cleaning") return tbl;
          return {
            ...tbl,
            status: "Vacant",
            guestName: undefined,
            phone: undefined,
            time: undefined,
            guestsCount: undefined,
            reservationId: undefined,
            occasion: undefined,
            seatedMinutes: undefined,
          };
        });
      });
    } catch (err) {
      console.error("Error fetching live floor plan data:", err);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Live timer for occupied tables
  useEffect(() => {
    const timer = setInterval(() => {
      setTables((prev) =>
        prev.map((t) =>
          t.status === "Occupied"
            ? { ...t, seatedMinutes: (t.seatedMinutes || 0) + 1 }
            : t
        )
      );
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Form states
  const [newResForm, setNewResForm] = useState({
    name: "",
    phone: "",
    email: "",
    time: "7:30 PM",
    date: new Date().toISOString().split("T")[0],
    guests: 2,
    area: "Main Room" as "Main Room" | "Patio" | "Terrace" | "Lounge",
    tableNo: "T1",
    notes: "",
    vip: false,
    leaf: false,
    occasion: "General",
  });

  const [newWaitForm, setNewWaitForm] = useState({
    name: "",
    phone: "",
    guests: 2,
    area: "Main Room" as "Main Room" | "Patio" | "Terrace" | "Lounge",
    notes: "",
    occasion: "General",
  });

  const openReservationForTable = (tbl: TableData) => {
    setNewResForm((prev) => ({
      ...prev,
      tableNo: tbl.tableNo,
      area: tbl.area,
      guests: tbl.capacity,
    }));
    setSelectedTable(null);
    setIsNewResModalOpen(true);
  };

  // Metrics per area
  const areaMetrics = useMemo(() => {
    const calc = (areaName: string) => {
      const areaTbls = tables.filter((t) => t.area === areaName);
      const occupiedCount = areaTbls.filter((t) => t.status === "Occupied").length;
      return { occupied: occupiedCount, total: areaTbls.length };
    };
    return {
      main: calc("Main Room"),
      patio: calc("Patio"),
      terrace: calc("Terrace"),
      lounge: calc("Lounge"),
    };
  }, [tables]);

  const totalOccupied = useMemo(() => tables.filter((t) => t.status === "Occupied").length, [tables]);
  const capacityPercent = useMemo(
    () => Math.round((totalOccupied / Math.max(1, tables.length)) * 100),
    [totalOccupied, tables.length]
  );

  const currentAreaTables = useMemo(
    () => tables.filter((t) => t.area === activeArea),
    [tables, activeArea]
  );

  const seatedGuests = useMemo(() => {
    return tables
      .filter((t) => t.status === "Occupied" && t.guestName)
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.guestName?.toLowerCase().includes(q) ||
          t.tableNo.toLowerCase().includes(q) ||
          t.phone?.includes(q)
        );
      });
  }, [tables, searchQuery]);

  const upcomingReservations = useMemo(() => {
    return tables
      .filter((t) => t.status === "Reserved" && t.guestName)
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.guestName?.toLowerCase().includes(q) ||
          t.tableNo.toLowerCase().includes(q) ||
          t.phone?.includes(q)
        );
      });
  }, [tables, searchQuery]);

  const filteredWaitlist = useMemo(() => {
    return waitlist.filter((w) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return w.name.toLowerCase().includes(q) || w.phone?.includes(q);
    });
  }, [waitlist, searchQuery]);

  // Update table status in database & local state
  const handleUpdateTableStatus = async (
    tableId: string,
    newStatus: "Occupied" | "Reserved" | "Vacant" | "Cleaning",
    guestDetails?: Partial<TableData>
  ) => {
    const tbl = tables.find((t) => t.id === tableId);
    if (!tbl) return;

    const token = getAuthToken();

    // If there's an associated reservation, update it on the backend
    if (tbl.reservationId && token) {
      try {
        let backendStatus = "Confirmed";
        if (newStatus === "Occupied") backendStatus = "Seated";
        else if (newStatus === "Vacant") backendStatus = "Completed";

        await fetch(`${API_BASE_URL}/api/reservations/${tbl.reservationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: backendStatus,
            tableNo: tbl.tableNo,
            area: tbl.area,
          }),
        });
      } catch (err) {
        console.error("Failed to update reservation status in backend:", err);
      }
    }

    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          if (newStatus === "Vacant") {
            showToast(`Table ${t.tableNo} is now vacant`);
            return {
              ...t,
              status: "Vacant",
              guestName: undefined,
              time: undefined,
              phone: undefined,
              guestsCount: undefined,
              reservationId: undefined,
              seatedMinutes: undefined,
              vip: undefined,
              leaf: undefined,
              occasion: undefined,
            };
          }
          if (newStatus === "Cleaning") {
            showToast(`Table ${t.tableNo} marked for cleaning`);
            return { ...t, status: "Cleaning" };
          }
          showToast(`Table ${t.tableNo} set to ${newStatus}`);
          return {
            ...t,
            status: newStatus,
            guestName: guestDetails?.guestName ?? t.guestName ?? "Guest",
            time: guestDetails?.time ?? t.time ?? "Now",
            phone: guestDetails?.phone ?? t.phone,
            guestsCount: guestDetails?.guestsCount ?? t.guestsCount ?? t.capacity,
            seatedMinutes: newStatus === "Occupied" ? 1 : t.seatedMinutes,
          };
        }
        return t;
      })
    );

    setSelectedTable(null);
    if (onDataRefresh) onDataRefresh();
  };

  // Seat guest from waitlist to table
  const handleSeatWaitlistGuest = async (waitId: string, tableNo: string) => {
    const item = waitlist.find((w) => (w._id === waitId || w.id === waitId));
    if (!item) return;

    const token = getAuthToken();
    if (token && item._id) {
      try {
        await fetch(`${API_BASE_URL}/api/reservations/${item._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Seated",
            tableNo: tableNo,
            area: activeArea,
          }),
        });
      } catch (err) {
        console.error("Failed to seat waitlist guest:", err);
      }
    }

    setTables((prev) =>
      prev.map((t) => {
        if (t.tableNo === tableNo && t.area === activeArea) {
          return {
            ...t,
            status: "Occupied",
            guestName: item.name,
            phone: item.phone,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            guestsCount: item.guests,
            seatedMinutes: 1,
            occasion: item.occasion,
            reservationId: item._id,
          };
        }
        return t;
      })
    );

    setWaitlist((prev) => prev.filter((w) => (w._id !== waitId && w.id !== waitId)));
    showToast(`Seated ${item.name} at Table ${tableNo}`);
    if (onDataRefresh) onDataRefresh();
  };

  const handleSendSmsAlert = (name: string, phone: string) => {
    setSmsModal({ open: true, name, phone });
  };

  const confirmSendSms = () => {
    if (smsModal) {
      showToast(`📱 SMS alert sent to ${smsModal.name} (${smsModal.phone})!`);
      setSmsModal(null);
    }
  };

  // Create new reservation directly on a table
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = getAuthToken();

    try {
      const combinedDate = `${newResForm.date}T${newResForm.time}`;
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newResForm.name,
          email: newResForm.email || `${newResForm.name.toLowerCase().replace(/\s+/g, "")}@example.com`,
          phone: newResForm.phone,
          date: combinedDate,
          guests: newResForm.guests,
          tableNo: newResForm.tableNo,
          area: newResForm.area,
          occasion: newResForm.occasion,
          notes: newResForm.notes,
        }),
      });

      if (res.ok) {
        showToast(`Reservation confirmed for ${newResForm.name} at Table ${newResForm.tableNo}!`);
        setIsNewResModalOpen(false);
        fetchLiveData();
        if (onDataRefresh) onDataRefresh();
      } else {
        showToast("Error creating reservation");
      }
    } catch (err) {
      console.error("Failed to post reservation to backend:", err);
      showToast("Server connection error");
    } finally {
      setSubmitting(false);
    }
  };

  // Add walk-in to waitlist
  const handleCreateWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();

    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newWaitForm.name,
          phone: newWaitForm.phone,
          email: "waitlist@guest.com",
          date: new Date().toISOString(),
          guests: newWaitForm.guests,
          area: newWaitForm.area,
          isWaitlist: true,
          occasion: newWaitForm.occasion,
          notes: newWaitForm.notes,
        }),
      });

      if (res.ok) {
        showToast(`Added ${newWaitForm.name} to waitlist`);
        setIsNewWaitlistOpen(false);
        setNewWaitForm({ name: "", phone: "", guests: 2, area: activeArea, notes: "", occasion: "General" });
        fetchLiveData();
        if (onDataRefresh) onDataRefresh();
      }
    } catch (err) {
      console.error("Error creating waitlist:", err);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-[#131620] border border-[#212638] shadow-2xl overflow-hidden text-[#e2e8f0] font-sans relative">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2563eb] text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl border border-blue-400/40 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col xl:flex-row min-h-[750px]">
        {/* ================= LEFT HOST STAND SIDEBAR ================= */}
        <div className="w-full xl:w-[350px] bg-[#181b26] border-r border-[#212638] flex flex-col shrink-0">
          {/* Top Segmented Tabs: RESERVATION / WAITING */}
          <div className="p-4 border-b border-[#212638]">
            <div className="grid grid-cols-2 w-full p-1 bg-[#0e1017] rounded-2xl border border-[#262b3c]">
              <button
                onClick={() => setActiveTab("RESERVATION")}
                className={`py-2.5 px-3 text-xs font-bold tracking-wider rounded-xl transition-all ${
                  activeTab === "RESERVATION"
                    ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/25"
                    : "text-[#8e98b0] hover:text-white"
                }`}
              >
                RESERVATIONS ({seatedGuests.length + upcomingReservations.length})
              </button>
              <button
                onClick={() => setActiveTab("WAITING")}
                className={`py-2.5 px-3 text-xs font-bold tracking-wider rounded-xl transition-all ${
                  activeTab === "WAITING"
                    ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/25"
                    : "text-[#8e98b0] hover:text-white"
                }`}
              >
                WAITING ({waitlist.length})
              </button>
            </div>
          </div>

          {/* Search Guest Input */}
          <div className="px-4 py-3 border-b border-[#212638] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                placeholder="Search Guest, Table, or Phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0e14] border border-[#232838] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#2563eb] transition"
              />
            </div>
            <button
              onClick={fetchLiveData}
              disabled={loading}
              title="Refresh Live Floor Plan"
              className="p-2.5 bg-[#0d0e14] border border-[#232838] rounded-xl text-[#8e98b0] hover:text-white hover:border-[#2563eb] transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[640px] custom-scrollbar">
            {activeTab === "RESERVATION" ? (
              <>
                {/* SEATED GUESTS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[#38bdf8] font-bold text-xs tracking-wider uppercase">
                      <Users className="w-3.5 h-3.5" />
                      <span>Currently Seated</span>
                    </div>
                    <span className="text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded-full border border-[#38bdf8]/20">
                      {seatedGuests.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {seatedGuests.length === 0 ? (
                      <p className="text-xs text-[#64748b] italic py-2">No guests currently seated</p>
                    ) : (
                      seatedGuests.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setSelectedTable(g)}
                          className="group relative bg-[#10121a] hover:bg-[#1f2434] border border-[#232838] hover:border-[#38bdf8]/50 rounded-2xl p-3.5 transition cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-semibold text-[#94a3b8] bg-[#1a1d29] border border-[#262b3c] px-2 py-1 rounded-md">
                                {g.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-[#38bdf8] transition flex items-center gap-1.5">
                                  {g.guestName}
                                  {g.occasion === "Birthday" && <span title="Birthday">🎂</span>}
                                  {g.occasion === "Anniversary" && <span title="Anniversary">💍</span>}
                                  {g.occasion === "Business Dinner" && <span title="Business">💼</span>}
                                </h4>
                                <p className="text-[11px] text-[#64748b] mt-0.5">{g.phone || "No phone"}</p>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-[#38bdf8] bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-2.5 py-1 rounded-lg">
                              {g.tableNo}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#94a3b8] pt-2 border-t border-[#1e2230]">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-[#38bdf8]" />
                              {g.seatedMinutes || 15}m seated
                            </span>
                            <span className="text-xs font-semibold text-emerald-400">
                              {g.guestsCount || g.capacity} Guests · {g.area}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* UPCOMING RESERVATIONS */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[#eab308] font-bold text-xs tracking-wider uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Confirmed Reserved</span>
                    </div>
                    <span className="text-xs font-bold text-[#eab308] bg-[#eab308]/10 px-2 py-0.5 rounded-full border border-[#eab308]/20">
                      {upcomingReservations.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {upcomingReservations.length === 0 ? (
                      <p className="text-xs text-[#64748b] italic py-2">No upcoming table assignments</p>
                    ) : (
                      upcomingReservations.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setSelectedTable(g)}
                          className="group bg-[#10121a] hover:bg-[#1f2434] border border-[#232838] hover:border-amber-500/50 rounded-2xl p-3.5 transition cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[11px] font-semibold text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/20 px-2 py-1 rounded-md">
                                {g.time}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                                  {g.guestName}
                                </h4>
                                <p className="text-[11px] text-[#64748b] mt-0.5">{g.phone || "No phone"}</p>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-[#eab308] bg-[#eab308]/10 border border-[#eab308]/30 px-2.5 py-1 rounded-lg">
                              {g.tableNo}
                            </span>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#94a3b8] pt-2 border-t border-[#1e2230]">
                            <span>{g.guestsCount || g.capacity} Guests / {g.area}</span>
                            {g.occasion && <span className="text-amber-300 font-semibold">{g.occasion}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* WAITING LIST QUEUE */
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                    Waitlist Queue
                  </span>
                  <button
                    onClick={() => setIsNewWaitlistOpen(true)}
                    className="text-xs text-[#2563eb] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Walk-in
                  </button>
                </div>

                {filteredWaitlist.length === 0 ? (
                  <p className="text-xs text-[#64748b] italic py-4 text-center">No guests in waitlist</p>
                ) : (
                  filteredWaitlist.map((w) => (
                    <div
                      key={w._id || w.id}
                      className="bg-[#10121a] border border-[#232838] rounded-2xl p-3.5 space-y-2 hover:border-[#2563eb]/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {w.name}
                          {w.occasion && <span className="text-[10px] text-amber-400">({w.occasion})</span>}
                        </h4>
                        <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          ~{w.waitTime || "15 min"}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94a3b8] flex justify-between items-center">
                        <span>{w.guests} Guests · {w.area || "Main Room"}</span>
                        <span className="text-[#64748b]">{w.phone}</span>
                      </div>

                      {w.notes && (
                        <p className="text-[10px] text-neutral-400 italic">
                          &quot;{w.notes}&quot;
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1e2230] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSendSmsAlert(w.name, w.phone)}
                          className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-amber-500/25 transition"
                        >
                          <Send className="w-3 h-3" /> SMS Alert
                        </button>

                        <select
                          onChange={(e) => {
                            if (e.target.value) handleSeatWaitlistGuest(w._id || w.id!, e.target.value);
                          }}
                          defaultValue=""
                          className="bg-[#141721] border border-[#2b3145] text-xs text-white rounded-lg px-2 py-1 focus:outline-none flex-1"
                        >
                          <option value="" disabled>
                            Seat at Table…
                          </option>
                          {currentAreaTables
                            .filter((t) => t.status === "Vacant")
                            .map((t) => (
                              <option key={t.id} value={t.tableNo}>
                                Table {t.tableNo} ({t.capacity} Seats)
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT FLOOR PLAN CANVAS ================= */}
        <div className="flex-1 flex flex-col bg-[#141620]">
          {/* Top Control Bar */}
          <div className="p-4 border-b border-[#212638] flex flex-wrap items-center justify-between gap-4 bg-[#181b26]/50">
            {/* Meal Shift Select */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={mealPeriod}
                  onChange={(e) => setMealPeriod(e.target.value)}
                  className="bg-[#0d0e14] border border-[#232838] rounded-xl px-3.5 py-2 text-xs font-semibold text-white appearance-none pr-8 focus:outline-none cursor-pointer"
                >
                  <option value="Dinner">Dinner Shift (6:00 PM – 11:30 PM)</option>
                  <option value="Lunch">Lunch Shift (12:00 PM – 3:30 PM)</option>
                  <option value="Breakfast">Breakfast Shift (8:00 AM – 11:00 AM)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right Controls: New Reservation Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsNewResModalOpen(true)}
                className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>+ Assign &amp; Book Table</span>
              </button>
            </div>
          </div>

          {/* Sub-Header Area Tabs & Capacity Metrics */}
          <div className="px-6 py-4 border-b border-[#212638] flex flex-wrap items-center justify-between gap-4">
            {/* Area Pill Switchers */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {(["Main Room", "Patio", "Terrace", "Lounge"] as const).map((area) => (
                <button
                  key={area}
                  onClick={() => setActiveArea(area)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeArea === area
                      ? "bg-[#1f2434] text-white border border-[#38bdf8]/50 shadow-md"
                      : "text-[#8e98b0] hover:text-white hover:bg-[#181b26]"
                  }`}
                >
                  <span>{area}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                      area === "Main Room"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : area === "Patio"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : area === "Terrace"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {areaMetrics[area.toLowerCase().replace(" ", "") as keyof typeof areaMetrics]?.occupied || 0}/
                    {areaMetrics[area.toLowerCase().replace(" ", "") as keyof typeof areaMetrics]?.total || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Metrics Display */}
            <div className="flex items-center gap-5 text-xs text-[#94a3b8]">
              <div className="flex items-center gap-2 bg-[#0d0e14] px-3 py-1.5 rounded-xl border border-[#232838]">
                <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Seated Tables:</span>
                <span className="font-bold text-white">{totalOccupied} / {tables.length}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0d0e14] px-3 py-1.5 rounded-xl border border-[#232838]">
                <PieChart className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Occupancy:</span>
                <span className="font-bold text-white">{capacityPercent}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Grid Canvas */}
          <div className="flex-1 p-6 sm:p-8 overflow-auto flex items-center justify-center min-h-[550px] bg-[#1a1d2e] bg-[radial-gradient(#2d344d_1.5px,transparent_1.5px)] [background-size:24px_24px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full auto-rows-[125px]">
              {currentAreaTables.map((tbl) => {
                const isOccupied = tbl.status === "Occupied";
                const isReserved = tbl.status === "Reserved";
                const isVacant = tbl.status === "Vacant";
                const isCleaning = tbl.status === "Cleaning";

                const capColor = isOccupied
                  ? "bg-[#38bdf8] shadow-md shadow-sky-400/40"
                  : isReserved
                  ? "bg-[#f59e0b] shadow-md shadow-amber-400/40"
                  : isCleaning
                  ? "bg-purple-500 shadow-md shadow-purple-400/40"
                  : "bg-[#10b981] shadow-md shadow-emerald-400/40";

                const textColor = isOccupied
                  ? "text-[#38bdf8]"
                  : isReserved
                  ? "text-[#f59e0b]"
                  : isCleaning
                  ? "text-purple-400"
                  : "text-[#10b981]";

                const badgeBg = isOccupied
                  ? "bg-[#38bdf8]/15 border-[#38bdf8]/30"
                  : isReserved
                  ? "bg-[#f59e0b]/15 border-[#f59e0b]/30"
                  : isCleaning
                  ? "bg-purple-500/15 border-purple-500/30"
                  : "bg-[#10b981]/15 border-[#10b981]/30";

                const gridStyle: React.CSSProperties = tbl.position
                  ? {
                      gridColumnStart: tbl.position.col,
                      gridRowStart: tbl.position.row,
                      gridRowEnd: tbl.shape === "long" ? `span 2` : `span 1`,
                    }
                  : {};

                return (
                  <div
                    key={tbl.id}
                    style={gridStyle}
                    onClick={() => setSelectedTable(tbl)}
                    className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none bg-[#252a3e] hover:bg-[#2e344d] ${
                      isOccupied
                        ? "border-[#38bdf8]/60 shadow-xl shadow-[#38bdf8]/10"
                        : isReserved
                        ? "border-[#f59e0b]/60 shadow-xl shadow-amber-500/10"
                        : isCleaning
                        ? "border-purple-500/60 shadow-xl shadow-purple-500/10"
                        : "border-[#10b981]/40 hover:border-[#10b981]/80"
                    }`}
                  >
                    {/* Seat Silhouettes */}
                    {tbl.shape === "long" ? (
                      <>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2">
                          <span className="w-5 h-2.5 bg-[#333b56] border border-[#485377] rounded-t-md" />
                          <span className="w-5 h-2.5 bg-[#333b56] border border-[#485377] rounded-t-md" />
                        </div>
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                          <span className="w-2.5 h-6 bg-[#333b56] border border-[#485377] rounded-l-md" />
                          <span className="w-2.5 h-6 bg-[#333b56] border border-[#485377] rounded-l-md" />
                        </div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                          <span className="w-2.5 h-6 bg-[#333b56] border border-[#485377] rounded-r-md" />
                          <span className="w-2.5 h-6 bg-[#333b56] border border-[#485377] rounded-r-md" />
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                          <span className="w-5 h-2.5 bg-[#333b56] border border-[#485377] rounded-b-md" />
                          <span className="w-5 h-2.5 bg-[#333b56] border border-[#485377] rounded-b-md" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
                          <span className="w-2.5 h-5 bg-[#333b56] border border-[#485377] rounded-l-md" />
                          <span className="w-2.5 h-5 bg-[#333b56] border border-[#485377] rounded-l-md" />
                        </div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2.5">
                          <span className="w-2.5 h-5 bg-[#333b56] border border-[#485377] rounded-r-md" />
                          <span className="w-2.5 h-5 bg-[#333b56] border border-[#485377] rounded-r-md" />
                        </div>
                      </>
                    )}

                    {/* Table Status Indicator Strip */}
                    <div className={`absolute right-0 top-3 bottom-3 w-3 rounded-l-lg ${capColor}`} />

                    {/* Table Header */}
                    <div className="w-full flex items-center justify-between text-neutral-300 text-xs font-bold">
                      <span className="bg-[#1a1d2e] px-2 py-0.5 rounded-md border border-[#373e57]">
                        {tbl.tableNo} ({tbl.capacity} Seats)
                      </span>
                      {tbl.seatedMinutes && (
                        <span className="text-[10px] font-semibold text-[#38bdf8] bg-[#38bdf8]/10 px-1.5 py-0.5 rounded border border-[#38bdf8]/20">
                          {tbl.seatedMinutes}m
                        </span>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="my-auto text-left pr-4">
                      {isVacant ? (
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeBg} ${textColor}`}>
                          Available
                        </span>
                      ) : isCleaning ? (
                        <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeBg} ${textColor}`}>
                          Cleaning…
                        </span>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-white truncate max-w-[115px] flex items-center gap-1">
                            {tbl.guestName}
                          </p>
                          <p className={`text-[11px] font-semibold ${textColor} mt-1 flex items-center gap-1`}>
                            {isOccupied ? "Occupied" : `Reserved ${tbl.time || ""}`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ACTION MODAL ================= */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b26] border border-[#262b3c] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute right-4 top-4 text-[#8e98b0] hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#2563eb]/20 border border-[#2563eb]/30 flex items-center justify-center font-bold text-[#38bdf8] text-lg">
                {selectedTable.tableNo}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Table {selectedTable.tableNo} — {selectedTable.area}
                </h3>
                <p className="text-xs text-[#8e98b0]">Capacity: {selectedTable.capacity} Guests</p>
              </div>
            </div>

            <div className="space-y-3 my-5 bg-[#10121a] p-4 rounded-xl border border-[#232838]">
              <div className="flex justify-between text-xs">
                <span className="text-[#8e98b0]">Current Status:</span>
                <span
                  className={`font-bold ${
                    selectedTable.status === "Occupied"
                      ? "text-[#38bdf8]"
                      : selectedTable.status === "Reserved"
                      ? "text-[#eab308]"
                      : selectedTable.status === "Cleaning"
                      ? "text-purple-400"
                      : "text-[#22c55e]"
                  }`}
                >
                  {selectedTable.status}
                </span>
              </div>

              {selectedTable.guestName && (
                <>
                  <div className="flex justify-between text-xs border-t border-[#1e2230] pt-2">
                    <span className="text-[#8e98b0]">Guest Name:</span>
                    <span className="font-bold text-white">{selectedTable.guestName}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-[#1e2230] pt-2">
                    <span className="text-[#8e98b0]">Time / Phone:</span>
                    <span className="text-[#94a3b8]">
                      {selectedTable.time || "N/A"} · {selectedTable.phone || "N/A"}
                    </span>
                  </div>
                </>
              )}

              {selectedTable.seatedMinutes && (
                <div className="flex justify-between text-xs border-t border-[#1e2230] pt-2">
                  <span className="text-[#8e98b0]">Seated Duration:</span>
                  <span className="text-[#38bdf8] font-bold">{selectedTable.seatedMinutes} minutes elapsed</span>
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {selectedTable.status === "Vacant" && (
                <button
                  onClick={() => openReservationForTable(selectedTable)}
                  className="col-span-2 w-full bg-[#2563eb] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#1d4ed8] transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Book Table {selectedTable.tableNo} ({selectedTable.capacity} Seats)
                </button>
              )}

              {selectedTable.status !== "Occupied" && (
                <button
                  onClick={() =>
                    handleUpdateTableStatus(selectedTable.id, "Occupied", {
                      guestName: selectedTable.guestName || "Walk-in Guest",
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    })
                  }
                  className="w-full bg-[#38bdf8]/15 border border-[#38bdf8]/30 text-[#38bdf8] py-2.5 rounded-xl text-xs font-bold hover:bg-[#38bdf8]/25 transition"
                >
                  Seat Guest
                </button>
              )}

              {selectedTable.status !== "Cleaning" && selectedTable.status !== "Vacant" && (
                <button
                  onClick={() => handleUpdateTableStatus(selectedTable.id, "Cleaning")}
                  className="w-full bg-purple-500/15 border border-purple-500/30 text-purple-300 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-500/25 transition"
                >
                  Mark Cleaning
                </button>
              )}

              {selectedTable.status !== "Vacant" && (
                <button
                  onClick={() => handleUpdateTableStatus(selectedTable.id, "Vacant")}
                  className="w-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-500/25 transition"
                >
                  Vacate Table
                </button>
              )}

              {selectedTable.status !== "Reserved" && (
                <button
                  onClick={() =>
                    handleUpdateTableStatus(selectedTable.id, "Reserved", {
                      guestName: selectedTable.guestName || "Reserved Guest",
                      time: "8:00 PM",
                    })
                  }
                  className="w-full bg-[#eab308]/15 border border-[#eab308]/30 text-[#eab308] py-2.5 rounded-xl text-xs font-bold hover:bg-[#eab308]/25 transition"
                >
                  Mark Reserved
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SMS ALERT MODAL ================= */}
      {smsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b26] border border-[#262b3c] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white">
            <button onClick={() => setSmsModal(null)} className="absolute right-4 top-4 text-[#8e98b0] hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Send Table Alert SMS</h3>
                <p className="text-xs text-[#8e98b0]">Recipient: {smsModal.name} ({smsModal.phone})</p>
              </div>
            </div>
            <div className="bg-[#10121a] p-4 rounded-xl border border-[#232838] text-xs text-neutral-300 my-4">
              &quot;Hello {smsModal.name}, your table at VELORA is ready! Please report to the host stand.&quot;
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSmsModal(null)} className="px-4 py-2 rounded-xl text-xs text-[#8e98b0] hover:text-white">Cancel</button>
              <button onClick={confirmSendSms} className="px-5 py-2.5 bg-[#2563eb] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20">Send SMS Now</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW RESERVATION MODAL ================= */}
      {isNewResModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b26] border border-[#262b3c] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative text-white">
            <button onClick={() => setIsNewResModalOpen(false)} className="absolute right-4 top-4 text-[#8e98b0] hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create Table Reservation</h3>
            <p className="text-xs text-[#8e98b0] mb-6">Assign guest to a table directly.</p>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Guest Full Name</label>
                <input
                  required
                  placeholder="John Doe"
                  value={newResForm.name}
                  onChange={(e) => setNewResForm({ ...newResForm, name: e.target.value })}
                  className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Phone Number</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={newResForm.phone}
                    onChange={(e) => setNewResForm({ ...newResForm, phone: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={newResForm.email}
                    onChange={(e) => setNewResForm({ ...newResForm, email: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Date</label>
                  <input
                    type="date"
                    value={newResForm.date}
                    onChange={(e) => setNewResForm({ ...newResForm, date: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Time Slot</label>
                  <input
                    placeholder="7:30 PM"
                    value={newResForm.time}
                    onChange={(e) => setNewResForm({ ...newResForm, time: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newResForm.guests}
                    onChange={(e) => setNewResForm({ ...newResForm, guests: Number(e.target.value) })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Area</label>
                  <select
                    value={newResForm.area}
                    onChange={(e) =>
                      setNewResForm({
                        ...newResForm,
                        area: e.target.value as "Main Room" | "Patio" | "Terrace" | "Lounge",
                      })
                    }
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Main Room">Main Room</option>
                    <option value="Patio">Patio</option>
                    <option value="Terrace">Terrace</option>
                    <option value="Lounge">Lounge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Table</label>
                  <select
                    value={newResForm.tableNo}
                    onChange={(e) => setNewResForm({ ...newResForm, tableNo: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    {tables
                      .filter((t) => t.area === newResForm.area)
                      .map((t) => (
                        <option key={t.id} value={t.tableNo}>
                          {t.tableNo} ({t.capacity} Seats)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewResModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8e98b0] hover:text-white">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  {submitting ? "Saving…" : "Confirm & Assign Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= NEW WAITLIST MODAL ================= */}
      {isNewWaitlistOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181b26] border border-[#262b3c] rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white">
            <button onClick={() => setIsNewWaitlistOpen(false)} className="absolute right-4 top-4 text-[#8e98b0] hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Add Walk-in to Waitlist</h3>
            <p className="text-xs text-[#8e98b0] mb-6">Track waiting walk-in guests.</p>

            <form onSubmit={handleCreateWaitlist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Guest Name</label>
                <input
                  required
                  placeholder="Guest Name"
                  value={newWaitForm.name}
                  onChange={(e) => setNewWaitForm({ ...newWaitForm, name: e.target.value })}
                  className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Phone</label>
                  <input
                    placeholder="+91 98765 43210"
                    value={newWaitForm.phone}
                    onChange={(e) => setNewWaitForm({ ...newWaitForm, phone: e.target.value })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newWaitForm.guests}
                    onChange={(e) => setNewWaitForm({ ...newWaitForm, guests: Number(e.target.value) })}
                    className="w-full bg-[#10121a] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#2563eb]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewWaitlistOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#8e98b0] hover:text-white">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#2563eb] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20">Add to Waitlist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
