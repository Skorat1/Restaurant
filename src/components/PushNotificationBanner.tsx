"use client";

import React, { useState, useEffect } from "react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";

interface PushNotificationBannerProps {
  role?: "customer" | "admin";
  className?: string;
}

export default function PushNotificationBanner({
  role = "customer",
  className = "",
}: PushNotificationBannerProps) {
  const {
    isSupported,
    permission,
    loading,
    error,
    lastNotification,
    clearLastNotification,
    enablePushNotifications,
  } = usePushNotifications();

  const [dismissed, setDismissed] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("push_banner_dismissed");
    if (isDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("push_banner_dismissed", "true");
  };

  const handleEnable = async () => {
    const token = await enablePushNotifications(role);
    if (token) {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setDismissed(true);
      }, 3000);
    }
  };

  // Foreground notification toast popup
  if (lastNotification) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-neutral-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-lg flex items-start gap-3 animate-in slide-in-from-bottom-5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {lastNotification.title || "VELORA Notification"}
          </h4>
          <p className="text-xs text-neutral-300 mt-0.5 line-clamp-2">
            {lastNotification.body}
          </p>
        </div>
        <button
          onClick={clearLastNotification}
          className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // If already granted, dismissed, or unsupported, hide banner
  if (!isSupported || permission === "granted" || dismissed) {
    return null;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 p-4 sm:p-5 shadow-lg ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Enable Push Notifications
              {successMsg && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-normal">
                  <CheckCircle className="w-3.5 h-3.5" /> Enabled!
                </span>
              )}
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              {role === "admin"
                ? "Get instant alerts for new live orders, status updates, and customer chat messages."
                : "Get live real-time updates on your food preparation and table status."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            Not now
          </button>
          <button
            onClick={handleEnable}
            disabled={loading || successMsg}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? "Enabling..." : successMsg ? "Subscribed!" : "Enable Notifications"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}
    </div>
  );
}
