"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Compass,
  Eye,
  Users,
  MapPin,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Smartphone,
  Music,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Flame,
  Award,
  Wine,
  Utensils
} from "lucide-react";

export interface Hotspot {
  id: string;
  yaw: number; // -180 to 180 degrees
  pitch: number; // -90 to 90 degrees
  title: string;
  type: "table" | "jazz" | "cellar" | "chef";
  subtitle: string;
  icon: any;
  actionText: string;
}

export interface Room360 {
  id: string;
  areaKey: string;
  name: string;
  desc: string;
  capacity: string;
  vibe: string;
  badge: string;
  img: string;
  hotspots: Hotspot[];
}

export const ROOMS_360: Room360[] = [
  {
    id: "main",
    areaKey: "Main Room",
    name: "Main Dining Salon",
    desc: "Warm ambient candlelight, velvet plush booths, and live acoustic jazz evening stage.",
    capacity: "Up to 80 Guests",
    vibe: "Intimate & Romantic",
    badge: "Most Popular",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=85",
    hotspots: [
      {
        id: "main-table-4",
        yaw: -30,
        pitch: -10,
        title: "VIP Velvet Booth #4",
        type: "table",
        subtitle: "Prime centre-stage view with bespoke candlelight setup",
        icon: Utensils,
        actionText: "Reserve Table #4",
      },
      {
        id: "main-jazz-stage",
        yaw: 55,
        pitch: 5,
        title: "Live Jazz & Performance Stage",
        type: "jazz",
        subtitle: "Evening acoustic saxophone & grand piano quartet",
        icon: Music,
        actionText: "View Jazz Schedule",
      },
      {
        id: "main-cellar-arch",
        yaw: 140,
        pitch: -5,
        title: "Sommelier Display Arch",
        type: "cellar",
        subtitle: "Featured 1er Grand Cru Classé selections",
        icon: Wine,
        actionText: "Explore Wine Pairing",
      },
    ],
  },
  {
    id: "terrace",
    areaKey: "Terrace",
    name: "VIP Skylight Terrace",
    desc: "Glass skylight ceiling with panoramic moonlit skyline views and private champagne lounge.",
    capacity: "Up to 35 Guests",
    vibe: "Starlit Sky & Luxury",
    badge: "Panoramic Views",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=85",
    hotspots: [
      {
        id: "terrace-vip-table",
        yaw: -15,
        pitch: -8,
        title: "Starlight Skyline Table #12",
        type: "table",
        subtitle: "Direct glass-dome views of the night constellations",
        icon: Utensils,
        actionText: "Reserve Starlight Table",
      },
      {
        id: "terrace-champagne-bar",
        yaw: 80,
        pitch: 0,
        title: "Dom Pérignon Lounge Bar",
        type: "cellar",
        subtitle: "Chilled vintage flutes & Beluga caviar service",
        icon: Wine,
        actionText: "View Champagne List",
      },
    ],
  },
  {
    id: "patio",
    areaKey: "Patio",
    name: "Garden Patio & Rose Lanterns",
    desc: "Alfresco courtyard dining under heated rose lanterns surrounded by botanical water fountains.",
    capacity: "Up to 45 Guests",
    vibe: "Fresh & Botanical",
    badge: "Open Air Dining",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2000&q=85",
    hotspots: [
      {
        id: "patio-fountain-table",
        yaw: -45,
        pitch: -12,
        title: "Courtyard Fountain Table #8",
        type: "table",
        subtitle: "Peaceful waterside dining under heated lantern pergola",
        icon: Utensils,
        actionText: "Reserve Garden Table",
      },
      {
        id: "patio-chef-grill",
        yaw: 70,
        pitch: 5,
        title: "Binchotan Charcoal Open Grill",
        type: "chef",
        subtitle: "Live grilling of Miyazaki A5 Wagyu & sea scampi",
        icon: Flame,
        actionText: "Chef's Tasting Notes",
      },
    ],
  },
  {
    id: "cellar",
    areaKey: "Lounge",
    name: "Grand Wine Vault",
    desc: "Subterranean temperature-controlled cellar surrounded by 2,500+ Grand Cru vintage bottles.",
    capacity: "Up to 14 Guests",
    vibe: "Exclusive Private Tasting",
    badge: "Sommelier Reserve",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=2000&q=85",
    hotspots: [
      {
        id: "vault-private-table",
        yaw: 0,
        pitch: -10,
        title: "Master Sommelier Round Table",
        type: "table",
        subtitle: "Private dining surrounded by 1982 Bordeaux vintages",
        icon: Utensils,
        actionText: "Reserve Wine Vault",
      },
      {
        id: "vault-rare-collection",
        yaw: 110,
        pitch: 0,
        title: "Château Latour Rare Reserve",
        type: "cellar",
        subtitle: "Historic vertical collection spanning 40+ years",
        icon: Wine,
        actionText: "Sommelier Consultation",
      },
    ],
  },
];

