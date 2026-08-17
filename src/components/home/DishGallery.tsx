"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Flame, ShoppingBag } from "lucide-react";
import { resolveImg } from "@/lib/image";
import { useCart } from "@/components/CartContext";

const SIGNATURE_DISHES = [
  {
    id: "wagyu",
    category: "tasting",
    name: "A5 Miyazaki Wagyu Striploin",
    desc: "Seared over Japanese Binchotan charcoal, truffle bone marrow jus, 24K edible gold leaf, and smoked sea salt.",
    price: 3400,
    prepTime: "25 mins",
    dietary: ["Gluten-Free", "Chef Signature"],
    pairing: "2015 Château Margaux Premier Grand Cru",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "lobster",
    category: "tasting",
    name: "Brittany Blue Lobster Bisque",
    desc: "Butter-poached lobster tail, saffron velvet reduction, Oscietra caviar pearls, and fresh tarragon oil.",
    price: 2850,
    prepTime: "20 mins",
    dietary: ["Seafood Specialty", "Pescatarian"],
    pairing: "2020 Domaine Leflaive Puligny-Montrachet",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "souffle",
    category: "dessert",
    name: "Golden Valrhona Soufflé",
    desc: "70% Guanaja dark chocolate soufflé, warm liquid gold praline center, and hand-churned Madagascar vanilla gelato.",
    price: 1450,
    prepTime: "18 mins",
    dietary: ["Vegetarian", "Sweet Masterpiece"],
    pairing: "Château d'Yquem Sauternes 2011",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "truffle-pasta",
    category: "tasting",
    name: "Black Winter Truffle Tagliolini",
    desc: "House-made egg yolk pasta, 36-month Parmigiano-Reggiano cream, shaved fresh Périgord black truffles.",
    price: 2600,
    prepTime: "15 mins",
    dietary: ["Vegetarian", "Fresh Truffles"],
    pairing: "2018 Barolo Monfortino Riserva",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTDA-tAexC8nFu3q5g3cH2nHlsRi0wg1Lp_5LMkuQcjplY0ZGT9SoEewc&s=10",
  },
];

export default function DishGallery() {
  const { addItem } = useCart();
  const [selectedDish, setSelectedDish] = useState<typeof SIGNATURE_DISHES[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "tasting" | "dessert">("all");

  const filteredDishes = activeCategory === "all"
    ? SIGNATURE_DISHES
    : SIGNATURE_DISHES.filter((d) => d.category === activeCategory);

  const handleQuickAdd = (dish: typeof SIGNATURE_DISHES[0], e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      itemId: dish.id,
      name: dish.name,
      price: dish.price,
      image: dish.img,
      category: dish.category
    }, 1);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
      {/* ── DISH QUICK VIEW MODAL ─────────────────────────────────────── */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-up">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white transition z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="relative h-64 sm:h-full rounded-2xl overflow-hidden border border-neutral-800">
                <Image
                  src={resolveImg(selectedDish.img)}
                  alt={selectedDish.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {selectedDish.dietary.map((d) => (
                    <span key={d} className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                      {d}
                    </span>
                  ))}
                </div>

                <h3 className="text-2xl font-serif font-bold text-white">{selectedDish.name}</h3>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">{selectedDish.desc}</p>

                <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Sommelier Pairing:</span>
                    <span className="font-bold text-amber-300">{selectedDish.pairing}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Preparation Time:</span>
                    <span className="text-white font-mono">{selectedDish.prepTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-neutral-400 block">Price</span>
                    <span className="text-2xl font-serif font-bold text-amber-400">₹{selectedDish.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { handleQuickAdd(selectedDish, e); setSelectedDish(null); }}
                      className="btn-primary flex items-center gap-2 text-xs py-3 px-5"
                    >
                      <ShoppingBag className="w-4 h-4" /> Quick Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-amber-400 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" /> Culinary Artistry
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-white">Chef&apos;s Signature Masterpieces</h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-light">
            Each dish is meticulously crafted using rare seasonal ingredients, French classical reduction techniques, and modern flavor alchemy.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1.5 rounded-full bg-neutral-950 border border-neutral-800">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "all"
              ? "bg-amber-500 text-black shadow-md"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            All Highlights
          </button>
          <button
            onClick={() => setActiveCategory("tasting")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "tasting"
              ? "bg-amber-500 text-black shadow-md"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            Savory Courses
          </button>
          <button
            onClick={() => setActiveCategory("dessert")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition ${activeCategory === "dessert"
              ? "bg-amber-500 text-black shadow-md"
              : "text-neutral-400 hover:text-white"
              }`}
          >
            Artisanal Sweets
          </button>
        </div>
      </div>

      {/* Dish Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => setSelectedDish(dish)}
            className="card-glass rounded-3xl overflow-hidden group flex flex-col justify-between cursor-pointer border-neutral-800/80 hover:border-amber-500/40 relative"
          >
            <div>
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={resolveImg(dish.img)}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

                <div className="absolute top-3 right-3 flex gap-1">
                  {dish.dietary.slice(0, 1).map((d) => (
                    <span key={d} className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-white mb-1 leading-snug">{dish.name}</h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2">{dish.desc}</p>
              </div>
            </div>
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-neutral-800/50 mt-auto">
              <span className="text-lg font-serif font-bold text-amber-400">₹{dish.price}</span>
              <button 
                onClick={(e) => handleQuickAdd(dish, e)}
                className="text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-3 h-3" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
