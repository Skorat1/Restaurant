"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play, Pause, Radio, Video, Mic, Newspaper, Sparkles, Eye, Heart,
  Share2, Volume2, VolumeX, Maximize, X, Search, CheckCircle2, MessageSquare,
  Clock, Award, Flame, User, Send, ChevronRight
} from "lucide-react";
import API_BASE_URL from "@/lib/api";
import { resolveImg } from "@/lib/image";

interface MediaItem {
  _id: string;
  title: string;
  description: string;
  type: "video" | "podcast" | "livestream" | "article";
  category: string;
  videoUrl?: string;
  audioUrl?: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  host: string;
  tags: string[];
  isFeatured?: boolean;
  isLive?: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isVip?: boolean;
}

const TYPE_FILTERS = [
  { id: "all", label: "All Media", icon: Sparkles },
  { id: "video", label: "Masterclasses 🎬", icon: Video },
  { id: "podcast", label: "Sommelier Podcasts 🎙️", icon: Mic },
  { id: "livestream", label: "Live Kitchen 🔴", icon: Radio },
  { id: "article", label: "Food Magazine 📰", icon: Newspaper },
];

export default function MediaPlatformPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Currently playing item modal / bottom bar
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  // Live Chat simulation for live streams
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", user: "Eleanor V.", text: "The searing technique on that Wagyu looks incredible!", time: "2m ago", isVip: true },
    { id: "2", user: "Chef Marcus", text: "Notice the heat control with Binchotan oak charcoal 👌", time: "1m ago", isVip: true },
    { id: "3", user: "Siddharth M.", text: "Which vintage Bordeaux is paired with this course?", time: "Just now" },
  ]);
  const [newComment, setNewComment] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch Media Items
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeType !== "all") params.set("type", activeType);
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (search) params.set("q", search);

    fetch(`${API_BASE_URL}/api/media?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMediaList(data);
          const initialLikes: Record<string, number> = {};
          data.forEach((item) => { initialLikes[item._id] = item.likes; });
          setLikeCounts(initialLikes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType, activeCategory, search]);

  const featuredItem = mediaList.find((m) => m.isLive) || mediaList.find((m) => m.isFeatured) || mediaList[0];

  const handlePlayMedia = (item: MediaItem) => {
    setActiveMedia(item);
    setIsPlaying(true);
  };

  const toggleLike = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLiked = likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !isLiked }));
    setLikeCounts((prev) => ({ ...prev, [id]: (prev[id] || 0) + (isLiked ? -1 : 1) }));

    try {
      await fetch(`${API_BASE_URL}/api/media/${id}/like`, { method: "POST" });
    } catch {}
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        user: "You (Patron)",
        text: newComment.trim(),
        time: "Just now",
        isVip: true,
      },
    ]);
    setNewComment("");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 pb-28">

      {/* ── MEDIA HERO & FEATURED STREAM PLAYER ─────────────────────────────── */}
      <section className="relative py-16 overflow-hidden border-b border-neutral-900 bg-gradient-to-b from-neutral-950 via-neutral-900/60 to-neutral-950">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                L&apos;Étoile Culinary Broadcast Network
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif text-white font-bold tracking-tight">
                Gastronomy Media &amp; Streaming Hub
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-light">
                Watch 4K Ultra-HD culinary masterclasses, listen to sommelier cellar podcasts, and stream live open-kitchen broadcasts directly from our executive chefs.
              </p>
            </div>

            <div className="flex gap-2">
              <span className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                24,500+ Active Viewers
              </span>
            </div>
          </div>

          {/* Featured Hero Media Player Banner */}
          {featuredItem && (
            <div className="card-glass rounded-3xl overflow-hidden border-amber-500/30 shadow-2xl relative grid lg:grid-cols-12 gap-0 group">
              <div className="lg:col-span-8 relative h-[380px] sm:h-[460px] bg-black overflow-hidden">
                <Image
                  src={resolveImg(featuredItem.thumbnail)}
                  alt={featuredItem.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Live / Featured Badge Overlay */}
                <div className="absolute top-6 left-6 flex gap-2">
                  {featuredItem.isLive ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 badge-pulse shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      LIVE BROADCAST
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Award className="w-3.5 h-3.5 text-black" /> FEATURED MASTERCLASS
                    </span>
                  )}
                  <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                    {featuredItem.duration}
                  </span>
                </div>

                {/* Big Play Button Overlay */}
                <button
                  type="button"
                  onClick={() => handlePlayMedia(featuredItem)}
                  className="absolute inset-0 flex items-center justify-center group/btn"
                  aria-label="Play Featured Stream"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl shadow-amber-500/40 group-hover/btn:scale-110 group-hover/btn:bg-amber-400 transition-all duration-300">
                    <Play className="w-8 h-8 fill-black translate-x-0.5" />
                  </div>
                </button>
              </div>

              {/* Hero Item Details */}
              <div className="lg:col-span-4 p-8 flex flex-col justify-between space-y-6 bg-neutral-950/95 border-l border-neutral-800">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20">
                      {featuredItem.category}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-neutral-500" /> {featuredItem.views.toLocaleString()} views
                    </span>
                  </div>

                  <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                    {featuredItem.title}
                  </h2>

                  <p className="text-xs text-neutral-300 leading-relaxed font-light line-clamp-4">
                    {featuredItem.description}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Featured Host</p>
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" /> {featuredItem.host}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePlayMedia(featuredItem)}
                    className="flex-1 btn-primary py-3 text-xs tracking-widest font-extrabold flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-black" /> Stream Now
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleLike(featuredItem._id, e)}
                    className={`p-3 rounded-full border transition ${
                      likedMap[featuredItem._id]
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedMap[featuredItem._id] ? "fill-red-400 text-red-400" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FILTER TABS & SEARCH BAR ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Type Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {TYPE_FILTERS.map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition shrink-0 flex items-center gap-2 ${
                    activeType === t.id
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search masterclasses, podcasts, chefs..."
              className="input-base py-2.5 pl-10 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-neutral-500 font-bold uppercase tracking-widest text-[10px] mr-2">Category:</span>
          {["All", "Masterclass", "Chef Series", "Sommelier Vault", "Live Kitchen", "Food Journalism"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition shrink-0 ${
                activeCategory === cat
                  ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── MEDIA GRID ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-neutral-900/60 animate-pulse border border-neutral-800" />
            ))}
          </div>
        ) : mediaList.length === 0 ? (
          <div className="card-glass rounded-3xl p-16 text-center space-y-4">
            <div className="text-5xl">🎬</div>
            <h3 className="text-xl font-serif text-white font-bold">No media broadcasts found</h3>
            <p className="text-xs text-neutral-400">Try selecting a different category or clearing search keywords.</p>
            <button
              type="button"
              onClick={() => { setActiveType("all"); setActiveCategory("All"); setSearch(""); }}
              className="btn-outline text-xs py-2.5 px-6"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaList.map((item) => {
              const isLiked = likedMap[item._id];
              const likes = likeCounts[item._id] ?? item.likes;

              return (
                <div
                  key={item._id}
                  onClick={() => handlePlayMedia(item)}
                  className="card-glass rounded-3xl overflow-hidden group flex flex-col justify-between border-neutral-800/80 hover:border-amber-500/40 cursor-pointer transition-all duration-300"
                >
                  <div>
                    {/* Thumbnail Viewport */}
                    <div className="relative h-52 overflow-hidden bg-black">
                      <Image
                        src={resolveImg(item.thumbnail)}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {item.isLive ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5 badge-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                            {item.duration}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-neutral-300 text-[10px] font-bold border border-neutral-700">
                          {item.category}
                        </span>
                      </div>

                      {/* Play Hover Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-xl shadow-amber-500/40">
                          <Play className="w-6 h-6 fill-black translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="text-base font-serif font-bold text-white group-hover:text-amber-400 transition line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed font-light line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-800/60 mt-2 text-xs text-neutral-400">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-amber-400" /> {item.host}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleLike(item._id, e)}
                      className="flex items-center gap-1.5 hover:text-red-400 transition"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
                      <span>{likes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FULLSCREEN MEDIA PLAYER MODAL & LIVE CHAT SIMULATION ─────────────── */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-up">
          <div className="w-full max-w-5xl rounded-3xl border border-amber-500/40 bg-neutral-900/98 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80 shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h3 className="text-base font-serif font-bold text-white truncate max-w-xl">
                  {activeMedia.title}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 hidden sm:inline-block">
                  {activeMedia.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setActiveMedia(null); setIsPlaying(false); }}
                className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500/40 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Grid */}
            <div className="grid lg:grid-cols-12 gap-0 overflow-y-auto flex-1">
              
              {/* Media Viewport */}
              <div className="lg:col-span-8 bg-black flex flex-col justify-between p-4 relative min-h-[320px] sm:min-h-[420px]">
                {activeMedia.type === "video" || activeMedia.type === "livestream" ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={activeMedia.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                ) : activeMedia.type === "podcast" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-6 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-neutral-950 rounded-2xl border border-neutral-800">
                    <div className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Mic className="w-12 h-12 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-serif font-bold text-white">{activeMedia.title}</h4>
                      <p className="text-xs text-neutral-400">Podcast Episode · Hosted by {activeMedia.host}</p>
                    </div>
                    <audio
                      ref={audioRef}
                      src={activeMedia.audioUrl}
                      controls
                      autoPlay
                      className="w-full max-w-md"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full p-8 overflow-y-auto space-y-4 text-xs leading-relaxed text-neutral-300 font-light">
                    <h4 className="text-2xl font-serif font-bold text-white">{activeMedia.title}</h4>
                    <p className="text-amber-400 font-bold">{activeMedia.host} · {activeMedia.duration}</p>
                    <p className="text-sm leading-relaxed">{activeMedia.description}</p>
                    <p>Classic French gastronomy relies on reduction sauces, brown butter emulsion, and precision seasoning. At L&apos;Étoile Dorée, our kitchen bridges centuries-old culinary tradition with modern molecular precision.</p>
                  </div>
                )}
              </div>

              {/* Sidebar: Details or Live Chat */}
              <div className="lg:col-span-4 p-6 bg-neutral-950 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-neutral-800">
                {activeMedia.isLive ? (
                  /* Live Stream Chat Simulation */
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-amber-400" /> Live Kitchen Chat
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">🟢 890 Online</span>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 text-[11px] flex items-center gap-1">
                                {msg.user} {msg.isVip && <Award className="w-3 h-3 text-amber-400" />}
                              </span>
                              <span className="text-[9px] text-neutral-500 font-mono">{msg.time}</span>
                            </div>
                            <p className="text-neutral-300 font-light">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-neutral-800">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Say something in live chat..."
                        className="input-base py-2 px-3 text-xs flex-1"
                      />
                      <button type="submit" className="p-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : (
                  /* Standard Media Details */
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {activeMedia.category}
                      </span>
                      <h4 className="text-xl font-serif font-bold text-white">{activeMedia.title}</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed font-light">{activeMedia.description}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Host / Instructor:</span>
                        <span className="font-bold text-amber-300">{activeMedia.host}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Total Views:</span>
                        <span className="font-mono text-white">{activeMedia.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-400">
                        <span>Format:</span>
                        <span className="uppercase text-amber-400 font-bold">{activeMedia.type}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/reserve"
                        onClick={() => setActiveMedia(null)}
                        className="btn-primary w-full text-center py-3 text-xs tracking-widest font-extrabold"
                      >
                        Book Table Experience
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}
