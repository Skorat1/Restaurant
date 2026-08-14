"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";
import { Search, ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";

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
const CATEGORIES = ["All", "Starter", "Main", "Dessert", "Drink"];

export default function AdminMenu() {
  const { token } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

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

  const toggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu/${item._id}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: !item.available }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: !i.available } : i))
        );
      }
    } catch {
      alert("Unable to reach the server.");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this menu item permanently?")) return;
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

  const filtered = items.filter((i) => {
    const matchesCat = activeCategory === "All" || i.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const inputCls = "w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 transition";
  const labelCls = "block text-xs uppercase tracking-wide text-neutral-400 mb-1.5 font-semibold";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Catalog Management
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Interactive Menu Editor</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Add dishes, edit descriptions, upload photos, and toggle real-time stock availability.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 justify-center rounded-full bg-amber-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition shrink-0 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-200">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 space-y-5 shadow-2xl animate-fade-up">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-serif text-white font-bold">{editing ? "Edit Dish Specs" : "Add New Signature Dish"}</h2>
            <span className="text-xs text-amber-400 font-mono">Catalog Code: #{editing?._id?.slice(-4) || "NEW"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Dish Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Filet Mignon & Truffle" />
            </div>
            <div>
              <label className={labelCls}>Price (₹) *</label>
              <input required type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="e.g. 1450" />
            </div>
            <div>
              <label className={labelCls}>Course Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATEGORIES.filter(c => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Dish Photo</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-950 p-4 cursor-pointer hover:border-amber-500 transition"
              >
                {imagePreview ? (
                  <div className="relative w-full h-24">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Click to upload photo image</p>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <input
                value={form.image}
                onChange={(e) => { setForm({ ...form, image: e.target.value }); setImageFile(null); setImagePreview(e.target.value ? resolveImg(e.target.value) : ""); }}
                placeholder="Or paste image URL…"
                className={`${inputCls} mt-2`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Culinary Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Rich description of ingredients and tasting notes..." />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-300 cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
              In Stock / Available for Order
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-amber-400 cursor-pointer">
              <input type="checkbox" checked={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.checked })} className="w-4 h-4 accent-amber-500 rounded" />
              Chef Signature (Premium Badge)
            </label>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="submit" disabled={saving} className="rounded-full bg-amber-500 px-8 py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400 transition disabled:opacity-50 shadow-lg">
              {saving ? "Saving..." : editing ? "Update Dish Specs" : "Add Dish to Menu"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-neutral-700 px-6 py-3 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-3xl shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu by dish name or description..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setActiveCategory(c); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === c
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400 space-y-2">
          <p className="text-sm font-semibold">No menu items found.</p>
          <p className="text-xs text-neutral-500">Try adjusting your category filter or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedItems.map((item) => (
            <div key={item._id} className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition shadow-lg">
              
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0">
                  {item.image ? (
                    <img src={resolveImg(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-serif font-bold text-white text-sm sm:text-base truncate">{item.name}</p>
                    {item.premium && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-500 text-black px-2 py-0.5 rounded-full">
                        Chef Signature
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    <span className="text-amber-400 font-semibold">{item.category}</span> · {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between md:justify-end border-t md:border-t-0 border-neutral-800 pt-3 md:pt-0">
                <span className="font-serif font-bold text-amber-400 text-base">₹{(item.price * 80).toLocaleString("en-IN")}</span>
                
                <button
                  type="button"
                  onClick={() => toggleAvailability(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    item.available
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/15 border-red-500/30 text-red-300"
                  }`}
                >
                  {item.available ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  <span>{item.available ? "In Stock" : "Out of Stock"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white transition"
                  title="Edit Dish"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteItem(item._id)}
                  className="p-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  title="Delete Dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs">
          <span className="text-neutral-400 font-medium">
            Page <strong className="text-white">{currentPage}</strong> of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
