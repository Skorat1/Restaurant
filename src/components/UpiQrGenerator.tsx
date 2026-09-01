"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Download, Smartphone, Sparkles, ShieldCheck } from "lucide-react";

export interface UpiQrGeneratorProps {
  upiId?: string;
  payeeName?: string;
  amount?: number;
  transactionNote?: string;
  initialUrl?: string;
  className?: string;
}

export default function UpiQrGenerator({
  upiId = "velora@ybl",
  payeeName = "VELORA Haute Cuisine",
  amount,
  transactionNote = "Velora Dining",
  initialUrl,
  className = "",
}: UpiQrGeneratorProps) {
  // Generate standard UPI Payment payload
  const defaultUpiUri = amount && amount > 0
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    : `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  const [payloadText, setPayloadText] = useState(initialUrl || defaultUpiUri);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setPayloadText(initialUrl);
    } else {
      setPayloadText(defaultUpiUri);
    }
  }, [initialUrl, defaultUpiUri]);

  // Standard crisp Black & White QR Code with High Error Correction (level H) so the center logo doesn't disrupt scanning
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
    payloadText
  )}&color=0-0-0&bgcolor=255-255-255&qzone=2&ecc=H&format=png`;

  // Copy UPI Link
  const handleCopy = () => {
    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download high-resolution Black & White QR Code with Website Logo
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
      // White Canvas Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);

      // Draw Black & White QR Code
      ctx.drawImage(qrImg, 30, 30, 540, 540);

      // Draw Center Website Logo Medallion
      const centerX = 300;
      const centerY = 300;
      const badgeRadius = 46;

      ctx.save();
      // Outer shadow
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 3;

      // White protective boundary so QR modules don't touch logo
      ctx.beginPath();
      ctx.arc(centerX, centerY, badgeRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Obsidian Brand Circle Base
      ctx.beginPath();
      ctx.arc(centerX, centerY, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();

      // Gold Double Ring Border
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#f59e0b";
      ctx.stroke();

      // Inner Gold Accent Ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, badgeRadius - 5, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(254,240,138,0.5)";
      ctx.stroke();

      // Golden Brand Initial "V"
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 44px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("V", centerX, centerY + 2);
      ctx.restore();

      // Trigger Download
      const link = document.createElement("a");
      link.download = `VELORA-Payment-QR-${amount ? `${amount}INR` : "Scan"}.png`;
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
      
      {/* ── 1. Top UPI URI / Payload Bar ── */}
      <div className="w-full max-w-xs mb-4">
        <div className="relative flex items-center bg-neutral-950 text-white rounded-2xl border border-neutral-800 px-3.5 py-2.5 shadow-lg group">
          <input
            type="text"
            readOnly
            value={payloadText}
            className="w-full text-xs font-mono text-neutral-300 bg-transparent outline-none truncate pr-8 cursor-text"
            title={payloadText}
          />
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-2 p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition active:scale-90"
            title="Copy UPI Payment Link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {copied && (
          <p className="text-[10px] text-emerald-400 font-bold text-center mt-1 animate-fade-in">
            ✓ Copied payment URI to clipboard!
          </p>
        )}
      </div>

      {/* ── 2. Standard Crisp Black & White QR Code with Website Logo in Center ── */}
      <div className="relative p-3.5 sm:p-4 rounded-3xl bg-white shadow-2xl border-4 border-neutral-100 flex items-center justify-center transition-transform hover:scale-[1.01]">
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center overflow-hidden">
          
          {/* Black & White High-Contrast QR Code */}
          <img
            src={qrCodeApiUrl}
            alt="UPI Payment QR Code"
            className="w-full h-full object-contain"
          />

          {/* ── Center Website Logo Emblem (VELORA Gold Medallion) ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* White Protective Padding Ring */}
            <div className="p-1 rounded-full bg-white shadow-xl">
              {/* Obsidian & Gold Brand Medallion */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-neutral-950 via-neutral-900 to-black border-2 border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                {/* Brand Monogram & Crown Sparkle */}
                <div className="flex flex-col items-center justify-center leading-none">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 mb-0.5" />
                  <span className="font-serif font-black text-lg sm:text-xl text-amber-400 tracking-tight">
                    V
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. Scan Help & UPI Verification Badge ── */}
      <div className="mt-3.5 text-center space-y-1">
        <p className="text-xs text-neutral-300 font-semibold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Scan with Google Pay, PhonePe, Paytm, BHIM</span>
        </p>
        <p className="text-[11px] font-mono text-neutral-400">
          UPI ID: <span className="text-amber-400 font-bold">{upiId}</span>
        </p>
      </div>

      {/* ── 4. Action Buttons (Pay Direct / Save QR) ── */}
      <div className="w-full max-w-xs flex items-center justify-center gap-2.5 mt-4">
        {amount && amount > 0 && (
          <a
            href={defaultUpiUri}
            className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Open UPI App</span>
          </a>
        )}

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-neutral-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{downloading ? "Saving…" : "Save QR"}</span>
        </button>
      </div>

    </div>
  );
}
