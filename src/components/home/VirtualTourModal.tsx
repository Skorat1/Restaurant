"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Compass, Eye, Users, MapPin } from "lucide-react";

export const ROOMS_360 = [
  {
    id: "main",
    name: "Main Dining Salon",
    desc: "Warm ambient candlelight, velvet plush booths, and live acoustic jazz evening stage.",
    capacity: "Up to 80 Guests",
    vibe: "Intimate & Romantic",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    badge: "Most Popular",
  },
  {
    id: "terrace",
    name: "VIP Skylight Terrace",
    desc: "Glass skylight ceiling with panoramic moonlit skyline views and private champagne lounge.",
    capacity: "Up to 35 Guests",
    vibe: "Starlit Sky & Luxury",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    badge: "Panoramic Views",
  },
  {
    id: "patio",
    name: "Garden Patio & Rose Lanterns",
    desc: "Alfresco courtyard dining under heated rose lanterns surrounded by botanical water fountains.",
    capacity: "Up to 45 Guests",
    vibe: "Fresh & Botanical",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    badge: "Open Air Dining",
  },
  {
    id: "cellar",
    name: "Grand Wine Vault",
    desc: "Subterranean temperature-controlled cellar surrounded by 2,500+ Grand Cru vintage bottles.",
    capacity: "Up to 14 Guests",
    vibe: "Exclusive Private Tasting",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80",
    badge: "Sommelier Reserve",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualTourModal({ isOpen, onClose }: Props) {
  const [activeRoom, setActiveRoom] = useState(ROOMS_360[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-up">
      <div className="w-full max-w-4xl rounded-3xl border border-amber-500/40 bg-neutral-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-neutral-950/80 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500/40 transition z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              360° Virtual Dining Ambience Tour
              <span className="text-[10px] uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-sans font-bold hidden sm:inline-block">
                HD Interactive
              </span>
            </h3>
            <p className="text-xs text-neutral-400">Step inside L&apos;Étoile Dorée luxury spaces before reserving your table</p>
          </div>
        </div>

        {/* Room Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 relative z-10">
          {ROOMS_360.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                activeRoom.id === room.id
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                  : "bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              <span className="font-serif font-bold text-sm text-white mb-1">{room.name}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">{room.badge}</span>
            </button>
          ))}
        </div>

        {/* 360 Viewport Display */}
        <div className="w-full h-80 rounded-2xl border border-amber-500/30 relative flex flex-col items-center justify-end p-6 overflow-hidden shadow-2xl group z-10">
          <Image
            src={activeRoom.img}
            alt={activeRoom.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="relative z-10 text-center space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              360° Panorama · {activeRoom.vibe}
            </div>
            <h4 className="text-2xl font-serif font-bold text-white">{activeRoom.name}</h4>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">{activeRoom.desc}</p>
            <div className="flex items-center justify-center gap-4 pt-2 text-[11px] font-medium text-amber-300/90">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> {activeRoom.capacity}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Ground &amp; Skylight Level</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 relative z-10">
          <Link
            href={`/reserve?area=${encodeURIComponent(activeRoom.name)}`}
            onClick={onClose}
            className="btn-primary text-center flex-1 py-3.5 text-xs tracking-widest"
          >
            Book Table in {activeRoom.name}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline py-3.5 text-xs tracking-widest"
          >
            Close Panorama
          </button>
        </div>
      </div>
    </div>
  );
}
