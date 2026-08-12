"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassWater, Sparkles, Star, Award, ShoppingBag, CheckCircle2, ChevronRight, Filter, Bot, RefreshCw } from "lucide-react";
import { useCart } from "@/components/CartContext";

interface WineItem {
  id: string;
  name: string;
  vintage: string;
  region: string;
  type: "Red" | "White" | "Champagne" | "Rose" | "Dessert";
  price: number;
  rating: number;
  alcoholPct: string;
  body: "Light" | "Medium" | "Full";
  tastingNotes: string;
  pairing: string;
  badge?: string;
}

const WINES: WineItem[] = [
  {
    id: "wine-1",
    name: "Château Margaux Grand Cru Classé",
    vintage: "2015",
    region: "Bordeaux, France",
    type: "Red",
    price: 480,
    rating: 4.9,
    alcoholPct: "13.5%",
    body: "Full",
    tastingNotes: "Blackcurrant, cassis, violet florals, structured tannins with velvet finish.",
    pairing: "Prime Wagyu Tenderloin & Truffle Reduction",
    badge: "Master Sommelier Pick",
  },
  {
    id: "wine-2",
    name: "Dom Pérignon Vintage Brut Champagne",
    vintage: "2012",
    region: "Épernay, Champagne, France",
    type: "Champagne",
    price: 320,
    rating: 4.9,
    alcoholPct: "12.5%",
    body: "Medium",
    tastingNotes: "Crisp white peach, toasted brioche, subtle smoke with fine persistent bubbles.",
    pairing: "Fresh Oysters & Caviar Pearls",
    badge: "Exclusive Vintage",
  },
  {
    id: "wine-3",
    name: "Tignanello Antinori Super Tuscan",
    vintage: "2018",
    region: "Tuscany, Italy",
    type: "Red",
    price: 240,
    rating: 4.8,
    alcoholPct: "14.0%",
    body: "Full",
    tastingNotes: "Ripe dark cherry, cocoa, wild herbs, leather and cedar spice.",
    pairing: "Osso Buco & Wild Mushroom Risotto",
  },
  {
    id: "wine-4",
    name: "Puligny-Montrachet Domaine Leflaive",
    vintage: "2019",
    region: "Burgundy, France",
    type: "White",
    price: 290,
    rating: 4.9,
    alcoholPct: "13.0%",
    body: "Medium",
    tastingNotes: "Meyer lemon, crushed flint minerality, hazelnut and white blossom.",
    pairing: "Pan-Seared Sea Bass & Citrus Beurre Blanc",
    badge: "Rare Allocation",
  },
  {
    id: "wine-5",
    name: "Château d'Yquem Premier Cru Supérieur",
    vintage: "2009",
    region: "Sauternes, France",
    type: "Dessert",
    price: 390,
    rating: 5.0,
    alcoholPct: "14.0%",
    body: "Full",
    tastingNotes: "Honeyed apricot, candied orange peel, saffron and luscious balanced acidity.",
    pairing: "Foie Gras Terrine & Roquefort Cheese",
  },
  {
    id: "wine-6",
    name: "Domaine Ott Château de Selle Rosé",
    vintage: "2021",
    region: "Côtes de Provence, France",
    type: "Rose",
    price: 110,
    rating: 4.7,
    alcoholPct: "13.0%",
    body: "Light",
    tastingNotes: "Wild strawberry, grapefruit zest, white pepper and delicate salinity.",
    pairing: "Grilled Lobster Tail & Garden Salads",
  },
];

const DISHES_LIST = [
  "Prime Wagyu Tenderloin",
  "Pan-Seared Sea Bass",
  "Fresh Oysters & Caviar",
  "Wild Mushroom Risotto",
  "Dark Chocolate Soufflé",
];

