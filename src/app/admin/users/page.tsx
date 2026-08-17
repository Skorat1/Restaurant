"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setUsers(await res.json());
        } else {
          setError("Failed to load users.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const approveUser = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.map(u => u._id === id ? { ...u, isApproved: true } : u));
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to approve user");
      }
    } catch {
      alert("Unable to reach server");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
      }
    } catch {
      alert("Unable to reach server");
    }
  };

  const toggleRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${u._id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(x => x._id === u._id ? { ...x, role: newRole } : x));
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to update role");
      }
    } catch {
      alert("Unable to reach server");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            System
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Users</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Manage system users and their access.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-2">
          <p className="text-sm font-semibold">No users yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-900/80 text-xs uppercase text-neutral-300 font-semibold border-b border-neutral-800 tracking-wider">
              <tr>
                <th className="px-6 py-5">Name & Email</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-white text-base">{u.name}</div>
                    <div className="text-neutral-500 text-xs mt-1">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      u.role === 'admin' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-neutral-800/50 text-neutral-400 border-neutral-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!u.isApproved ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-red-500/10 text-red-400 border-red-500/20">
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Approved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    {!u.isApproved && (
                      <button
                        onClick={() => approveUser(u._id)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {u._id !== currentUser?._id && (
                      <>
                        <button
                          onClick={() => toggleRole(u)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 text-xs font-bold text-neutral-300 hover:bg-neutral-700 transition-colors"
                        >
                          {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-900/30 bg-red-500/5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
