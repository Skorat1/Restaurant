"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  premium: boolean;
}

const EMPTY_FORM = { name: "", description: "", price: "", category: "Starter", image: "", available: true, premium: false };
const CATEGORIES = ["Starter", "Main", "Dessert", "Drink"];

export default function AdminMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/menu`);
        if (res.ok) {
          setItems(await res.json());
        } else {
          setError("Failed to load menu items.");
        }
      } catch {
        setError("Unable to reach the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [token]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      image: item.image,
      available: item.available,
      premium: item.premium,
    });
    setImageFile(null);
    setImagePreview(resolveImg(item.image));
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = editing
        ? `${API_BASE_URL}/api/menu/${editing._id}`
        : `${API_BASE_URL}/api/menu`;

      let res: Response;

      if (imageFile) {
        // multipart/form-data upload
        const fd = new FormData();
        fd.append("image", imageFile);
        fd.append("name", form.name);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("category", form.category);
        fd.append("available", String(form.available));
        fd.append("premium", String(form.premium));
        res = await fetch(url, {
          method: editing ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      } else {
        // JSON with URL
        res = await fetch(url, {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form, price: Number(form.price) }),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        const item = saved._id ? saved : saved.item ?? saved;
        setItems((prev) =>
          editing ? prev.map((i) => (i._id === item._id ? item : i)) : [...prev, item]
        );
        setShowForm(false);
        setEditing(null);
        setImageFile(null);
        setImagePreview("");
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.msg || "Failed to save menu item.");
      }
    } catch {
      setError("Unable to reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const toggleField = async (item: MenuItem, field: "available" | "premium") => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: !item[field] }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Admin</span>
          <h1 className="mt-2 text-3xl font-serif text-white">Menu Management</h1>
          <p className="mt-2 text-neutral-400">Add, edit, and manage menu items.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 justify-center rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-black hover:bg-amber-400 transition shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Item
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-200 mb-6">
          {error}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-amber-500/30 bg-neutral-900/80 p-6 mb-8 space-y-4">
          <h2 className="text-lg font-serif text-white">{editing ? "Edit Menu Item" : "Add New Menu Item"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Price ($) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Image</label>
              {/* File upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-900 p-4 cursor-pointer hover:border-amber-500 transition"
              >
{imagePreview ? (
                  <div className="relative w-full h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-xs text-neutral-400">Click to upload image</p>
                    <p className="text-[10px] text-neutral-600">JPG, PNG, WebP — max 5 MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              {/* OR URL fallback */}
              <input
                value={form.image}
                onChange={(e) => { setForm({ ...form, image: e.target.value }); setImageFile(null); setImagePreview(e.target.value ? resolveImg(e.target.value) : ""); }}
                placeholder="Or paste image URL…"
                className={`${inputCls} mt-2`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="accent-amber-500" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
              <input type="checkbox" checked={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.checked })} className="accent-amber-500" />
              Premium
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-900 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          No menu items yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
{item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImg(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-white truncate">{item.name}</p>
                    {item.premium && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-black">Premium</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{item.category} · {item.description.slice(0, 60)}{item.description.length > 60 ? "…" : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <span className="font-semibold text-amber-400 w-16">${item.price.toFixed(2)}</span>
                <button
                  onClick={() => toggleField(item, "available")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    item.available
                      ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                  }`}
                >
                  {item.available ? "Available" : "Hidden"}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteItem(item._id)}
                  className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

