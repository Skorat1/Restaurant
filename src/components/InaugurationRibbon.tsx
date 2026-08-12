"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Scissors, Gift, Award, PartyPopper, Check, Copy, Wine, Flame, ChevronRight, X, Crown } from "lucide-react";
import Link from "next/link";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  vRot: number;
  alpha: number;
  shape: "rect" | "circle" | "star";
}

export default function InaugurationRibbon() {
  const [showCeremony, setShowCeremony] = useState(false);
  const [isCut, setIsCut] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [toastCount, setToastCount] = useState(248);
  const [hasToasted, setHasToasted] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check if inaugurated before in localStorage (default to showing banner)
  useEffect(() => {
    const prevDone = localStorage.getItem("etoile_inauguration_done");
    if (!prevDone) {
      // Auto open modal on first visit after 800ms delay
      const t = setTimeout(() => {
        setShowCeremony(true);
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Web Audio Synthesizer for Celebratory Fanfare & Confetti Pop
  const playSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Fanfare notes (C4, E4, G4, C5, E5, G5)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
      });

      // Pop sound
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = "sine";
      popOsc.frequency.setValueAtTime(400, ctx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      popGain.gain.setValueAtTime(0.4, ctx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(ctx.currentTime);
      popOsc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback silent failure
    }
  };

  // Launch HTML5 Confetti Cannon
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#f59e0b", "#fbbf24", "#d97706", "#ef4444", "#dc2626", "#ffffff", "#fef08a", "#e0e7ff"];
    const particles: Particle[] = [];

    // Create 160 multi-shaped particles
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() * 120 - 60),
        y: canvas.height / 2 + (Math.random() * 40 - 20),
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.7) * 20 - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "circle" : "rect",
      });
    }

    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * r + cx, Math.sin(((18 + i * 72) * Math.PI) / 180) * r + cy);
        ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (r / 2) + cx, Math.sin(((54 + i * 72) * Math.PI) / 180) * (r / 2) + cy);
      }
      ctx.closePath();
      ctx.fill();
    };

    let startTime = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      let activeCount = 0;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.vx *= 0.98; // Air drag
        p.rotation += p.vRot;
        if (elapsed > 1800) p.alpha -= 0.015;

        if (p.alpha > 0) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            drawStar(0, 0, p.size);
          }
          ctx.restore();
        }
      });

      if (activeCount > 0 && elapsed < 4000) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  };

  const handleCutRibbon = () => {
    if (isCut) return;
    setIsCut(true);
    playSound();
    triggerConfetti();
    localStorage.setItem("etoile_inauguration_done", "true");

    setTimeout(() => {
      setShowVoucher(true);
    }, 1200);
  };

  const handleToast = () => {
    if (!hasToasted) {
      setToastCount((c) => c + 1);
      setHasToasted(true);
      playSound();
      triggerConfetti();
    }
  };

  const copyPromo = () => {
    navigator.clipboard.writeText("INAUGURATION2026");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Canvas for Confetti Fireworks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[100]"
      />

      {/* Top Header Announcement Ticker Bar */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-600 to-amber-950 text-amber-100 text-xs sm:text-sm py-2 px-4 border-b border-amber-500/30 flex items-center justify-between gap-2 shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="bg-amber-500 text-black font-extrabold text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
              <PartyPopper className="w-3 h-3" /> GRAND INAUGURATION
            </span>
            <span className="hidden sm:inline">
              L’Étoile Dorée is officially launched! Celebrate with 25% Off reservations.
            </span>
            <span className="sm:hidden">
              Official Website Inauguration 2026!
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIsCut(false);
                setShowVoucher(false);
                setShowCeremony(true);
              }}
              className="bg-neutral-900/90 hover:bg-neutral-950 text-amber-400 border border-amber-500/40 hover:border-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Perform Ribbon Cutting</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── GRAND INAUGURATION CEREMONY OVERLAY MODAL ── */}
      {showCeremony && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          {/* Close button */}
          <button
            onClick={() => setShowCeremony(false)}
            className="absolute top-6 right-6 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900/80 border border-neutral-800 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Glowing Ambient Backdrop Light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative w-full max-w-2xl bg-neutral-950/90 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center overflow-hidden">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4 shadow-inner">
              <Crown className="w-4 h-4 text-amber-400" /> Official Launch & Inauguration 2026
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-neutral-100 font-bold mb-3 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">L’Étoile Dorée</span>
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base max-w-md mx-auto mb-8 font-light leading-relaxed">
              We cordially invite you to inaugurate our luxury fine dining portal. Click the golden scissors below to cut the velvet ribbon!
            </p>

            {/* ── REALISTIC SILK RIBBON CONTAINER ── */}
            <div className="relative my-8 py-10 flex items-center justify-center min-h-[160px] select-none">

              {/* Left Ribbon Half */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-14 bg-gradient-to-b from-red-600 via-red-500 to-red-800 border-y-2 border-amber-300/80 shadow-2xl flex items-center justify-end px-4 transition-all duration-700 ease-out z-10 ${
                  isCut
                    ? "-translate-x-full opacity-0 -rotate-12 scale-90"
                    : "w-1/2 rounded-l-md"
                }`}
              >
                <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
                <span className="text-amber-200/60 text-xs uppercase tracking-widest font-mono hidden sm:inline">L’Étoile Dorée</span>
              </div>

              {/* Right Ribbon Half */}
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 h-14 bg-gradient-to-b from-red-600 via-red-500 to-red-800 border-y-2 border-amber-300/80 shadow-2xl flex items-center justify-start px-4 transition-all duration-700 ease-out z-10 ${
                  isCut
                    ? "translate-x-full opacity-0 rotate-12 scale-90"
                    : "w-1/2 rounded-r-md"
                }`}
              >
                <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
                <span className="text-amber-200/60 text-xs uppercase tracking-widest font-mono hidden sm:inline">Grand Launch</span>
              </div>

              {/* Center Golden Medallion Bow & Scissors Button */}
              {!isCut ? (
                <button
                  onClick={handleCutRibbon}
                  className="group relative z-20 flex flex-col items-center justify-center p-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-4 border-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  {/* Glowing Ring */}
                  <span className="absolute -inset-2 rounded-full bg-amber-400/40 blur-md group-hover:bg-amber-300/60 transition-all animate-ping opacity-75" />
                  
                  <Scissors className="w-10 h-10 text-neutral-950 -rotate-45 group-hover:rotate-0 transition-transform duration-300 drop-shadow-md" />
                  <span className="mt-1 text-[11px] font-extrabold uppercase text-neutral-950 tracking-wider">
                    CUT RIBBON
                  </span>
                </button>
              ) : (
                <div className="relative z-20 flex flex-col items-center justify-center animate-in zoom-in-50 duration-500">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 shadow-[0_0_50px_rgba(245,158,11,0.9)]">
                    <Sparkles className="w-10 h-10 animate-spin text-black" />
                  </div>
                  <span className="mt-3 text-amber-300 font-serif text-lg font-bold">
                    ✨ INAUGURATED! ✨
                  </span>
                </div>
              )}
            </div>

            {/* Instruction prompt */}
            {!isCut && (
              <p className="text-amber-400/80 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Tap Golden Scissors to Inaugurate & Reveal Grand VIP Perk
              </p>
            )}

            {/* ── AFTER CUT VOUCHER REVEAL CARD ── */}
            {showVoucher && (
              <div className="mt-6 bg-neutral-900/90 border border-amber-500/40 rounded-2xl p-6 text-left shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-amber-400 text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 mb-1">
                      <Gift className="w-4 h-4" /> Inauguration Special Perk Unlocked
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl text-neutral-100 font-bold">
                      25% Off Your First VIP Dining or Order
                    </h3>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                      Includes complimentary vintage chef appetizer & priority table seating.
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-center shrink-0">
                    <span className="text-amber-300 text-xs block font-mono">CODE</span>
                    <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wider font-mono">INAUGURATION2026</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Toast Button */}
                  <button
                    onClick={handleToast}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      hasToasted
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700"
                    }`}
                  >
                    <Wine className="w-4 h-4 text-amber-400" />
                    <span>{hasToasted ? "Toast Raised! 🥂" : "Raise a Champagne Toast 🥂"}</span>
                    <span className="bg-neutral-950 px-2 py-0.5 rounded-full text-amber-400 text-[10px]">
                      {toastCount}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyPromo}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Code"}</span>
                    </button>

                    <Link
                      href="/reserve"
                      onClick={() => setShowCeremony(false)}
                      className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1 shadow-lg transition-all"
                    >
                      <span>Book VIP Table</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
