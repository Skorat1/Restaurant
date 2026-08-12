"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/lib/AuthContext";
import { CardSkeleton } from "@/components/Skeleton";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  premium: boolean;
  dietary?: string[];
  rating?: number;
  reviewCount?: number;
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  adminReply?: string;
  createdAt: string;
}

const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free"];

const Stars = ({ value }: { value: number }) => (
  <span aria-label={`${value} out of 5 stars`}>
    <span className="text-amber-400">{"★".repeat(Math.round(value))}</span>
    <span className="text-neutral-600">{"★".repeat(5 - Math.round(value))}</span>
  </span>
);

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { addItem } = useCart();
  const { user, token } = useAuth();

  // Filters
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Review modal
  const [reviewItem, setReviewItem] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Added-to-cart feedback
  const [addedId, setAddedId] = useState("");

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("category", activeTab);
      if (search) params.set("q", search);
      if (maxPrice) params.set("maxPrice", maxPrice);
      dietary.forEach((d) => params.append("dietary", d));

      const res = await fetch(`${API_BASE_URL}/api/menu?${params}`);
      if (res.ok) setMenu(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [activeTab, search, maxPrice, dietary]);

  useEffect(() => {
    const loadMenu = async () => {
      await fetchMenu();
    };
    loadMenu();
  }, [fetchMenu]);

  // Load categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu/categories`)
      .then((r) => r.json())
      .then((cats) => setCategories(["All", ...cats]))
      .catch(() => { });
  }, []);

  // Load reorder suggestions for logged-in users
  useEffect(() => {
    if (!user || !token) return;
    fetch(`${API_BASE_URL}/api/menu/reorder/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then(setSuggestions)
      .catch(() => { });
  }, [user, token]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleAddToCart = (item: MenuItem) => {
    addItem({ itemId: item._id, name: item.name, price: item.price, image: item.image, category: item.category });
    setAddedId(item._id);
    setTimeout(() => setAddedId(""), 1500);
  };

  const toggleDietary = (tag: string) =>
    setDietary((prev) => prev.includes(tag) ? prev.filter((d) => d !== tag) : [...prev, tag]);

  const openReviews = async (item: MenuItem) => {
    setReviewItem(item);
    setReviewForm({ rating: 5, comment: "" });
    setReviewMsg("");
    setReviews([]);
    setReviewsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/item/${item._id}`);
      if (res.ok) setReviews(await res.json());
    } catch { /* silent */ }
    finally { setReviewsLoading(false); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setReviewMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ menuItem: reviewItem?._id, rating: reviewForm.rating, comment: reviewForm.comment }),
      });
      const data = await res.json();
      setReviewMsg(res.ok ? "Review submitted! It will appear once approved." : data.msg || "Failed to submit.");
      if (res.ok) setReviewForm({ rating: 5, comment: "" });
    } catch { setReviewMsg("Unable to reach the server."); }
    finally { setSubmitting(false); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const activeFiltersCount = (activeTab !== "All" ? 1 : 0) + (maxPrice ? 1 : 0) + dietary.length + (search ? 1 : 0);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),transparent_35%)]">
      {/* Header */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-amber-400/90">Seasonal showcase</p>
        <h1 className="mt-4 text-4xl font-serif text-white sm:text-5xl lg:text-6xl leading-tight">
          A crafted selection of dishes to ignite every palate.
        </h1>
        <p className="mt-4 text-neutral-400 max-w-3xl mx-auto text-sm sm:text-base">
          Add your favorites to the cart and order online, or reserve a table to dine in with a curated tasting menu built for the season.
        </p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Link href="/order" className="rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/20 transition hover:bg-amber-400">
            Order Online
          </Link>
          <Link href="/reserve" className="rounded-full border border-amber-500/30 bg-neutral-900/80 px-8 py-3 text-sm font-semibold text-amber-400 transition hover:bg-neutral-900">
            Reserve a Table
          </Link>
        </div>
      </div>

      {/* Reorder suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">Order Again</p>
            <p className="text-sm text-neutral-400">Based on your past favorites.</p>
          </div>
          <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {suggestions.map((item) => (
              <div key={item._id} className="shrink-0 w-full max-w-[240px] rounded-[1.75rem] border border-neutral-800 bg-neutral-950/95 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-amber-500/30">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 mt-1">{item.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-black">${item.price}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.available}
                  className="mt-5 w-full rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:opacity-40"
                >
                  {addedId === item._id ? "Added ✓" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="mt-12 rounded-3xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search dishes, ingredients…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search menu"
              className="w-full rounded-full border border-neutral-800 bg-neutral-950/90 pl-10 pr-4 py-3 text-sm text-white outline-none transition focus:border-amber-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${showFilters || activeFiltersCount > 0 ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters {activeFiltersCount > 0 && <span className="rounded-full bg-amber-500 text-black text-xs w-5 h-5 flex items-center justify-center font-bold">{activeFiltersCount}</span>}
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-950/95 p-6 shadow-2xl shadow-black/20">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.36em] text-neutral-500">Max Price</p>
              <div className="flex flex-wrap gap-2">
                {["", "15", "25", "40", "60"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setMaxPrice(p)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${maxPrice === p ? "bg-amber-500 text-black" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"}`}
                  >
                    {p ? `Under $${p}` : "Any"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.36em] text-neutral-500">Dietary</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleDietary(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${dietary.includes(tag) ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setMaxPrice(""); setDietary([]); setActiveTab("All"); }}
              className="mt-4 text-sm text-amber-400 hover:text-amber-300 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Category tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="tablist" aria-label="Menu categories">
        {categories.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeTab === cat}
            onClick={() => setActiveTab(cat)}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${activeTab === cat ? "bg-amber-500 text-black" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="mt-4 text-sm text-neutral-500">
          {menu.length} {menu.length === 1 ? "item" : "items"} found
          {search && <span> for &ldquo;<span className="text-amber-400">{search}</span>&rdquo;</span>}
        </p>
      )}

      {/* Menu grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="tabpanel">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : menu.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center">
            <p className="text-neutral-400">No items found. Try adjusting your filters.</p>
            <button onClick={() => { setSearch(""); setSearchInput(""); setMaxPrice(""); setDietary([]); setActiveTab("All"); }} className="mt-4 text-sm text-amber-400 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          menu.map((item) => (
            <article
              key={item._id}
              className="group rounded-[2rem] border border-neutral-800/90 bg-neutral-950/95 overflow-hidden shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:bg-neutral-900"
              aria-label={item.name}
            >
              {/* Image */}
              <div className="relative w-full h-52 overflow-hidden bg-neutral-800">
                {resolveImg(item.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveImg(item.image)}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                {item.premium && (
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-black uppercase tracking-wide flex items-center gap-1">
                      <span>👑</span> Chef&apos;s Recommendation
                    </span>
                    <span className="rounded-full bg-purple-500/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                      <span>🍷</span> Sommelier Pairing
                    </span>
                  </div>
                )}
                {!item.available && (
                  <span className="absolute top-4 right-4 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-semibold text-white">Out of Stock</span>
                )}
                <span className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-amber-400 backdrop-blur-sm">
                  ${item.price}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-white line-clamp-2">{item.name}</h2>
                    {item.premium && (
                      <p className="mt-1 text-[11px] text-purple-300 font-medium flex items-center gap-1">
                        🍷 <span>Suggested pairing: Château Margaux Grand Cru</span>
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-6 text-neutral-400 line-clamp-3">{item.description}</p>

                    {item.dietary && item.dietary.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.dietary.map((tag) => (
                          <span key={tag} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] text-emerald-300 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => openReviews(item)}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-300 transition"
                      aria-label={`View reviews for ${item.name}`}
                    >
                      {item.rating ? (
                        <>
                          <Stars value={item.rating} />
                          <span className="text-amber-400 font-medium">{item.rating}</span>
                          <span className="text-neutral-500">({item.reviewCount})</span>
                        </>
                      ) : (
                        <span className="text-neutral-500">★ No reviews yet</span>
                      )}
                    </button>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-3">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      aria-label={`Add ${item.name} to cart`}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${addedId === item._id
                          ? "bg-emerald-500 text-black"
                          : "bg-amber-500 text-black hover:bg-amber-400"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {addedId === item._id ? "Added ✓" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => openReviews(item)}
                      className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition"
                    >
                      Reviews
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Reviews modal */}
      {reviewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 id="review-modal-title" className="text-xl font-serif text-white">{reviewItem.name}</h3>
                <p className="text-sm text-neutral-500">Ratings & reviews</p>
              </div>
              <button onClick={() => setReviewItem(null)} aria-label="Close reviews" className="text-neutral-400 hover:text-white transition">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {reviewsLoading ? (
                <p className="text-center text-neutral-500 py-6 text-sm">Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="text-center text-neutral-500 py-6 text-sm">No approved reviews yet.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r._id} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{r.userName}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-2 text-sm text-neutral-300 leading-6">{r.comment}</p>
                    {r.adminReply && (
                      <div className="mt-3 rounded-xl bg-neutral-950/70 border border-amber-500/20 p-3">
                        <p className="text-xs font-semibold text-amber-400 mb-1">Chef&apos;s response</p>
                        <p className="text-xs text-neutral-400">{r.adminReply}</p>
                      </div>
                    )}
                    <p className="mt-2 text-[11px] text-neutral-600">{formatDate(r.createdAt)}</p>
                  </div>
                ))
              )}
            </div>

            {token ? (
              <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
                <p className="text-sm font-semibold text-white mb-3">Write a review</p>
                <div className="flex items-center gap-1 mb-3" role="group" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                      aria-label={`${n} stars`}
                      className={`text-2xl transition ${n <= reviewForm.rating ? "text-amber-400" : "text-neutral-700 hover:text-neutral-500"}`}>★</button>
                  ))}
                  <span className="ml-2 text-sm text-neutral-400">{reviewForm.rating}/5</span>
                </div>
                <textarea rows={3} required value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience…"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500 resize-none"
                />
                {reviewMsg && <p className="mt-2 text-sm text-amber-300">{reviewMsg}</p>}
                <button type="submit" disabled={submitting}
                  className="mt-3 w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition disabled:opacity-50">
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 text-center">
                <p className="text-sm text-neutral-400 mb-3">Log in to write a review.</p>
                <Link href="/login" className="inline-block rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition">
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
