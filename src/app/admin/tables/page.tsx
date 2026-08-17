"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, QrCode, Download, Edit2, Loader2, Table as TableIcon } from "lucide-react";
import API_BASE_URL from "@/lib/api";

export default function AdminTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: "2" });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTables(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async () => {
    if (!newTable.tableNumber) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/tables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableNumber: parseInt(newTable.tableNumber),
          capacity: parseInt(newTable.capacity),
        }),
      });
      if (res.ok) {
        fetchTables();
        setIsAdding(false);
        setNewTable({ tableNumber: "", capacity: "2" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTables((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadQR = async (table: any) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(table.qrCodeUrl)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `Table-${table.tableNumber}-QR.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR", err);
      window.open(qrUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Operations
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Tables</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Manage dine-in tables and generate QR codes.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-bold hover:bg-amber-400 transition"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4" /> Add Table</>}
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-neutral-400 mb-1">Table Number</label>
            <input
              type="number"
              value={newTable.tableNumber}
              onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
              placeholder="e.g. 10"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-neutral-400 mb-1">Seating Capacity</label>
            <input
              type="number"
              value={newTable.capacity}
              onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
              className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none"
            />
          </div>
          <button
            onClick={handleAddTable}
            className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold hover:bg-emerald-500/30 transition"
          >
            Save Table
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div key={table._id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              table.status === 'Occupied' ? 'bg-red-500' : 
              table.status === 'Reserved' ? 'bg-blue-500' : 'bg-emerald-500'
            }`} />
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                  <TableIcon className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Table {table.tableNumber}</h3>
                  <p className="text-xs text-neutral-400">Seats: {table.capacity}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-bold ${
                table.status === 'Occupied' ? 'bg-red-500/20 text-red-400' : 
                table.status === 'Reserved' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {table.status}
              </div>
            </div>
            <div className="flex items-center justify-center py-4 border-y border-neutral-800/50 mb-4 bg-black/20 rounded-lg">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(table.qrCodeUrl)}&color=255-191-0&bgcolor=26-26-26`} 
                alt={`QR Code for Table ${table.tableNumber}`}
                className="w-24 h-24 rounded-lg shadow-md"
                crossOrigin="anonymous"
              />
            </div>
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handleDownloadQR(table)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition"
              >
                <Download className="w-4 h-4" /> Download QR
              </button>
              <button 
                onClick={() => handleDelete(table._id)}
                className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {tables.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl border-dashed">
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No tables configured yet.</p>
            <button onClick={() => setIsAdding(true)} className="mt-3 text-amber-500 text-sm hover:underline">
              Add your first table
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
