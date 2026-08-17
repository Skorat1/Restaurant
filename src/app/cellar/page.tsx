"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassWater, Sparkles, Star, Award, ShoppingBag, CheckCircle2, ChevronRight, Filter, Bot, RefreshCw, ScanLine } from "lucide-react";
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
  image: string;
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkOdOKF8QZ7o2h9UTI2T-s895nBIZf_J0z4kaZcoaYCXUiRClFqAj1ljY&s=10",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkWJTLnns2ao3V_jSPEY8dCPJQ6UBAqUBAex2get-esRIfX15RGnz4A4Q&s=10",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmZZUkk7nsg7UIhaGEhTdt3UCETVXh5AZfUy43wZXjIg&s=10",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPER7OdJcr54wVZ9UIbIBA1J-c-SfhpMx5-M9p4uIHfw&s=10",
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
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?auto=format&fit=crop&q=80&w=600",
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
    image: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQlUWAa6iSx-G4JjIXQt4LBC_huAcl9eSAlScGN62270_dV81_j",
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

  // Hero Parallax state
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredWines = filterType === "All" ? WINES : WINES.filter((w) => w.type === filterType);

  const handleAddToCart = (wine: WineItem) => {
    addItem({
      itemId: wine.id,
      name: `${wine.name} (${wine.vintage})`,
      price: wine.price,
      image: wine.image,
    }, 1);
    setAddedId(wine.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const generateSommelierPairing = () => {
    setAiThinking(true);
    setAiSuggestion(null);
    setTimeout(() => {
      let matched = WINES[0];
      if (selectedDish.includes("Sea Bass")) matched = WINES[3];
      else if (selectedDish.includes("Oysters")) matched = WINES[1];
      else if (selectedDish.includes("Risotto")) matched = WINES[2];
      else if (selectedDish.includes("Soufflé")) matched = WINES[4];
      setAiSuggestion(matched);
      setAiThinking(false);
    }, 1200);
  };

  return (
    <section className="min-h-screen bg-[#050505] text-neutral-100 relative overflow-hidden font-sans">
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full mix-blend-screen transition-transform duration-1000"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full mix-blend-screen transition-transform duration-1000"
          style={{ transform: `translateY(-${scrollY * 0.1}px)` }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        
        {/* ── SOMMELIER AI PAIRING MODAL ─────────────────────────────────── */}
        {aiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-lg rounded-[2rem] border border-purple-500/30 bg-[#0a0a0a]/90 p-8 shadow-2xl shadow-purple-900/20 relative overflow-hidden">
              
              {/* Modal Background Glow */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">
                    AI Sommelier Pairing
                  </h3>
                  <p className="text-xs text-purple-300/60 font-mono tracking-widest mt-1 uppercase">Machine Learning Assisted</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Select Your Main Course
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDish}
                      onChange={(e) => setSelectedDish(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                    >
                      {DISHES_LIST.map((d) => (
                        <option key={d} value={d} className="bg-neutral-900">{d}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateSommelierPairing}
                  disabled={aiThinking}
                  className="w-full py-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {aiThinking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-purple-950">Analyzing Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Generate Recommendation</span>
                      
                      {/* Button shine effect */}
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                    </>
                  )}
                </button>

                {/* AI Thinking Animation */}
                {aiThinking && (
                  <div className="h-40 rounded-2xl border border-purple-500/20 bg-purple-950/10 flex flex-col items-center justify-center gap-3 animate-pulse">
                     <ScanLine className="w-8 h-8 text-purple-500 animate-[bounce_2s_infinite]" />
                     <p className="text-xs font-mono text-purple-400">Cross-referencing vintage profiles...</p>
                  </div>
                )}

                {/* AI Result Card */}
                {aiSuggestion && !aiThinking && (
                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-900/20 to-transparent p-6 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-purple-500 text-white px-3 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        99.4% Match
                      </span>
                      <span className="text-amber-400 font-bold text-lg font-serif">₹{aiSuggestion.price.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex gap-5 items-center mb-6">
                      <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-neutral-950 border border-purple-500/20 relative shadow-2xl">
                        <img src={aiSuggestion.image} alt={aiSuggestion.name} className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-serif font-bold text-white leading-tight mb-1">{aiSuggestion.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] uppercase tracking-widest text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-sm">{aiSuggestion.vintage}</span>
                           <span className="text-[10px] text-neutral-400">{aiSuggestion.region}</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed italic line-clamp-2">&quot;{aiSuggestion.tastingNotes}&quot;</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { handleAddToCart(aiSuggestion); setAiModal(false); }}
                      className="w-full py-3.5 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300"
                    >
                      Add To Order
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setAiModal(false)}
                className="mt-6 w-full py-3 rounded-full text-[10px] font-bold tracking-widest uppercase text-neutral-500 hover:text-white transition-colors"
              >
                Close Assistant
              </button>
            </div>
          </div>
        )}

        {/* ── HERO BANNER ───────────────────────────────────────────────── */}
        <div className="mb-20 text-center relative pt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <GlassWater className="w-3.5 h-3.5" />
            <span>Underground Reserve</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-serif text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            The Master <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 italic">Sommelier's Cellar.</span>
          </h1>
          
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Explore our temperature-controlled vault featuring exceptionally rare French Grand Crus, 
            storied Super Tuscans, and limited-allocation Vintage Champagnes.
          </p>

          <button
            type="button"
            onClick={() => setAiModal(true)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <Bot className="w-4 h-4 text-purple-600 group-hover:animate-pulse" />
            <span>Consult AI Sommelier</span>
            <div className="absolute inset-0 rounded-full border border-white/40 scale-105 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"></div>
          </button>
        </div>

        {/* ── FILTER CHIPS ──────────────────────────────────────────────── */}
        <div className="mb-16 flex items-center justify-center gap-3 flex-wrap">
          {["All", "Red", "White", "Champagne", "Rose", "Dessert"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${
                filterType === type
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105"
                  : "bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/10"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ── WINE CARDS GRID ────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWines.map((wine, i) => (
            <div
              key={wine.id}
              className="group relative rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-col overflow-hidden hover:border-amber-500/30 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Image Section with Advanced Lighting */}
              <div className="relative h-72 w-full overflow-hidden flex items-center justify-center p-8">
                {/* Glowing orb behind bottle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                   <div className="w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full" />
                </div>
                
                {wine.badge && (
                  <div className="absolute top-5 left-5 z-20">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] bg-neutral-900/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full shadow-lg">
                      <Award className="w-3 h-3" /> {wine.badge}
                    </span>
                  </div>
                )}
                
                <img
                  src={wine.image}
                  alt={wine.name}
                  className="relative z-10 h-full w-auto max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)] group-hover:drop-shadow-[0_20px_35px_rgba(0,0,0,1)] group-hover:scale-105 transition-all duration-700 ease-out"
                />
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none"></div>
              </div>

              {/* Content Section */}
              <div className="p-8 space-y-4 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a]">
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 border border-white/10 px-2 py-0.5 rounded">
                      {wine.vintage}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">{wine.alcoholPct}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {wine.rating}
                  </span>
                </div>

                <h3 className="text-xl font-serif font-bold text-white leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-amber-200 transition-all duration-300">
                  {wine.name}
                </h3>
                
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{wine.region}</p>
                
                <p className="text-xs text-neutral-400 leading-relaxed italic flex-1 font-serif">
                  &quot;{wine.tastingNotes}&quot;
                </p>

                <div className="pt-5 border-t border-white/5 mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold mb-1.5">Sommelier Pairing</p>
                  <p className="text-xs text-amber-200/80 font-medium">✨ {wine.pairing}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 m-4 mt-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group-hover:bg-amber-500/5 group-hover:border-amber-500/20 transition-all duration-500 relative z-20">
                <div className="pl-2">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mb-0.5">Cellar Price</p>
                  <p className="text-lg font-serif font-bold text-white">₹{wine.price.toLocaleString("en-IN")}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(wine)}
                  className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 ${
                    addedId === wine.id 
                    ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                    : "bg-white text-black hover:bg-amber-500 shadow-lg"
                  }`}
                >
                  {addedId === wine.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> <span>Add To Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
