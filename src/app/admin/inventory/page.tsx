"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { Package, Plus, Search, AlertTriangle, TrendingDown } from "lucide-react";

type Ingredient = {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  costPerUnit: number;
  lastRestockedAt?: string;
};

export default function InventoryPage() {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: "", unit: "kg", minimumStock: 0 });

  useEffect(() => {
    if (!token) return;
    fetchIngredients();
  }, [token]);

  const fetchIngredients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/ingredients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setIngredients(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newIngredient)
      });
      if (res.ok) {
        setShowAddForm(false);
        fetchIngredients();
        setNewIngredient({ name: "", unit: "kg", minimumStock: 0 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestock = async (id: string, addedStock: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/ingredients/${id}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addedStock })
      });
      if (res.ok) fetchIngredients();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = ingredients.filter(i => i.currentStock <= i.minimumStock);

  if (loading) return <div className="p-8 text-neutral-400">Loading Inventory...</div>;

  return (
    <div className="p-8 pb-24 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Inventory & Stock</h1>
          <p className="text-neutral-400 text-sm mt-1">Manage ingredients, recipes, and track wastage.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Add Ingredient
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-red-500/20 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-red-500 font-bold text-lg">Low Stock Alerts</h3>
            <p className="text-neutral-400 text-sm mt-1">The following items are running low and need to be restocked soon.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lowStock.map(item => (
                <span key={item._id} className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30">
                  {item.name}: {item.currentStock} {item.unit} (Min: {item.minimumStock})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-8 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Add New Ingredient</h2>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Name</label>
              <input 
                type="text" 
                value={newIngredient.name} 
                onChange={e => setNewIngredient({...newIngredient, name: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Unit</label>
              <select 
                value={newIngredient.unit}
                onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-bold text-neutral-400 uppercase mb-2">Min. Stock</label>
              <input 
                type="number" 
                value={newIngredient.minimumStock} 
                onChange={e => setNewIngredient({...newIngredient, minimumStock: Number(e.target.value)})}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-emerald-500 text-emerald-950 px-6 py-3 rounded-xl font-bold hover:bg-emerald-400">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-neutral-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
          <div className="relative w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search ingredients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-900 border-b border-neutral-800">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Ingredient Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Current Stock</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filtered.map(item => (
                <tr key={item._id} className="hover:bg-neutral-800/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                        <Package className="w-5 h-5 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{item.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Min Threshold: {item.minimumStock} {item.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-lg font-bold text-white">{item.currentStock}</span>
                    <span className="text-neutral-500 text-sm ml-1">{item.unit}</span>
                  </td>
                  <td className="p-4">
                    {item.currentStock <= item.minimumStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold tracking-wide">
                        <TrendingDown className="w-3.5 h-3.5" />
                        LOW STOCK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-wide">
                        HEALTHY
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        const amount = window.prompt(`How many ${item.unit}s to add?`);
                        if (amount && !isNaN(Number(amount))) handleRestock(item._id, Number(amount));
                      }}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors border border-neutral-700"
                    >
                      + Quick Restock
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-500 text-sm">
                    No ingredients found matching "{search}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
