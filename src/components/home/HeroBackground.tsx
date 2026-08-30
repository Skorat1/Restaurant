"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80", // Cocktails/Bar
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80", // Fine dining plate
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1920&q=80", // Balcony view
];

export default function HeroBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      {HERO_IMAGES.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={`Hero Background ${idx + 1}`}
          fill
          priority={idx === 0}
          sizes="100vw"
          style={{ transitionDuration: '6000ms' }}
          className={`object-cover transition-all ease-out origin-center ${
            idx === currentIndex ? "opacity-100 scale-110" : "opacity-0 scale-100"
          }`}
        />
      ))}
      {/* Universal Luxury Scrim Gradients: full coverage on mobile, smooth fade on desktop */}
      <div className="absolute inset-0 bg-neutral-950/75 md:bg-transparent md:bg-gradient-to-r md:from-neutral-950 md:via-neutral-950/90 md:to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-neutral-950/60 z-10 pointer-events-none" />
    </div>
  );
}
