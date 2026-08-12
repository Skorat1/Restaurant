"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  createdAt: string;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

const EMPTY_FORM: UserForm = { name: "", email: "", password: "", role: "customer" };

export default function AdminUsers() {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
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
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({ name: user.name, email: user.email, password: "", role: user.role });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    if (!editing && !form.password) {
      setFormError("Password is required for a new user.");
      return;
    }

    setSaving(true);
    try {
      const url = editing
        ? `${API_BASE_URL}/api/admin/users/${editing._id}`
        : `${API_BASE_URL}/api/admin/users`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        await fetchUsers();
        // If we edited the current user, refresh auth context not needed here
        // but role change of self is prevented server-side.
      } else {
        setFormError(data.msg || "Failed to save user.");
      }
    } catch {
      setFormError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    if (currentUser?._id === user._id && newRole === "customer") {
      alert("You cannot remove your own admin role.");
      return;
    }
    if (!confirm(`${user.name} will become ${newRole}. Continue?`)) return;

    setWorking(user._id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user._id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) =>
            u._id === data.user._id ? { ...u, role: data.user.role } : u
          )
        );
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to update role.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const handleDelete = async (user: User) => {
    if (currentUser?._id === user._id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;

    setWorking(user._id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
      } else {
        const data = await res.json();
        alert(data.msg || "Failed to delete user.");
      }
    } catch {
      alert("Unable to reach the server.");
    } finally {
      setWorking("");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const inputCls = "w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500";
  const labelCls = "block text-xs uppercase tracking-wide text-neutral-400 mb-1.5";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-2 text-3xl font-serif text-white">Users</h1>
          <p className="mt-2 text-neutral-400">Create, edit, delete user accounts and manage admin roles.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add User
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        {users.length === 0 ? (
          <p className="p-12 text-center text-neutral-500 text-sm">No users yet.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {users.map((user) => (
              <li key={user._id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-sm font-bold text-amber-400 shrink-0">
                    {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      {currentUser?._id === user._id && (
                        <span className="text-[10px] uppercase tracking-wide text-neutral-500">(you)</span>
                      )}
                      {user.isVerified === false && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-400">Unverified</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{user.email} · Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {user.role === "admin" ? "Administrator" : "Customer"}
                  </span>
                  <button
                    onClick={() => toggleRole(user)}
                    disabled={working === user._id}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                  </button>
                  <button
                    onClick={() => openEdit(user)}
                    disabled={working === user._id}
                    className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={working === user._id || currentUser?._id === user._id}
                    className="rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 transition disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-white">
                {editing ? "Edit User" : "Add User"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white transition"
                aria-label="Close"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className={labelCls}>Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Guest name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="guest@email.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Password {editing && <span className="text-neutral-500 normal-case">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "••••••••" : "At least 6 characters"}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputCls}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {formError && (
                <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                  {formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-full border border-neutral-700 px-5 py-3 text-sm font-semibold text-neutral-300 hover:bg-neutral-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50"
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
