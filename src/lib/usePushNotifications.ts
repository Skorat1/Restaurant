"use client";

import { useEffect, useState, useCallback } from "react";
import { requestFcmToken, onForegroundMessage } from "./firebase";
import API_BASE_URL from "./api";

export interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "unsupported",
    token: null,
    loading: false,
    error: null,
  });

  const [lastNotification, setLastNotification] = useState<{
    title?: string;
    body?: string;
    icon?: string;
    data?: Record<string, unknown>;
  } | null>(null);

  // Check support and current permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      const currentPermission = Notification.permission;
      setState((prev) => ({
        ...prev,
        isSupported: true,
        permission: currentPermission,
      }));

      // Register service worker if not already registered
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("[PushNotifications] Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
          console.warn("[PushNotifications] Service Worker registration failed:", err);
        });

      // Auto-sync token if permission is already granted
      if (currentPermission === "granted") {
        requestFcmToken()
          .then(async (token) => {
            if (token) {
              setState((prev) => ({ ...prev, token, permission: "granted" }));
              const authToken = localStorage.getItem("token") || localStorage.getItem("velora_token");
              const headers: Record<string, string> = { "Content-Type": "application/json" };
              if (authToken) {
                headers["Authorization"] = `Bearer ${authToken}`;
              }

              await fetch(`${API_BASE_URL}/api/notifications/fcm-token`, {
                method: "POST",
                headers,
                body: JSON.stringify({ token, role: "admin" }),
              }).catch((e) => console.warn("[PushNotifications] Failed to auto-sync token:", e));
            }
          })
          .catch((e) => console.warn("[PushNotifications] Auto-sync error:", e));
      }
    }
  }, []);

  // Listen to foreground FCM messages
  useEffect(() => {
    if (!state.isSupported) return;

    const unsubscribe = onForegroundMessage((payload: unknown) => {
      const msg = payload as {
        notification?: { title?: string; body?: string; icon?: string };
        data?: Record<string, unknown>;
      };
      console.log("[PushNotifications] Received foreground message:", msg);
      
      setLastNotification({
        title: msg.notification?.title || "New Notification",
        body: msg.notification?.body || "You have a new update",
        icon: msg.notification?.icon,
        data: msg.data,
      });

      // Also trigger a browser native notification if permitted
      if (Notification.permission === "granted" && msg.notification) {
        new Notification(msg.notification.title || "VELORA", {
          body: msg.notification.body,
          icon: msg.notification.icon || "/icons/icon-192x192.png",
        });
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [state.isSupported]);

  // Request push permission and save token to backend
  const enablePushNotifications = useCallback(
    async (role: "customer" | "admin" = "customer"): Promise<string | null> => {
      if (!state.isSupported) {
        setState((prev) => ({ ...prev, error: "Push notifications are not supported in this browser" }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const token = await requestFcmToken();
        const updatedPermission = Notification.permission;

        if (token) {
          setState((prev) => ({
            ...prev,
            permission: updatedPermission,
            token,
            loading: false,
          }));

          // Send token to server
          const authToken = localStorage.getItem("token") || localStorage.getItem("velora_token");
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
          }

          await fetch(`${API_BASE_URL}/api/notifications/fcm-token`, {
            method: "POST",
            headers,
            body: JSON.stringify({ token, role }),
          }).catch((e) => console.warn("[PushNotifications] Failed to sync token to server:", e));

          return token;
        } else {
          setState((prev) => ({
            ...prev,
            permission: updatedPermission,
            loading: false,
            error: updatedPermission === "denied" ? "Notification permission denied" : "Failed to obtain push token",
          }));
          return null;
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Error enabling push notifications";
        setState((prev) => ({ ...prev, loading: false, error: errMsg }));
        return null;
      }
    },
    [state.isSupported]
  );

  return {
    ...state,
    lastNotification,
    clearLastNotification: () => setLastNotification(null),
    enablePushNotifications,
  };
}
