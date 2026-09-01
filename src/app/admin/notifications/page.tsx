"use client";

import React, { useState } from "react";
import { usePushNotifications } from "@/lib/usePushNotifications";
import API_BASE_URL from "@/lib/api";
import { Bell, Send, CheckCircle2, AlertTriangle, Smartphone, Radio, Users, Sparkles } from "lucide-react";

export default function AdminPushNotificationsPage() {
  const { isSupported, permission, token, loading, enablePushNotifications } = usePushNotifications();
  
  const [targetType, setTargetType] = useState<"topic" | "token">("topic");
  const [selectedTopic, setSelectedTopic] = useState<string>("admin_orders");
  const [customToken, setCustomToken] = useState<string>("");
  const [title, setTitle] = useState<string>("Chef Special Announcement 🍷");
  const [body, setBody] = useState<string>("Tonight only: complimentary Grand Cru pairing with our 7-course seasonal tasting menu.");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleEnableCurrentDevice = async () => {
    await enablePushNotifications("admin");
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const payload: Record<string, string> = {
        title,
        body,
      };

      if (targetType === "topic") {
        payload.topic = selectedTopic;
      } else {
        payload.token = customToken || token || "";
      }

      const res = await fetch(`${API_BASE_URL}/api/notifications/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSendResult({
          success: true,
          msg: `Notification sent successfully! (ID: ${data.result?.messageId || "Sent"})`,
        });
      } else {
        setSendResult({
          success: false,
          msg: data.message || data.error || "Failed to deliver push notification",
        });
      }
    } catch (err: unknown) {
      setSendResult({
        success: false,
        msg: err instanceof Error ? err.message : "Error sending notification",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Bell className="w-6 h-6" />
          </div>
          Push Notification Center
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Broadcast real-time push notifications to customers, kitchen stations, and service staff via Firebase Cloud Messaging (FCM).
        </p>
      </div>

      {/* Device Status Card */}
      <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/70 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            permission === "granted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">Your Device Notification Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                permission === "granted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {permission}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              {permission === "granted"
                ? "This browser is subscribed to real-time order alerts & live chat updates."
                : "Enable notifications on this browser to receive live popups for new incoming orders."}
            </p>
          </div>
        </div>

        {permission !== "granted" && (
          <button
            onClick={handleEnableCurrentDevice}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow transition shrink-0"
          >
            {loading ? "Registering..." : "Enable Push on This Device"}
          </button>
        )}
      </div>

      {/* Broadcast / Push Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-xl space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" /> Dispatch Notification
          </h2>

          <form onSubmit={handleSendNotification} className="space-y-4">
            {/* Target Selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">Target Audience</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("topic")}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    targetType === "topic"
                      ? "border-amber-500 bg-amber-500/10 text-white"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold">Topic Channel</p>
                    <p className="text-[10px] text-neutral-400">Broadcast to grouped staff or customers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType("token")}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                    targetType === "token"
                      ? "border-amber-500 bg-amber-500/10 text-white"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold">Specific Device Token</p>
                    <p className="text-[10px] text-neutral-400">Send direct alert to one device</p>
                  </div>
                </button>
              </div>
            </div>

            {targetType === "topic" ? (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Select Topic Channel</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="admin_orders">admin_orders (All kitchen, managers & waiters)</option>
                  <option value="admin_chat">admin_chat (Support desk & floor staff)</option>
                  <option value="customers_promotions">customers_promotions (Promotional offers)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">FCM Device Registration Token</label>
                <input
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder={token ? `Current device: ${token.slice(0, 20)}...` : "Paste FCM device token..."}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Seasonal Dish Available"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Message Body</label>
              <textarea
                required
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message content..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Result Feedback */}
            {sendResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  sendResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                }`}
              >
                {sendResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {sendResult.msg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? "Sending via Firebase FCM..." : "Dispatch Push Notification"}
            </button>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-amber-400" /> Live Preview
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              How the push notification banner appears on recipient smartphones and browser notification bars.
            </p>

            {/* Mock Push Notification */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-bold font-serif text-sm shrink-0">
                  V
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">VELORA</span>
                    <span className="text-[10px] text-neutral-500">now</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-0.5 truncate">{title || "Notification Title"}</h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5 line-clamp-2 leading-relaxed">
                    {body || "Notification body text..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-neutral-400 space-y-2">
            <p className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Automated FCM Triggers
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>New customer orders notify kitchen & floor staff.</li>
              <li>Order status transitions (Confirmed, Preparing, Ready) notify customers.</li>
              <li>Live customer support messages alert the staff desk.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
