"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  RefreshCw,
  User,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  CheckCheck
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Message {
  _id?: string;
  sessionId: string;
  sender: "customer" | "admin";
  text: string;
  createdAt: string;
}

interface ChatSession {
  _id: string;
  sessionId: string;
  customerName: string;
  status: "active" | "closed";
  lastMessage: string;
  updatedAt: string;
}

// ── Web Audio API Chime Synthesizer ──
function playAdminChime() {
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

    // 2-tone alert chime (E6 -> G6)
    osc1.frequency.setValueAtTime(1318.5, now);
    osc1.frequency.setValueAtTime(1567.98, now + 0.12);

    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.setValueAtTime(783.99, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio restrictions
  }
}

export default function AdminChatPage() {
  const { token, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToast, setActiveToast] = useState<{ sender: string; text: string; sessionId: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const selectedSessionRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Request browser permissions
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // 1. Fetch Sessions for Admin (GET /api/chat/sessions)
  const fetchSessions = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
    } finally {
      if (showLoading) setRefreshing(false);
    }
  }, []);

  // 2. Fetch Chat History for a Session (GET /api/chat/history?sessionId=xyz)
  const fetchMessages = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/history?sessionId=${id}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages for session", id, err);
    }
  }, []);

  const handleSelectSession = (id: string) => {
    setSelectedSession(id);
    fetchMessages(id);
    setActiveToast(null);
  };

  // 3. Polling and WebSocket setup
  useEffect(() => {
    fetchSessions();

    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWs = () => {
      try {
        const wsUrl = API_BASE_URL.replace(/^http/, "ws");
        socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          if (selectedSessionRef.current) {
            socket?.send(JSON.stringify({ event: "admin_join_support", data: selectedSessionRef.current }));
          }
        };

        socket.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.event === "support_message" || parsed.event === "active_chats_updated") {
              const msg: Message = parsed.data;

              // If message is from customer, trigger sound & notification
              if (msg && msg.sender === "customer") {
                if (soundEnabledRef.current) {
                  playAdminChime();
                }

                setActiveToast({
                  sender: "Customer",
                  text: msg.text || "Sent a new message",
                  sessionId: msg.sessionId || parsed.data?.sessionId || "",
                });

                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  try {
                    new Notification("💬 New Live Chat Message", {
                      body: msg.text,
                      icon: "/favicon.ico",
                    });
                  } catch {}
                }
              }

              fetchSessions();
              if (selectedSessionRef.current) {
                fetchMessages(selectedSessionRef.current);
              }
            }
          } catch (err) {
            console.error("WS Parse error", err);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 4000);
        };
      } catch {
        // Socket failed or not supported, fallback to polling
      }
    };

    connectWs();

    // Polling fallback
    const interval = setInterval(() => {
      fetchSessions();
      if (selectedSessionRef.current) {
        fetchMessages(selectedSessionRef.current);
      }
    }, 3500);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [fetchSessions, fetchMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message (POST /api/chat/message)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedSession || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const optimisticMsg: Message = {
      sessionId: selectedSession,
      sender: "admin",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession,
          sender: "admin",
          text: textToSend,
        }),
      });

      fetchSessions();
      fetchMessages(selectedSession);
    } catch (err) {
      console.error("Failed to send admin message", err);
    } finally {
      setSending(false);
    }
  };

  // 5. Close Session (PUT /api/chat/:id/close)
  const handleCloseSession = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/chat/${id}/close`, {
        method: "PUT",
      });
      fetchSessions();
      if (selectedSession === id) {
        fetchMessages(id);
      }
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  const filteredSessions = sessions.filter((s) => (filter === "active" ? s.status === "active" : true));

  const currentSessionData = sessions.find((s) => s.sessionId === selectedSession);

  return (
    <div className="space-y-6 pb-16 text-neutral-100 max-w-[1550px] mx-auto">
      {/* ── LIVE NOTIFICATION TOAST ── */}
      {activeToast && (
        <div
          onClick={() => {
            if (activeToast.sessionId) {
              handleSelectSession(activeToast.sessionId);
            }
            setActiveToast(null);
          }}
          className="fixed top-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-300 animate-bounce cursor-pointer"
        >
          <Bell className="w-5 h-5 text-black animate-pulse" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider">New Live Chat Message!</p>
            <p className="text-xs text-neutral-900 font-semibold line-clamp-1">&quot;{activeToast.text}&quot;</p>
          </div>
          <span className="text-[10px] bg-black text-amber-400 font-bold px-2 py-1 rounded-lg ml-2">
            Reply →
          </span>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Concierge Operations
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-serif text-white font-bold tracking-tight">
            Live Support &amp; Concierge Desk
          </h1>
          <p className="mt-1 text-neutral-400 text-xs sm:text-sm">
            Chat in real-time with dining guests, assist with VIP table reservations, and answer menu queries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition flex items-center gap-2 text-xs font-semibold ${
              soundEnabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-neutral-900 border-neutral-800 text-neutral-500"
            }`}
            title={soundEnabled ? "Chime sound enabled" : "Sound muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          <button
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-400 hover:text-white transition"
            title="Refresh Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── CHAT MAIN CONTAINER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[650px]">
        {/* Left Col: Sessions List */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-4 flex flex-col h-full shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-amber-400" />
              Conversations ({filteredSessions.length})
            </h3>
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filter === "active"
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filter === "all"
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 custom-scrollbar pr-1">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 space-y-2">
                <MessageCircle className="w-8 h-8 mx-auto text-neutral-600" />
                <p className="text-xs">No active conversations found.</p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession === session.sessionId;
                return (
                  <div
                    key={session.sessionId}
                    onClick={() => handleSelectSession(session.sessionId)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-md"
                        : "bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate max-w-[140px]">
                        {session.customerName || "Guest Patron"}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          session.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      {session.lastMessage || "Started a new conversation"}
                    </p>
                    <span className="text-[9px] text-neutral-500">
                      {new Date(session.updatedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Active Chat Conversation */}
        <div className="md:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-5 flex flex-col h-full shadow-2xl overflow-hidden">
          {selectedSession && currentSessionData ? (
            <>
              {/* Active Chat Header */}
              <div className="pb-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {currentSessionData.customerName
                      ? currentSessionData.customerName.substring(0, 2).toUpperCase()
                      : "CL"}
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      {currentSessionData.customerName || "Guest Patron"}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Session: {currentSessionData.sessionId}
                    </p>
                  </div>
                </div>

                {currentSessionData.status === "active" && (
                  <button
                    onClick={() => handleCloseSession(selectedSession)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolve Chat</span>
                  </button>
                )}
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isAdminMsg = m.sender === "admin";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdminMsg ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                          isAdminMsg
                            ? "bg-amber-500 text-black font-semibold rounded-br-sm shadow-md shadow-amber-500/10"
                            : "bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-sm"
                        }`}
                      >
                        <p>{m.text}</p>
                      </div>
                      <span className="text-[9px] text-neutral-500 mt-1 px-1">
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t border-neutral-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type reply to customer…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 space-y-3">
              <MessageCircle className="w-12 h-12 text-neutral-700" />
              <div>
                <p className="text-sm font-bold text-neutral-300">No Conversation Selected</p>
                <p className="text-xs text-neutral-500">
                  Select a live chat session from the list on the left to view messages and reply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
