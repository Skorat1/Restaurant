"use client";

import { useState, useRef, useMemo } from "react";
import useSWR, { mutate } from "swr";
import {
  Plus, Edit2, Trash2, Power, PowerOff, Image as ImageIcon,
  Star, Flame, Leaf, Loader2, Search, CheckSquare, Square,
  DollarSign, TrendingUp, Sparkles, Filter, X, Check
} from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";

interface Addon {
  name: string;
  price: number;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  premium: boolean;
  vegetarian: boolean;
  spicy: boolean;
  addons?: Addon[];
}

const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Beverages", "Wine", "Specials"];

const fetcher = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json());

export default function AdminMenu() {
  const { token, loading: authLoading } = useAuth();
  
  const { data: menuItems, isLoading } = useSWR<MenuItem[]>(
    !authLoading && token ? `${API_BASE_URL}/api/menu` : null,
    (url: string) => fetcher(url, token as string)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Bulk update states
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [bulkPriceChange, setBulkPriceChange] = useState<number>(50);
  const [bulkChangeType, setBulkChangeType] = useState<"flat" | "percent">("flat");
  const [bulkWorking, setBulkWorking] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Mains");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [available, setAvailable] = useState(true);
  const [premium, setPremium] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Mains");
    setImageFile(null);
    setAvailable(true);
    setPremium(false);
    setVegetarian(false);
    setSpicy(false);
    setAddons([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageFile(null);
    setAvailable(item.available);
    setPremium(item.premium);
    setVegetarian(item.vegetarian);
    setSpicy(item.spicy);
    setAddons(item.addons || []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const handleAddAddon = () => {
    if (!newAddonName.trim() || !newAddonPrice) return;
    setAddons([...addons, { name: newAddonName.trim(), price: Number(newAddonPrice) }]);
    setNewAddonName("");
    setNewAddonPrice("");
  };

  const handleRemoveAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  // Instant In-Stock / Sold-Out Switch
  const handleToggleAvailable = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ available: !currentStatus })
      });
      mutate(`${API_BASE_URL}/api/menu`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      mutate(`${API_BASE_URL}/api/menu`);
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Price Update Handler
  const handleBulkPriceUpdate = async () => {
    if (selectedItemIds.length === 0) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        selectedItemIds.map(async (id) => {
          const item = (menuItems || []).find((m) => m._id === id);
          if (!item) return;
          const newPrice =
            bulkChangeType === "flat"
              ? Math.max(0, item.price + bulkPriceChange)
              : Math.round(item.price * (1 + bulkPriceChange / 100));

          return fetch(`${API_BASE_URL}/api/menu/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ...item, price: newPrice }),
          });
        })
      );
      mutate(`${API_BASE_URL}/api/menu`);
      setBulkPriceModalOpen(false);
      setSelectedItemIds([]);
    } catch (err) {
      console.error(err);
      alert("Error applying bulk price update");
    } finally {
      setBulkWorking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !category) return alert("Fill required fields");
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("available", String(available));
    formData.append("premium", String(premium));
    formData.append("vegetarian", String(vegetarian));
    formData.append("spicy", String(spicy));
    formData.append("addons", JSON.stringify(addons));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const url = editingItem 
      ? `${API_BASE_URL}/api/menu/${editingItem._id}` 
      : `${API_BASE_URL}/api/menu`;
    
    try {
      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        mutate(`${API_BASE_URL}/api/menu`);
        setModalOpen(false);
      } else {
        const error = await res.json();
        alert(error.msg || "Failed to save item");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder-dish.jpg";
    if (imagePath.startsWith("http") || imagePath.startsWith("data:")) return imagePath;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return (menuItems || []).filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  if (authLoading || isLoading) return <div className="text-white p-12 text-center animate-pulse font-serif">Loading Gastronomy Collection...</div>;

  return (
    <div className="space-y-6 pb-20 max-w-[1700px] mx-auto animate-fade-in text-neutral-200">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Menu &amp; Recipes Engineering
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">Gastronomy Collection</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">Manage culinary items, instant stock toggles, variants, and bulk pricing.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedItemIds.length > 0 && (
            <button
              onClick={() => setBulkPriceModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Bulk Price Update ({selectedItemIds.length})</span>
            </button>
          )}

          <Button 
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="uppercase tracking-wider text-xs font-bold"
          >
            Add New Dish
          </Button>
        </div>
      </div>

      {/* ── CATEGORY PILLS & SEARCH ────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-4 rounded-3xl shadow-xl">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name, tasting notes, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500 transition shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSel = selectedCategory === cat;
            const count =
              cat === "All"
                ? (menuItems || []).length
                : (menuItems || []).filter((m) => m.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSel
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSel ? "bg-black/20 text-black" : "bg-neutral-800 text-neutral-300"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DISHES GRID ────────────────────────────────────────────────── */}
      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-16 text-center text-neutral-400 shadow-xl">
          <p className="text-base font-serif text-white">No dishes match your selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item._id);

            return (
              <div
                key={item._id}
                className={`group relative rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between ${
                  item.available
                    ? isSelected
                      ? "border-amber-500 bg-amber-500/10 shadow-amber-500/10"
                      : "border-neutral-800 bg-neutral-900/80 hover:border-amber-500/40"
                    : "border-red-900/40 bg-neutral-900/40 opacity-80"
                }`}
              >
                <div>
                  {/* Select Checkbox & Badges */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedItemIds((prev) =>
                          prev.includes(item._id)
                            ? prev.filter((id) => id !== item._id)
                            : [...prev, item._id]
                        )
                      }
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition backdrop-blur-md ${
                        isSelected
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-black/60 border-neutral-700 text-transparent hover:border-amber-500"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {item.premium && (
                      <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Star className="w-3 h-3" /> Premium
                      </span>
                    )}
                    {item.vegetarian && (
                      <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Leaf className="w-3 h-3" /> Veg
                      </span>
                    )}
                    {item.spicy && (
                      <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Flame className="w-3 h-3" /> Spicy
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <div className="h-48 bg-black relative overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                    />
                    {!item.available && (
                      <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-400 shadow-lg">
                          Sold Out / Unavailable
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
                  </div>

                  {/* Content */}
                  <div className="p-5 relative z-20 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest text-amber-400 border border-neutral-800 bg-neutral-950 px-2 py-1 rounded-md font-mono">
                        {item.category}
                      </span>
                      <span className="text-xl font-bold text-amber-400 font-serif">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 min-h-[32px] italic">
                      &quot;{item.description}&quot;
                    </p>

                    {item.addons && item.addons.length > 0 && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-neutral-500">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{item.addons.length} Add-on option{item.addons.length > 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instant In-Stock Toggle Switch & Action Footer */}
                <div className="p-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
                  {/* Instant Quick Toggle */}
                  <button
                    onClick={(e) => handleToggleAvailable(item._id, item.available, e)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      item.available
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                        : "bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.available ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                    <span>{item.available ? "In Stock" : "Sold Out"}</span>
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-amber-400 hover:border-amber-500/30 transition"
                      title="Edit dish details & add-ons"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition"
                      title="Delete dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BULK PRICE UPDATE MODAL ────────────────────────────────────── */}
      {bulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold">Bulk Price Adjustment</h3>
                <p className="text-xs text-neutral-400">Updating {selectedItemIds.length} selected dishes</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkChangeType("flat")}
                  className={`py-2 rounded-xl font-bold border transition ${
                    bulkChangeType === "flat"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                  }`}
                >
                  Flat Amount (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkChangeType("percent")}
                  className={`py-2 rounded-xl font-bold border transition ${
                    bulkChangeType === "percent"
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400"
                  }`}
                >
                  Percentage (%)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  {bulkChangeType === "flat" ? "Change Amount in INR (e.g. +50 or -50)" : "Percentage Change (e.g. +10% or -5%)"}
                </label>
                <input
                  type="number"
                  value={bulkPriceChange}
                  onChange={(e) => setBulkPriceChange(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkPriceModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkWorking}
                onClick={handleBulkPriceUpdate}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
              >
                {bulkWorking ? "Applying..." : "Apply Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DISH ADD/EDIT MODAL ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl my-8 animate-fade-in">
            <h2 className="text-2xl font-serif text-white font-bold mb-6">
              {editingItem ? "Edit Culinary Item" : "Add New Dish"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Name</label>
                  <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-white outline-none focus:border-amber-500" placeholder="A5 Wagyu Striploin..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-white outline-none focus:border-amber-500">
                    {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Price (₹ INR)</label>
                  <input type="number" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 font-mono" placeholder="3400" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Image Upload</label>
                  <div className="relative w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 flex items-center gap-3 overflow-hidden">
                    <ImageIcon className="w-5 h-5 text-neutral-500 shrink-0" />
                    <input type="file" ref={fileInputRef} onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    <span className="text-xs text-neutral-400 truncate pointer-events-none">{imageFile ? imageFile.name : editingItem?.image ? "Keep existing image" : "Choose image..."}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Description (Tasting Notes)</label>
                <textarea required value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-white outline-none focus:border-amber-500 resize-none" placeholder="Rich flavors with a hint of Périgord black truffles..."></textarea>
              </div>

              {/* Variants & Add-ons Manager */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Extra Add-ons &amp; Customizations
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Addon name (e.g. Extra Truffle Butter)"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Price ₹"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(e.target.value)}
                    className="w-24 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="px-3 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400"
                  >
                    + Add
                  </button>
                </div>

                {addons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {addons.map((a, idx) => (
                      <span key={idx} className="bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-xl text-xs flex items-center gap-2 text-neutral-300">
                        <span>{a.name} (+₹{a.price})</span>
                        <button type="button" onClick={() => handleRemoveAddon(idx)} className="text-red-400 hover:text-white">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-amber-500/30 transition">
                  <input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">In Stock</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-amber-500/30 transition">
                  <input type="checkbox" checked={premium} onChange={e=>setPremium(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1"><Star className="w-3 h-3"/> Premium</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-amber-500/30 transition">
                  <input type="checkbox" checked={vegetarian} onChange={e=>setVegetarian(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1"><Leaf className="w-3 h-3"/> Veg</span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-amber-500/30 transition">
                  <input type="checkbox" checked={spicy} onChange={e=>setSpicy(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1"><Flame className="w-3 h-3"/> Spicy</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <Button variant="outline" type="button" onClick={() => setModalOpen(false)} fullWidth className="text-xs uppercase tracking-wider">
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting} fullWidth className="text-xs uppercase tracking-wider">
                  {editingItem ? "Update Dish" : "Save Dish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
