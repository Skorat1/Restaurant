"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface Message {
  _id?: string;
  sender: "customer" | "admin";
  text: string;
  createdAt?: string;
  timestamp?: string;
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
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Persistent Session ID from localStorage
  const [sessionId, setSessionId] = useState<string>("");

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

  if (isAdmin) {
    return null;
  }

  // 2. Fetch Chat History from /api/chat/history?sessionId=xyz
  const fetchHistory = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/history?sessionId=${sessionId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  };

  // 3. Socket & Polling fallback
  useEffect(() => {
    if (isOpen && isNameSet && sessionId) {
      fetchHistory();

      let socket: WebSocket | null = null;
      let reconnectTimeout: NodeJS.Timeout;

      const connectWs = () => {
        try {
          const wsUrl = API_BASE_URL.replace(/^http/, "ws");
          socket = new WebSocket(wsUrl);
          socketRef.current = socket;

          socket.onopen = () => {
            socket?.send(JSON.stringify({ event: "join_support", data: { sessionId, customerName } }));
          };

          socket.onmessage = (event) => {
            try {
              const parsed = JSON.parse(event.data);
              if (parsed.event === "support_message") {
                const message: Message = parsed.data;
                setMessages((prev) => {
                  const isDuplicate = prev.some(
                    (m) => m.text === message.text && (m.createdAt === message.createdAt || m._id === message._id)
                  );
                  if (isDuplicate) return prev;
                  return [...prev, message];
                });
              } else if (parsed.event === "chat_closed") {
                setMessages((prev) => [
                  ...prev,
                  { sender: "admin", text: "This chat has been resolved by our concierge team.", createdAt: new Date().toISOString() },
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
          // Socket fallback to HTTP polling
        }
      };

      connectWs();

      const intervalId = setInterval(fetchHistory, 3000);

      return () => {
        clearTimeout(reconnectTimeout);
        clearInterval(intervalId);
        if (socket) {
          socket.onclose = null;
          socket.close();
        }
        socketRef.current = null;
      };
    }
  }, [isOpen, isNameSet, sessionId, customerName]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !sessionId) return;

    const trimmedName = customerName.trim();
    localStorage.setItem("concierge_customer_name", trimmedName);
    setIsNameSet(true);

    // Send initial greeting / handshake message
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "customer",
          text: `Hello, I'm ${trimmedName}. I would like some assistance.`,
          customerName: trimmedName,
        }),
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error("Failed to start chat session", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const optimisticMsg: Message = {
      sender: "customer",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    // Optimistically show message
    setMessages((prev) => [...prev, optimisticMsg]);

    // Send to backend API
    try {
      await fetch(`${API_BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sender: "customer",
          text: textToSend,
          customerName: customerName || "Guest Customer",
        }),
      });
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }

    // Also send via WebSocket if open
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "send_support_message",
          data: {
            sessionId,
            sender: "customer",
            text: textToSend,
          },
        })
      );
    }
  };

  const handleResetSession = () => {
    const newId = "sess_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("concierge_session_id", newId);
    setSessionId(newId);
    setMessages([]);
    setIsNameSet(false);
  };

  return (
    <div className="fixed bottom-6 right-5 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 h-[490px] max-h-[75vh] flex flex-col bg-neutral-950/95 backdrop-blur-2xl border border-amber-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Live Concierge Support</h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-[10px] text-amber-400/90 uppercase tracking-widest font-mono">Instant Reply</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isNameSet && (
                <button
                  onClick={handleResetSession}
                  title="Start New Thread"
                  className="px-2 py-1 text-[10px] font-semibold text-neutral-400 hover:text-amber-400 hover:bg-neutral-800/80 rounded-lg transition"
                >
                  New Thread
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-neutral-900/50">
            {!isNameSet ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-md">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="text-white font-serif font-bold text-base mb-1">Welcome to VELORA Support</h4>
                <p className="text-neutral-400 text-xs mb-5 px-2">Please enter your name to connect with our concierge desk.</p>
                <form onSubmit={handleStartChat} className="w-full max-w-[240px] space-y-3">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-amber-500 outline-none transition"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold py-2.5 rounded-xl hover:from-amber-400 hover:to-amber-500 transition text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    Start Conversation
                  </button>
                </form>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-neutral-500 text-xs py-10 font-mono">
                    Connecting to concierge team...
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "customer"
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-tr-sm self-end shadow-md"
                        : "bg-neutral-800/90 text-white rounded-tl-sm self-start border border-neutral-700 shadow-md"
                    }`}
                  >
                    <div
                      className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                        msg.sender === "customer" ? "text-amber-950" : "text-amber-400"
                      }`}
                    >
                      {msg.sender === "admin" ? "Concierge Desk" : "You"}
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div
                      className={`text-[8px] mt-1 text-right font-mono ${
                        msg.sender === "customer" ? "text-amber-900" : "text-neutral-500"
                      }`}
                    >
                      {new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer */}
          {isNameSet && (
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 bg-neutral-950 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-xl hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Luxury Glassmorphic Toggle Button with Live Pulse Dot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Live Support Chat"
        className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.85)] border transition-all duration-300 active:scale-95 z-50 backdrop-blur-xl ${
          isOpen
            ? "bg-neutral-800 text-white border-neutral-700"
            : "bg-neutral-950/90 hover:bg-neutral-900 text-amber-400 border-amber-500/50 hover:border-amber-400 shadow-amber-500/10 ring-1 ring-amber-400/20"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 text-amber-400" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-neutral-950"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
