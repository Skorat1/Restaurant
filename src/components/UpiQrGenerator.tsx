"use client";

import { useState, useEffect, useRef, useId } from "react";
import {
  Copy, Check, Download, ExternalLink, Sparkles,
  Smartphone, RefreshCw, QrCode as QrIcon, ShieldCheck
} from "lucide-react";

export interface UpiQrGeneratorProps {
  upiId?: string;
  payeeName?: string;
  amount?: number;
  transactionNote?: string;
  initialUrl?: string;
  className?: string;
  compact?: boolean;
}

// ── Color Theme Options (Matches Screenshot Palette) ─────────────────────────
export const QR_COLOR_PALETTES = [
  { id: "black", name: "Deep Onyx", hex: "#0a0a0a", rgb: "10-10-10", bg: "#ffffff" },
  { id: "slate", name: "Denim Slate", hex: "#637b99", rgb: "99-123-153", bg: "#f8fafc" },
  { id: "sand", name: "Warm Terracotta", hex: "#c89674", rgb: "200-150-116", bg: "#fffaf5" },
  { id: "rose", name: "Champagne Rose", hex: "#d67568", rgb: "214-117-104", bg: "#fff5f5" },
  { id: "sage", name: "Sage Emerald", hex: "#7a9a83", rgb: "122-154-131", bg: "#f4f9f5" },
  { id: "gold", name: "Haute Amber Gold", hex: "#b45309", rgb: "180-83-9", bg: "#fffbeb" },
];

// ── Center Logo Options ──────────────────────────────────────────────────────
export const CENTER_LOGOS = [
  { id: "upi", name: "UPI", label: "UPI Official", bg: "#ffffff", border: "#16a34a" },
  { id: "velora", name: "VELORA", label: "Velora Gold", bg: "#0a0a0a", border: "#f59e0b" },
  { id: "gpay", name: "GPay", label: "Google Pay", bg: "#ffffff", border: "#4285f4" },
  { id: "phonepe", name: "PhonePe", label: "PhonePe", bg: "#5f259f", border: "#5f259f" },
  { id: "paytm", name: "Paytm", label: "Paytm", bg: "#00b9f1", border: "#00b9f1" },
];

