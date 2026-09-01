"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Volume2,
  ChevronDown
} from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface Message {
  _id?: string;
  sessionId?: string;
  sender: "customer" | "admin";
  text: string;
  createdAt?: string;
  timestamp?: string;
}

// ── Web Audio API Chime Synthesizer (Zero asset dependency) ──
function playConciergeChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // 2-tone melodic chime: C6 (1046.5Hz) -> E6 (1318.5Hz)
    osc1.frequency.setValueAtTime(1046.5, now);
    osc1.frequency.setValueAtTime(1318.5, now + 0.12);

    osc2.frequency.setValueAtTime(523.25, now);
    osc2.frequency.setValueAtTime(659.25, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore autoplay restrictions
  }
}

export default function ChatWidget() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotification, setActiveNotification] = useState<{ text: string; sender: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      setActiveNotification(null);
    }
  }, [isOpen]);

  // Request browser notifications if user allows
  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  };

  // 1. Persistent Session ID from localStorage
  useEffect(() => {
    let id = localStorage.getItem("concierge_session_id") || localStorage.getItem("chatSessionId");
    if (!id) {
      id = "sess_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("concierge_session_id", id);
    }
    setSessionId(id);

    const savedName = localStorage.getItem("concierge_customer_name") || localStorage.getItem("chatCustomerName");
    if (savedName) {
      setCustomerName(savedName);
      setIsNameSet(true);
    }
  }, []);

  // 2. Fetch Chat History from /api/chat/history?sessionId=xyz
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/history?sessionId=${sessionId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMessages((prev) => {
            // Check if there are new admin messages
            if (prev.length > 0 && data.data.length > prev.length) {
              const latestMsg = data.data[data.data.length - 1];
              if (latestMsg.sender === "admin" && !isOpenRef.current) {
                playConciergeChime();
                setUnreadCount((c) => c + (data.data.length - prev.length));
                setActiveNotification({ text: latestMsg.text, sender: "Concierge" });
              }
            }
            return data.data;
          });
        }
      }
    } catch {
      // Silently ignore temporary network/offline glitches during polling
    }
  }, [sessionId]);

  // 3. Persistent WebSocket & Polling connection (even when minimized)
  useEffect(() => {
    if (!sessionId || isAdmin) return;

    fetchHistory();

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWs = () => {
      try {
        const wsUrl = API_BASE_URL.replace(/^http/, "ws");
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          socket?.send(
            JSON.stringify({
              event: "join_support",
              data: { sessionId, customerName: customerName || "Guest Patron" },
            })
          );
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.event === "support_message") {
              const msg: Message = parsed.data;

              // Incoming message notification handling
              if (msg.sender === "admin") {
                playConciergeChime();

                if (!isOpenRef.current) {
                  setUnreadCount((prev) => prev + 1);
                  setActiveNotification({ text: msg.text, sender: "VELORA Concierge" });

                  // Browser native push notification if permitted
                  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                    try {
                      new Notification("VELORA Concierge", {
                        body: msg.text,
                        icon: "/favicon.ico",
                      });
                    } catch {}
                  }
                }
              }

              setMessages((prev) => {
                const isDuplicate = prev.some(
                  (m) => m.text === msg.text && (m.createdAt === msg.createdAt || m._id === msg._id)
                );
                if (isDuplicate) return prev;
                return [...prev, msg];
              });
            } else if (parsed.event === "chat_closed") {
              setMessages((prev) => [
                ...prev,
                {
                  sender: "admin",
                  text: "This chat session has been closed by our concierge. Feel free to message us anytime!",
                  createdAt: new Date().toISOString(),
                },
              ]);
            }
          } catch (err) {
            console.error("WS parse error", err);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 4000);
        };
      } catch {
        // Handled by polling
      }
    };

    connectWs();
    const intervalId = setInterval(fetchHistory, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(reconnectTimeout);
      socket?.close();
    };
  }, [sessionId, isAdmin, customerName, fetchHistory]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (isAdmin) {
    return null;
  }

  // Handle Save Name
  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setIsNameSet(true);
    localStorage.setItem("concierge_customer_name", customerName.trim());
    requestNotificationPermission();

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "join_support",
          data: { sessionId, customerName: customerName.trim() },
        })
      );
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const tempMsg: Message = {
      sessionId,
      sender: "customer",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "customer",
          text: textToSend,
          customerName: customerName || "Guest Patron",
        }),
      });

      if (!res.ok) {
        console.error("Error sending message via API");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* ── FLOATING LIVE NOTIFICATION TOAST (When Chat is Closed) ── */}
      {activeNotification && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setActiveNotification(null);
          }}
          className="fixed bottom-24 right-4 sm:right-6 z-50 max-w-sm w-[90vw] sm:w-80 bg-neutral-950 border border-amber-500/50 rounded-2xl p-4 shadow-2xl cursor-pointer hover:border-amber-400 transition animate-bounce backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 tracking-wide uppercase">
                  {activeNotification.sender}
                </span>
                <span className="text-[10px] text-neutral-400">Just now</span>
              </div>
              <p className="text-xs text-neutral-200 mt-1 line-clamp-2 leading-relaxed">
                {activeNotification.text}
              </p>
              <span className="text-[10px] text-amber-400 font-semibold mt-2 inline-block hover:underline">
                Tap to reply →
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveNotification(null);
              }}
              className="text-neutral-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN FLOATING CHAT BUTTON ── */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
              setActiveNotification(null);
              requestNotificationPermission();
            }}
            aria-label="Open Live Concierge Chat"
            className="relative group p-4 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-black shadow-[0_8px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6 stroke-[2.2]" />

            {/* Unread notification pulse badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-red-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-neutral-950 animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
              Live Concierge &amp; Help
            </span>
          </button>
        )}
      </div>

      {/* ── CHAT WINDOW MODAL / POPUP ── */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] rounded-3xl bg-neutral-950/95 border border-amber-500/30 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-neutral-950 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                  VELORA Concierge
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  ● Live Support Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-amber-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          {!isNameSet ? (
            <div className="flex-1 p-6 flex flex-col justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-base font-bold text-white">Welcome to Live Support</h4>
                <p className="text-xs text-neutral-400">
                  Please share your name to start talking with our reservation &amp; dining team.
                </p>
              </div>
              <form onSubmit={handleSetName} className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Your Name (e.g. Rahul Mehta)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition text-center"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-amber-500/20"
                >
                  Start Live Chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                {/* Welcome Message */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    VC
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-neutral-900 border border-neutral-800 p-3 text-xs text-neutral-200 space-y-1">
                    <p className="font-semibold text-amber-400 text-[10px]">VELORA Concierge</p>
                    <p>
                      Hello {customerName || "there"}! How may we assist your dining or reservation experience today?
                    </p>
                  </div>
                </div>

                {messages.map((m, idx) => {
                  const isMe = m.sender === "customer";
                  return (
                    <div
                      key={idx}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                          VC
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isMe
                            ? "bg-amber-500 text-black rounded-br-sm font-medium shadow-md shadow-amber-500/10"
                            : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm"
                        }`}
                      >
                        <p>{m.text}</p>
                        {m.createdAt && (
                          <span
                            className={`text-[9px] block mt-1 text-right ${
                              isMe ? "text-black/60" : "text-neutral-500"
                            }`}
                          >
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 transition shadow-md shadow-amber-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
