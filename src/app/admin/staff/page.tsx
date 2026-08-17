"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { Clock, Play, Square, AlertCircle, History } from "lucide-react";

type Shift = {
  _id: string;
  user: { _id: string; name: string; email: string; role: string };
  clockInTime: string;
  clockOutTime: string | null;
  status: string;
};

export default function StaffPage() {
  const { token, user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyShifts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/shifts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load shifts");
      const data = await res.json();
      setShifts(data.shifts);
      setActiveShift(data.activeShift);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMyShifts();
  }, [token]);

  const handleClockIn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/shifts/clock-in`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to clock in");
      }
      fetchMyShifts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClockOut = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/shifts/clock-out`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to clock out");
      }
      fetchMyShifts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading Staff Portal...</div>;
  if (error) return <div className="p-8 text-red-500 flex items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Staff Portal</h1>
        <p className="text-neutral-400">Manage your shifts and attendance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Clock In/Out Widget */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Current Status
          </h2>
          
          {activeShift ? (
            <div className="text-center py-6">
              <div className="inline-block p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 animate-pulse">
                <Clock className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-emerald-400 mb-1">On Duty</h3>
              <p className="text-neutral-400 text-sm mb-6">Clocked in at {new Date(activeShift.clockInTime).toLocaleTimeString()}</p>
              
              <button 
                onClick={handleClockOut}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all border border-red-500/30 flex items-center justify-center gap-2 mx-auto"
              >
                <Square className="w-4 h-4" /> End Shift (Clock Out)
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-block p-4 rounded-full bg-neutral-800/50 border border-neutral-700 mb-4">
                <Clock className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-2xl font-black text-neutral-500 mb-1">Off Duty</h3>
              <p className="text-neutral-400 text-sm mb-6">You are not currently clocked in.</p>
              
              <button 
                onClick={handleClockIn}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-current" /> Start Shift (Clock In)
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 p-6 rounded-3xl shadow-2xl flex flex-col justify-center text-center">
           <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-black font-black text-3xl mb-4 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
             {user?.name.charAt(0).toUpperCase()}
           </div>
           <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
           <p className="text-amber-500 font-medium mb-1 capitalize">{user?.role || "Staff Member"}</p>
           <p className="text-neutral-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* History */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-neutral-400" /> Shift History
      </h2>
      <div className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
        {shifts.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No shift history found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Clock In</th>
                <th className="p-4 font-medium">Clock Out</th>
                <th className="p-4 font-medium">Duration</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {shifts.map((shift) => {
                const inTime = new Date(shift.clockInTime);
                const outTime = shift.clockOutTime ? new Date(shift.clockOutTime) : null;
                
                let durationStr = "-";
                if (outTime) {
                  const mins = Math.floor((outTime.getTime() - inTime.getTime()) / 60000);
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  durationStr = `${h}h ${m}m`;
                } else if (shift.status === 'Active') {
                  const mins = Math.floor((Date.now() - inTime.getTime()) / 60000);
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  durationStr = `${h}h ${m}m (Ongoing)`;
                }

                return (
                  <tr key={shift._id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="p-4 text-white font-medium">{inTime.toLocaleDateString()}</td>
                    <td className="p-4 text-neutral-300">{inTime.toLocaleTimeString()}</td>
                    <td className="p-4 text-neutral-400">{outTime ? outTime.toLocaleTimeString() : "-"}</td>
                    <td className="p-4 text-neutral-400">{durationStr}</td>
                    <td className="p-4">
                      {shift.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-widest border border-neutral-700">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
