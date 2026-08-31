"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, CheckCircle, Clock, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";

interface Message {
  sender: "customer" | "admin";
  text: string;
  timestamp: string;
}

interface ChatSession {
  _id: string;
  customerName: string;
  status: "open" | "closed";
  messages: Message[];
  updatedAt: string;
  createdAt?: string;
}

export default function AdminChatPage() {
  const { token, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [refreshing, setRefreshing] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  // Fetch active / all sessions from MongoDB
  const fetchSessions = useCallback(async (showIndicator = false) => {
    if (!token) return;
    if (showIndicator) setRefreshing(true);
    try {
      const endpoint = filter === "all" ? `${API_BASE_URL}/api/chat/all` : `${API_BASE_URL}/api/chat/active`;
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
    } finally {
      if (showIndicator) setRefreshing(false);
    }
  }, [token, filter]);

  // WebSocket and polling loop
  useEffect(() => {
    if (!loading && token) {
      fetchSessions();

      let socket: WebSocket | null = null;
      let reconnectTimeout: NodeJS.Timeout;

      const connectWs = () => {
        try {
          const wsUrl = API_BASE_URL.replace(/^http/, "ws");
          socket = new WebSocket(wsUrl);
          socketRef.current = socket;

          socket.onopen = () => {
            if (activeSessionIdRef.current) {
              socket?.send(JSON.stringify({ event: "admin_join_support", data: activeSessionIdRef.current }));
            }
          };

          socket.onmessage = (event) => {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.event === "active_chats_updated" || parsed.event === "support_message") {
                fetchSessions();
              }
            } catch (err) {
              console.error("WS Parse error", err);
            }
          };

          socket.onclose = () => {
            reconnectTimeout = setTimeout(connectWs, 5000);
          };
        } catch {
          // Socket failed or not supported, fallback to polling
        }
      };

      connectWs();

      const intervalId = setInterval(() => {
        fetchSessions();
      }, 3000);

      return () => {
        clearTimeout(reconnectTimeout);
        clearInterval(intervalId);
        if (socket) {
          socket.onclose = null;
          socket.close();
        }
      };
    }
  }, [loading, token, fetchSessions]);

  useEffect(() => {
    if (activeSessionId && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event: "admin_join_support", data: activeSessionId }));
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find((s) => s._id === activeSessionId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSessionId || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const message: Message = {
      sender: "admin",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    // Optimistically update the UI
    setSessions((prev) =>
      prev.map((session) =>
        session._id === activeSessionId
          ? { ...session, messages: [...session.messages, message], updatedAt: new Date().toISOString() }
          : session
      )
    );

    // Save directly to MongoDB via REST API
    try {
      await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          sender: "admin",
          text: textToSend,
        }),
      });
      fetchSessions();
    } catch (err) {
      console.error("Failed to send admin message via HTTP", err);
    } finally {
      setSending(false);
    }

    // Broadcast via WebSocket if open
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "send_support_message",
          data: {
            sessionId: activeSessionId,
            sender: "admin",
            text: textToSend,
          },
        })
      );
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${sessionId}/close`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-4 sm:gap-6 bg-transparent p-2 sm:p-0">
      {/* Sessions List */}
      <div className="w-full lg:w-1/3 max-w-full lg:max-w-[340px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-amber-400" />
              Live Concierge Support
            </h2>
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 uppercase tracking-widest">
              {sessions.filter((s) => s.status === "open").length} Active Chats
            </p>
          </div>
          <button
            onClick={() => fetchSessions(true)}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
            title="Refresh Chats"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/30 p-2 gap-1">
          <button
            onClick={() => setFilter("open")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === "open"
                ? "bg-amber-500 text-black font-bold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            Active ({sessions.filter((s) => s.status === "open").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === "all"
                ? "bg-amber-500 text-black font-bold"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            All History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
          {sessions.length === 0 ? (
            <div className="text-center text-neutral-500 py-12 text-xs">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No active customer chats found in database.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => setActiveSessionId(session._id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  activeSessionId === session._id
                    ? "bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5"
                    : "bg-neutral-800/40 border-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {session.customerName ? session.customerName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[130px]">
                      {session.customerName || "Guest"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        session.status === "open"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {session.status === "open" ? "Live" : "Resolved"}
                    </span>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 truncate pl-9">
                  {session.messages.length > 0
                    ? session.messages[session.messages.length - 1].text
                    : "No messages yet"}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        {activeSession ? (
          <>
            <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  {activeSession.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">{activeSession.customerName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        activeSession.status === "open"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                      }`}
                    >
                      {activeSession.status === "open" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Active
                        </>
                      ) : (
                        "Closed / Resolved"
                      )}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {activeSession._id.slice(0, 14)}...</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeSession.status === "open" ? (
                  <button
                    onClick={() => closeSession(activeSession._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-neutral-300 transition rounded-xl text-xs sm:text-sm font-semibold border border-neutral-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <span className="text-xs text-neutral-500 font-medium italic">Chat session closed</span>
                )}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 bg-neutral-950/30">
              {activeSession.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "admin"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-tr-sm self-end shadow-md"
                      : "bg-neutral-800/90 text-white rounded-tl-sm self-start border border-neutral-700 shadow-md"
                  }`}
                >
                  <div
                    className={`text-[9px] font-extrabold uppercase tracking-widest mb-1 ${
                      msg.sender === "admin" ? "text-amber-950" : "text-amber-400"
                    }`}
                  >
                    {msg.sender === "admin" ? "Concierge Desk (You)" : activeSession.customerName}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 text-right font-mono ${
                      msg.sender === "admin" ? "text-amber-900" : "text-neutral-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/70 flex gap-2 sm:gap-3 shrink-0">
              <input
                type="text"
                placeholder={activeSession.status === "open" ? `Reply to ${activeSession.customerName}...` : "Chat is closed. Replying will reopen it..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-5 sm:px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-2xl hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center justify-center shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 opacity-30 text-amber-400" />
            </div>
            <h4 className="text-white font-bold text-base mb-1">Select a Live Chat Session</h4>
            <p className="text-xs text-neutral-400 max-w-sm">
              Click on any customer in the left sidebar to view their messages and reply in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