// ── Web Audio API Ambient Jazz Synthesizer ──
class AmbientJazzSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timer: NodeJS.Timeout | null = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.isPlaying = true;

      // Soothing jazz chords (Cmaj9, Am9, Dm9, G13)
      const chords = [
        [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
        [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
        [293.66, 349.23, 440.0, 523.25, 659.25], // Dm9
        [196.0, 246.94, 293.66, 349.23, 440.0],  // G13
      ];

      let chordIdx = 0;
      const playNextChord = () => {
        if (!this.isPlaying || !this.ctx) return;
        const now = this.ctx.currentTime;
        const currentChord = chords[chordIdx % chords.length];
        chordIdx++;

        currentChord.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          // Soft ambient fade in and fade out
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.015, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 4.6);
        });

        this.timer = setTimeout(playNextChord, 4000);
      };

      playNextChord();
    } catch {
      // Ignored if browser blocks autoplay
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualTourModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [activeRoom, setActiveRoom] = useState<Room360>(ROOMS_360[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [jazzModalOpen, setJazzModalOpen] = useState(false);

  const [imageLoading, setImageLoading] = useState(true);

  // Panorama View Angles (Yaw: horizontal deg, Pitch: vertical deg, Zoom/FOV)
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioSynthRef = useRef<AmbientJazzSynth | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize synth
  useEffect(() => {
    audioSynthRef.current = new AmbientJazzSynth();
    return () => {
      audioSynthRef.current?.stop();
    };
  }, []);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      audioSynthRef.current?.stop();
      setIsAudioPlaying(false);
    } else {
      audioSynthRef.current?.start();
      setIsAudioPlaying(true);
    }
  };

  // Load active room image into memory for Canvas 360 rendering
  useEffect(() => {
    if (!isOpen) return;
    setImageLoading(true);
    const img = new (window as any).Image();
    img.crossOrigin = "anonymous";
    img.src = activeRoom.img;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoading(false);
    };
    img.onerror = () => {
      setImageLoading(false);
    };
  }, [activeRoom, isOpen]);

  // Gyroscope / Device Orientation handler
  useEffect(() => {
    if (!gyroActive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        setYaw((e.alpha || 0) * 1.2);
        setPitch(Math.max(-45, Math.min(45, (e.beta || 0) - 45)));
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [gyroActive]);

  // Request Gyroscope Permission for iOS 13+
  const enableGyroscope = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === "function") {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === "granted") {
          setGyroActive(true);
          setIsAutoRotate(false);
        }
      } catch (err) {
        console.error("Device orientation permission error:", err);
      }
    } else {
      setGyroActive((prev) => !prev);
      if (!gyroActive) setIsAutoRotate(false);
    }
  };

  // Canvas 360 Cylindrical/Equirectangular Render Loop
  useEffect(() => {
    if (!isOpen) return;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = imageObjRef.current;

      if (canvas && ctx && img && img.complete) {
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Normalize yaw to 0 - 360
        const normYaw = ((yaw % 360) + 360) % 360;
        const srcX = (normYaw / 360) * img.width;
        const pitchOffset = (pitch / 90) * (height * 0.35);

        // Cylindrical wide slice projection
        const sliceWidth = (width / zoom) * 1.3;
        const sliceHeight = (height / zoom) * 1.3;

        // Draw primary slice & wrapping slice for seamless 360 loop
        ctx.save();
        ctx.drawImage(
          img,
          srcX,
          0,
          Math.min(img.width - srcX, img.width),
          img.height,
          0,
          pitchOffset - (sliceHeight - height) / 2,
          sliceWidth,
          sliceHeight
        );

        if (srcX + (img.width * sliceWidth) / width > img.width) {
          const wrapWidth = ((srcX + (img.width * sliceWidth) / width - img.width) / img.width) * width;
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            width - wrapWidth,
            pitchOffset - (sliceHeight - height) / 2,
            sliceWidth,
            sliceHeight
          );
        }
        ctx.restore();
      }

      // Auto-rotation when not dragging or gyro
      if (isAutoRotate && !isDraggingRef.current && !gyroActive) {
        setYaw((prev) => (prev + 0.12) % 360);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, yaw, pitch, zoom, isAutoRotate, gyroActive]);

  // Mouse & Touch Pan Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsAutoRotate(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setYaw((prev) => (prev - deltaX * 0.35) % 360);
    setPitch((prev) => Math.max(-45, Math.min(45, prev + deltaY * 0.25)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.8, Math.min(2.0, prev + (e.deltaY < 0 ? 0.1 : -0.1))));
  };

  // Convert 3D Hotspot yaw/pitch to 2D Screen Position
  const getHotspotScreenPos = (hYaw: number, hPitch: number) => {
    const normYaw = ((yaw % 360) + 360) % 360;
    let diffYaw = hYaw - normYaw;
    while (diffYaw < -180) diffYaw += 360;
    while (diffYaw > 180) diffYaw -= 360;

    // Field of view coverage is ~110 degrees
    const fov = 110 / zoom;
    if (Math.abs(diffYaw) > fov / 2) return null; // Outside viewport

    const xPercent = 50 + (diffYaw / (fov / 2)) * 50;
    const diffPitch = hPitch - pitch;
    const yPercent = 50 - (diffPitch / 45) * 40;

    return { x: `${xPercent}%`, y: `${yPercent}%` };
  };

  // Handle direct reservation click
  const handleDirectReservation = (areaKey?: string) => {
    const targetArea = areaKey || activeRoom.areaKey;
    onClose();
    audioSynthRef.current?.stop();
    router.push(`/reserve?area=${encodeURIComponent(targetArea)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      {/* ── LIVE JAZZ POPUP MODAL ── */}
      {jazzModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-950 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-white text-base">Live Jazz Stage Schedule</h4>
              </div>
              <button
                onClick={() => setJazzModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Parisian Saxophone Soirée</span>
                  <span className="font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">7:30 PM - 9:00 PM</span>
                </div>
                <p className="text-neutral-300 text-[11px]">Acoustic jazz quartet featuring Maestro Julian Laurent on Alto Sax.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Grand Piano &amp; Double Bass</span>
                  <span className="font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">9:30 PM - 11:30 PM</span>
                </div>
                <p className="text-neutral-300 text-[11px]">Late-night mellow cocktail melodies with guest vocal accompaniment.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setJazzModalOpen(false);
                  handleDirectReservation("Main Room");
                }}
                className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20"
              >
                Reserve Stage-Side Table
              </button>
              <button
                onClick={() => setJazzModalOpen(false)}
                className="px-4 py-3 rounded-2xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN 3D PANORAMA CONTAINER ── */}
      <div
        ref={containerRef}
        className={`w-full max-w-5xl rounded-3xl border border-amber-500/40 bg-neutral-950/98 p-4 sm:p-7 shadow-2xl relative flex flex-col transition-all duration-300 ${
          isFullscreen ? "fixed inset-0 max-w-none rounded-none z-50 p-4" : ""
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                360° Interactive 3D Ambience Tour
                <span className="text-[9px] uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-sans font-bold hidden sm:inline-block">
                  WebGL 3D Pan
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Drag to look around 360° · Click pulsing hotspots to inspect tables &amp; stages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition text-xs font-bold flex items-center gap-1.5 ${
                isAudioPlaying
                  ? "bg-amber-500/15 border-amber-500 text-amber-400"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
              title={isAudioPlaying ? "Mute Ambient Jazz" : "Play Ambient Jazz Sound"}
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4 animate-pulse text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{isAudioPlaying ? "Ambient Jazz: ON" : "Ambient Sound"}</span>
            </button>

            {/* Mobile Gyroscope Toggle */}
            <button
              onClick={enableGyroscope}
              className={`p-2 sm:px-3 sm:py-2 rounded-2xl border transition text-xs font-bold flex items-center gap-1.5 ${
                gyroActive
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
              title="Rotate device to look around"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden md:inline">{gyroActive ? "Gyro Active" : "Gyroscope"}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                audioSynthRef.current?.stop();
                onClose();
              }}
              className="p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500/40 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4">
          {ROOMS_360.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setActiveRoom(room);
                setYaw(0);
                setPitch(0);
                setSelectedHotspot(null);
              }}
              className={`p-2.5 sm:p-3 rounded-2xl text-left border text-xs font-bold transition flex flex-col justify-between ${
                activeRoom.id === room.id
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                  : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
              }`}
            >
              <span className="font-serif font-bold text-xs sm:text-sm text-white mb-0.5">{room.name}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">{room.badge}</span>
            </button>
          ))}
        </div>

        {/* ── 3D CANVAS VIEWPORT & HOTSPOTS OVERLAY ── */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-[320px] sm:h-[420px] rounded-3xl border border-amber-500/30 relative overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none bg-neutral-950"
        >
          {/* WebGL / Canvas Output */}
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            className="w-full h-full object-cover"
          />

          {/* Loading Spinner & Fade Transition Overlay */}
          {imageLoading && (
            <div className="absolute inset-0 z-30 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center space-y-3 transition-opacity duration-300">
              <div className="w-10 h-10 border-3 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-xs font-bold text-amber-300 font-serif tracking-widest uppercase">
                Loading 360° Ambience...
              </span>
            </div>
          )}

          {/* Compass & Angle HUD Indicator */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 border border-neutral-800 rounded-full px-3 py-1.5 backdrop-blur-md text-[10px] font-mono text-neutral-300">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Heading: {Math.round(((yaw % 360) + 360) % 360)}°</span>
          </div>

          {/* Auto-Rotate / Reset Overlay Controls */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md transition ${
                isAutoRotate
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-black/60 border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              {isAutoRotate ? "Auto-Pan: ON" : "Auto-Pan: OFF"}
            </button>
            <button
              onClick={() => {
                setYaw(0);
                setPitch(0);
                setZoom(1);
              }}
              title="Reset View"
              className="p-1.5 rounded-full bg-black/60 border border-neutral-800 text-neutral-400 hover:text-white backdrop-blur-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── PROJECTED 3D HOTSPOTS ── */}
          {activeRoom.hotspots.map((h) => {
            const pos = getHotspotScreenPos(h.yaw, h.pitch);
            if (!pos) return null;

            return (
              <div
                key={h.id}
                style={{ left: pos.x, top: pos.y }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (h.type === "jazz") {
                      setJazzModalOpen(true);
                    } else {
                      setSelectedHotspot(selectedHotspot?.id === h.id ? null : h);
                    }
                  }}
                  className="group relative flex items-center justify-center"
                >
                  <span className="w-10 h-10 rounded-full bg-amber-500/30 border border-amber-400/80 animate-ping absolute" />
                  <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-bold flex items-center justify-center shadow-lg shadow-amber-500/40 relative z-10 hover:scale-110 transition-transform">
                    <h.icon className="w-4 h-4" />
                  </span>

                  {/* Hotspot Floating Tooltip */}
                  <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-950/95 border border-amber-500/50 text-white text-[10px] font-bold rounded-xl whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    {h.title}
                  </span>
                </button>
              </div>
            );
          })}

          {/* ── ACTIVE HOTSPOT DETAIL MODAL / POPUP ── */}
          {selectedHotspot && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-30 bg-neutral-950/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-scale-up space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    <selectedHotspot.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-white text-xs">{selectedHotspot.title}</h5>
                    <p className="text-[10px] text-amber-400/80 uppercase font-mono">{activeRoom.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="text-neutral-500 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                {selectedHotspot.subtitle}
              </p>

              <button
                onClick={() => handleDirectReservation(activeRoom.areaKey)}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-amber-500/20"
              >
                {selectedHotspot.actionText} →
              </button>
            </div>
          )}

          {/* Bottom Info Bar Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pointer-events-none z-10">
            <div className="space-y-1 max-w-md">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                <Eye className="w-3 h-3 text-amber-400" />
                360° Ambience · {activeRoom.vibe}
              </div>
              <h4 className="text-xl sm:text-2xl font-serif font-bold text-white">{activeRoom.name}</h4>
              <p className="text-xs text-neutral-300 font-light leading-relaxed line-clamp-1">{activeRoom.desc}</p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-medium text-amber-300/90 shrink-0">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-400" /> {activeRoom.capacity}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Ground &amp; Skylight</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS & DIRECT AREA RESERVATION ── */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleDirectReservation(activeRoom.areaKey)}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2"
          >
            <span>BOOK TABLE IN {activeRoom.name.toUpperCase()}</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynthRef.current?.stop();
              onClose();
            }}
            className="px-6 py-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider transition"
          >
            Close Tour
          </button>
        </div>
      </div>
    </div>
  );
}