export default function CellarPage() {
  const { addItem } = useCart();
  const [filterType, setFilterType] = useState<string>("All");
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sommelier AI State
  const [aiModal, setAiModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState("Prime Wagyu Tenderloin");
  const [aiSuggestion, setAiSuggestion] = useState<WineItem | null>(WINES[0]);
  const [aiThinking, setAiThinking] = useState(false);

  const filteredWines = filterType === "All" ? WINES : WINES.filter((w) => w.type === filterType);

  const handleAddToCart = (wine: WineItem) => {
    addItem({
      itemId: wine.id,
      name: `${wine.name} (${wine.vintage})`,
      price: wine.price,
      image: "",
    }, 1);
    setAddedId(wine.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const generateSommelierPairing = () => {
    setAiThinking(true);
    setTimeout(() => {
      let matched = WINES[0];
      if (selectedDish.includes("Sea Bass")) matched = WINES[3];
      else if (selectedDish.includes("Oysters")) matched = WINES[1];
      else if (selectedDish.includes("Risotto")) matched = WINES[2];
      else if (selectedDish.includes("Soufflé")) matched = WINES[4];
      setAiSuggestion(matched);
      setAiThinking(false);
    }, 600);
  };

  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-8">

      {/* ── SOMMELIER AI PAIRING MODAL ─────────────────────────────────── */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-purple-500/40 bg-neutral-900 p-6 sm:p-8 shadow-2xl animate-fade-up">
            <div className="flex items-center gap-3.5 mb-5 border-b border-neutral-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-white">AI Sommelier Pairing Assistant</h3>
                <p className="text-xs text-neutral-400">Match your dish with the ultimate vintage wine pairing</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Select Your Main Course / Dish
                </label>
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3.5 text-xs text-white outline-none focus:border-purple-500"
                >
                  {DISHES_LIST.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={generateSommelierPairing}
                disabled={aiThinking}
                className="w-full py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                {aiThinking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiThinking ? "Consulting AI Cellar Archives..." : "Generate AI Wine Recommendation"}
              </button>

              {aiSuggestion && !aiThinking && (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5 space-y-3 animate-fade-up">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-500 text-white px-2.5 py-0.5 rounded-full">
                      Perfect Match (99.4%)
                    </span>
                    <span className="text-amber-400 font-bold text-xs">₹{aiSuggestion.price * 80}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{aiSuggestion.name} ({aiSuggestion.vintage})</h4>
                    <p className="text-xs text-purple-300 font-medium">{aiSuggestion.region} · {aiSuggestion.alcoholPct} ABV</p>
                    <p className="text-xs text-neutral-300 mt-2 leading-relaxed">&quot;{aiSuggestion.tastingNotes}&quot;</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { handleAddToCart(aiSuggestion); setAiModal(false); }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition"
                  >
                    Add Recommended Bottle to Order
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setAiModal(false)}
              className="mt-5 w-full py-3 rounded-full border border-neutral-700 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition"
            >
              Close Sommelier Assistant
            </button>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-10 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          <GlassWater className="w-3.5 h-3.5" />
          <span>Private Underground Cellar Collection</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
          Curated Vintages &amp; <span className="text-amber-400 italic">Grand Crus.</span>
        </h1>
        <p className="mt-3 text-neutral-400 text-xs sm:text-base max-w-xl mx-auto">
          Explore our temperature-controlled cellar featuring rare French Grand Crus, Super Tuscans, and Vintage Champagnes.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setAiModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-purple-600/30 transition"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Virtual Sommelier AI</span>
          </button>
        </div>
      </div>

      {/* ── FILTER CHIPS ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-center gap-2.5 flex-wrap">
        {["All", "Red", "White", "Champagne", "Rose", "Dessert"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterType === type
                ? "bg-amber-500 text-black shadow-md"
                : "bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── WINE CARDS GRID ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWines.map((wine) => (
          <div
            key={wine.id}
            className="rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition shadow-2xl"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-neutral-950 border border-neutral-800 text-amber-400 px-2.5 py-1 rounded-full">
                  {wine.vintage} Vintage · {wine.alcoholPct} ABV
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {wine.rating}
                </span>
              </div>

              {wine.badge && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  {wine.badge}
                </span>
              )}

              <h3 className="text-lg font-serif font-bold text-white">{wine.name}</h3>
              <p className="text-xs text-neutral-400">{wine.region}</p>
              <p className="text-xs text-neutral-300 leading-relaxed italic">&quot;{wine.tastingNotes}&quot;</p>

              <div className="pt-2 border-t border-neutral-800 text-xs">
                <p className="text-neutral-400 font-semibold">Recommended Dish Pairing:</p>
                <p className="text-amber-300 font-medium mt-0.5">🍷 {wine.pairing}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Bottle Price</p>
                <p className="text-xl font-bold text-amber-400">₹{(wine.price * 80).toLocaleString("en-IN")}</p>
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(wine)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{addedId === wine.id ? "Added!" : "Add to Order"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
