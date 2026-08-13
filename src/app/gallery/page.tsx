"use client";
import { useState } from "react";
import Link from "next/link";
import { resolveImg } from "@/lib/image";

const IMAGES = [
  { src: "gujratithali.png", alt: "Gujarati Thali", category: "Regional Thali" },
  { src: "panjabi thali.jpg", alt: "Punjabi Thali", category: "Regional Thali" },
  { src: "panjabi thali1.jpg", alt: "Punjabi Thali Spread", category: "Regional Thali" },
  { src: "panjabi thali.jfif", alt: "Punjabi Thali Delight", category: "Regional Thali" },
  { src: "vada-pav.jpg", alt: "Vada Pav", category: "Street Food" },
  { src: "vada-pav-1785922301038.jpg", alt: "Classic Vada Pav", category: "Street Food" },
];

const CATEGORIES = ["All", ...Array.from(new Set(IMAGES.map((i) => i.category)))];

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered =
    activeFilter === "All" ? IMAGES : IMAGES.filter((i) => i.category === activeFilter);

  return (
    <main className="space-y-16">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-amber-400">Gallery</span>
          <h1 className="mt-6 text-5xl font-serif text-white sm:text-6xl">A feast for the eyes.</h1>
          <p className="mt-5 text-neutral-400 max-w-2xl mx-auto leading-8">
            A glimpse into our kitchen — from regional thalis to beloved street classics, every plate at L&apos;Étoile Dorée is a work of art.
          </p>

          {/* Filter tabs */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeFilter === cat
                    ? "bg-amber-500 text-black"
                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {filtered.map((img) => (
            <button
              key={img.src}
              onClick={() => setLightbox(resolveImg(img.src))}
              className="group relative mb-6 w-full break-inside-avoid overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/60 text-left"
              aria-label={`View ${img.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImg(img.src)}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                suppressHydrationWarning
                className="w-full h-auto object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition duration-300">
                <p className="text-white font-semibold">{img.alt}</p>
                <p className="text-xs text-amber-400 uppercase tracking-wide mt-1">{img.category}</p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-neutral-900/80 to-neutral-950 border border-amber-500/20 p-12 text-center">
          <h3 className="text-3xl font-serif">Taste it for yourself.</h3>
          <p className="mt-4 text-neutral-400 max-w-lg mx-auto">Book a table or order online to experience these dishes fresh from our kitchen.</p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/menu" className="btn-primary">Explore Menu</Link>
            <Link href="/reserve" className="btn-outline">Reserve a Table</Link>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white transition"
            aria-label="Close"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Gallery preview"
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </main>
  );
}
