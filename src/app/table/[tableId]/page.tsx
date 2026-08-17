"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Utensils, Bell, Receipt, Loader2, CheckCircle2 } from "lucide-react";
import API_BASE_URL from "@/lib/api";

export default function TablePortal() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.tableId as string;

  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (tableId) {
      // Save table context for cart/checkout
      localStorage.setItem("tableSessionId", tableId);
      fetchTableInfo();
    }
  }, [tableId]);

  const fetchTableInfo = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}`);
      if (res.ok) {
        const data = await res.json();
        setTable(data);
        localStorage.setItem("tableSessionNumber", data.tableNumber);
      } else {
        setMessage("Invalid Table QR Code.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error loading table information.");
    } finally {
      setLoading(false);
    }
  };

  const handleCallWaiter = async (requestType: string) => {
    setCalling(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}/call-waiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType }),
      });
      if (res.ok) {
        setMessage(`Waiter notified for: ${requestType}`);
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage("Failed to call waiter. Please try again.");
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl text-red-500 font-bold mb-2">Oops!</h1>
          <p className="text-neutral-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="text-center mt-8 mb-12">
        <span className="text-xs tracking-widest text-amber-500 font-bold uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          In-House Dining
        </span>
        <h1 className="text-4xl font-serif mt-4">Table {table.tableNumber}</h1>
        <p className="text-neutral-400 mt-2">Welcome to VELORA! What would you like to do?</p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
        
        <button
          onClick={() => router.push("/menu")}
          className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-amber-500 hover:bg-neutral-800 transition group"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <Utensils className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold">Browse Menu & Order</h2>
            <p className="text-xs text-neutral-400">Order directly to your table.</p>
          </div>
        </button>

        <button
          onClick={() => handleCallWaiter("General")}
          disabled={calling}
          className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-blue-500 hover:bg-neutral-800 transition group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Bell className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold">Call Waiter</h2>
            <p className="text-xs text-neutral-400">Request assistance at your table.</p>
          </div>
        </button>

        <button
          onClick={() => handleCallWaiter("Bill")}
          disabled={calling}
          className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-emerald-500 hover:bg-neutral-800 transition group disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold">Request Bill</h2>
            <p className="text-xs text-neutral-400">Ready to pay and leave.</p>
          </div>
        </button>

      </div>

      {/* Status Message */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-neutral-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}
    </div>
  );
}