export default function UpiQrGenerator({
  upiId = "velora@ybl",
  payeeName = "VELORA Haute Cuisine",
  amount,
  transactionNote = "Velora Dining",
  initialUrl,
  className = "",
  compact = false,
}: UpiQrGeneratorProps) {
  // Compute standard UPI payload
  const defaultUpiUri = amount && amount > 0
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    : `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  const [payloadText, setPayloadText] = useState(initialUrl || defaultUpiUri);
  const [selectedColor, setSelectedColor] = useState<string>("black");
  const [selectedStyle, setSelectedStyle] = useState<"squares" | "dots">("squares");
  const [selectedLogo, setSelectedLogo] = useState<string>("upi");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeColor = QR_COLOR_PALETTES.find((c) => c.id === selectedColor) || QR_COLOR_PALETTES[0];

  useEffect(() => {
    if (initialUrl) {
      setPayloadText(initialUrl);
    } else {
      setPayloadText(defaultUpiUri);
    }
  }, [initialUrl, defaultUpiUri]);

  // Construct QR code image endpoint
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    payloadText
  )}&color=${activeColor.rgb}&bgcolor=255-255-255&qzone=2&format=png`;

  // Copy URI to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution QR with embedded center logo
  const handleDownload = () => {
    setDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloading(false);
      return;
    }

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);

      // Draw QR Code
      ctx.drawImage(qrImg, 30, 30, 540, 540);

      // Draw Center Badge
      const centerX = 300;
      const centerY = 300;
      const badgeSize = 100;
      const radius = 24;

      ctx.save();
      // Badge background shadow
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // Badge rounded box
      ctx.fillStyle = selectedLogo === "velora" ? "#0a0a0a" : selectedLogo === "phonepe" ? "#5f259f" : selectedLogo === "paytm" ? "#002e6e" : "#ffffff";
      ctx.beginPath();
      ctx.roundRect(centerX - badgeSize / 2, centerY - badgeSize / 2, badgeSize, badgeSize, radius);
      ctx.fill();

      // Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = selectedLogo === "velora" ? "#f59e0b" : "#e2e8f0";
      ctx.stroke();
      ctx.restore();

      // Badge Text / Icon Logo
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (selectedLogo === "velora") {
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 42px Georgia, serif";
        ctx.fillText("V", centerX, centerY);
      } else if (selectedLogo === "upi") {
        ctx.fillStyle = "#0f766e";
        ctx.font = "900 24px sans-serif";
        ctx.fillText("UPI", centerX, centerY);
      } else if (selectedLogo === "gpay") {
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("GPay", centerX, centerY);
      } else if (selectedLogo === "phonepe") {
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 22px sans-serif";
        ctx.fillText("पे", centerX, centerY);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Paytm", centerX, centerY);
      }

      // Trigger download
      const link = document.createElement("a");
      link.download = `VELORA-UPI-QR-${amount ? `${amount}INR` : "Payment"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setDownloading(false);
    };
    qrImg.onerror = () => {
      setDownloading(false);
    };
    qrImg.src = qrCodeApiUrl;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      
      {/* ── 1. Top Editable URL / UPI URI Pill Bar (From Screenshot) ── */}
      <div className="w-full max-w-sm mb-5 group">
        <div className="relative flex items-center bg-white text-neutral-900 rounded-2xl border-2 border-neutral-900/80 px-4 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.25)]">
          <input
            type="text"
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full text-xs font-mono font-medium text-neutral-800 bg-transparent outline-none truncate pr-8"
            placeholder="https://... or upi://pay?pa=..."
            title="Edit or inspect QR code payload"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2.5 p-1.5 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition active:scale-90"
            title="Copy URL / UPI Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {copied && (
          <p className="text-[10px] text-emerald-400 font-bold text-center mt-1 animate-fade-in">
            ✓ Copied payment URI to clipboard!
          </p>
        )}
      </div>

      {/* ── 2. Center QR Code + Right Side Color Palette (Screenshot Layout) ── */}
      <div className="flex items-center justify-center gap-5 sm:gap-6 my-2">
        
        {/* Main QR Code Canvas Box with Center Icon Overlay */}
        <div className="relative p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border border-neutral-200/80 flex items-center justify-center transition-transform hover:scale-[1.01]">
          <div
            className={`relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center overflow-hidden transition-all duration-300 ${
              selectedStyle === "dots" ? "rounded-2xl" : "rounded-lg"
            }`}
          >
            {/* Live QR Image */}
            <img
              src={qrCodeApiUrl}
              alt="UPI Payment QR Code"
              className={`w-full h-full object-contain ${
                selectedStyle === "dots" ? "scale-[0.98] blur-[0.3px]" : ""
              }`}
            />

            {/* ── Center Icon Overlay ── */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-xl flex items-center justify-center border-2 transition-all duration-300 transform scale-100 ${
                  selectedLogo === "velora"
                    ? "bg-neutral-950 border-amber-400 text-amber-400 shadow-amber-500/20"
                    : selectedLogo === "phonepe"
                    ? "bg-purple-800 border-white text-white"
                    : selectedLogo === "paytm"
                    ? "bg-[#002e6e] border-sky-400 text-white"
                    : selectedLogo === "gpay"
                    ? "bg-white border-blue-500 text-neutral-900 shadow-blue-500/10"
                    : "bg-white border-emerald-500 text-emerald-700 shadow-emerald-500/10"
                }`}
              >
                {selectedLogo === "velora" && (
                  <span className="font-serif font-black text-xl tracking-tighter text-amber-400">
                    V
                  </span>
                )}
                {selectedLogo === "upi" && (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <span className="text-[10px] font-black tracking-tight text-emerald-700">UPI</span>
                    <span className="text-[6px] font-extrabold text-neutral-400 tracking-tighter">PAY</span>
                  </div>
                )}
                {selectedLogo === "gpay" && (
                  <span className="text-[10px] font-black text-neutral-800 tracking-tight">GPay</span>
                )}
                {selectedLogo === "phonepe" && (
                  <span className="text-sm font-black text-white">पे</span>
                )}
                {selectedLogo === "paytm" && (
                  <span className="text-[9px] font-black text-sky-400 tracking-tighter">Paytm</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Vertical Color Palette Dots (From Screenshot) ── */}
        <div className="flex flex-col items-center gap-3">
          {QR_COLOR_PALETTES.map((palette) => {
            const isSelected = selectedColor === palette.id;
            return (
              <button
                key={palette.id}
                type="button"
                onClick={() => setSelectedColor(palette.id)}
                className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center relative ${
                  isSelected
                    ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-110 shadow-lg"
                    : "hover:scale-105 opacity-80 hover:opacity-100"
                }`}
                style={{ backgroundColor: palette.hex }}
                title={palette.name}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* ── 3. Bottom Controls (Style Toggles + Create QR Code Button) ── */}
      <div className="w-full max-w-sm flex items-center justify-between gap-4 mt-4">
        
        {/* Style Toggles: Square Blocks vs Rounded Dots (From Screenshot) */}
        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setSelectedStyle("squares")}
            className={`p-2 rounded-xl transition ${
              selectedStyle === "squares"
                ? "bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700"
                : "text-neutral-500 hover:text-white"
            }`}
            title="Classic Square QR Grid"
          >
            {/* 3x3 Squares Icon */}
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-current rounded-[1px]" />
              ))}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStyle("dots")}
            className={`p-2 rounded-xl transition ${
              selectedStyle === "dots"
                ? "bg-neutral-800 text-amber-400 shadow-sm border border-neutral-700"
                : "text-neutral-500 hover:text-white"
            }`}
            title="Rounded Dots QR Grid"
          >
            {/* 3x3 Rounded Dots Icon */}
            <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-current rounded-full" />
              ))}
            </div>
          </button>
        </div>

        {/* Center Logo Selector Trigger Badges */}
        <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-2xl">
          {CENTER_LOGOS.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => setSelectedLogo(logo.id)}
              className={`px-2 py-1 rounded-xl text-[10px] font-bold transition ${
                selectedLogo === logo.id
                  ? "bg-amber-500 text-black font-extrabold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {logo.name}
            </button>
          ))}
        </div>

        {/* Main "Create / Download QR code" Black Pill Button (From Screenshot) */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-3 px-4 rounded-full bg-black hover:bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white text-xs font-bold transition shadow-xl flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{downloading ? "Saving…" : "Create QR code"}</span>
        </button>

      </div>

      {/* ── 4. Instant App Deep-Links ── */}
      {amount && amount > 0 && (
        <div className="w-full max-w-sm mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
          <span className="text-[10px] text-neutral-400 font-medium">Pay directly via:</span>
          <div className="flex items-center gap-2">
            <a
              href={defaultUpiUri}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-bold text-amber-400 flex items-center gap-1 transition"
            >
              <Smartphone className="w-3 h-3" />
              <span>UPI App</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
