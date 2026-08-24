"use client";

import { useState, useRef } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Edit2, Trash2, Power, PowerOff, Image as ImageIcon, Star, Flame, Leaf, Loader2 } from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/Button";

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
}

const CATEGORIES = ["Starters", "Mains", "Desserts", "Beverages", "Wine", "Specials"];

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
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [available, setAvailable] = useState(true);
  const [premium, setPremium] = useState(false);
  const [vegetarian, setVegetarian] = useState(false);
  const [spicy, setSpicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory(CATEGORIES[0]);
    setImageFile(null);
    setAvailable(true);
    setPremium(false);
    setVegetarian(false);
    setSpicy(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageFile(null); // Keep original unless changed
    setAvailable(item.available);
    setPremium(item.premium);
    setVegetarian(item.vegetarian);
    setSpicy(item.spicy);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
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
        body: formData, // fetch will set multipart/form-data boundary automatically
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

  if (authLoading || isLoading) return <div className="text-white p-12 text-center animate-pulse">Loading menu...</div>;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Menu Manager
          </span>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold">Gastronomy Collection</h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">Manage dishes, prices, and availability.</p>
        </div>
        <Button 
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="uppercase tracking-wider text-xs"
        >
          Add New Dish
        </Button>
      </div>

      {/* GRID */}
      {(!menuItems || menuItems.length === 0) ? (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-neutral-400">
          <p className="text-sm font-semibold">No menu items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map(item => (
            <div key={item._id} className={`group relative rounded-3xl border ${item.available ? 'border-neutral-800 bg-neutral-900/80' : 'border-red-900/30 bg-neutral-900/40 opacity-70'} overflow-hidden shadow-xl hover:border-amber-500/30 transition-all`}>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {item.premium && <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg"><Star className="w-3 h-3"/> Premium</span>}
                {item.vegetarian && <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg"><Leaf className="w-3 h-3"/> Veg</span>}
                {item.spicy && <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg"><Flame className="w-3 h-3"/> Spicy</span>}
              </div>

              {/* Image */}
              <div className="h-48 bg-black relative overflow-hidden flex items-center justify-center">
                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-700 opacity-90" />
                {!item.available && (
                  <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-red-400">Unavailable</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
              </div>

              {/* Content */}
              <div className="p-5 relative z-20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 border border-neutral-800 bg-neutral-950 px-2 py-1 rounded-md">{item.category}</span>
                  <span className="text-lg font-bold text-white font-serif">₹{item.price}</span>
                </div>
                <h3 className="text-base font-bold text-white truncate mb-1">{item.name}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2 min-h-[32px] italic">&quot;{item.description}&quot;</p>
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between">
                <button 
                  onClick={() => handleToggleAvailable(item._id, item.available)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${item.available ? 'text-neutral-400 hover:text-red-400 hover:bg-red-500/10' : 'text-red-400 bg-red-500/10 hover:bg-emerald-500/10 hover:text-emerald-400'}`}
                >
                  {item.available ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                  {item.available ? 'Disable' : 'Enable'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-amber-400 hover:border-amber-500/30 transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl my-8 animate-fade-in">
            <h2 className="text-2xl font-serif text-white font-bold mb-6">
              {editingItem ? "Edit Dish" : "Add New Dish"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Name</label>
                  <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500" placeholder="Dish name..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 appearance-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Price (₹)</label>
                  <input type="number" required value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500" placeholder="499" />
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
                <textarea required value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-500 resize-none" placeholder="Rich flavors with a hint of..."></textarea>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-neutral-800 bg-neutral-900 cursor-pointer hover:border-amber-500/30 transition">
                  <input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Available</span>
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

              <div className="flex gap-4 pt-6 border-t border-neutral-800">
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
