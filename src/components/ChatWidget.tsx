"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface Message {
  sender: "customer" | "admin";
  text: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session ID from localStorage or create new
  useEffect(() => {
    let savedSessionId = localStorage.getItem("chatSessionId");
    let savedName = localStorage.getItem("chatCustomerName");
    
    if (savedSessionId && savedName) {
      setSessionId(savedSessionId);
      setCustomerName(savedName);
      setIsNameSet(true);
    }
  }, []);

  // Socket connection
  useEffect(() => {
    if (isOpen && isNameSet && sessionId) {
      let socket: WebSocket | null = null;
      let reconnectTimeout: NodeJS.Timeout;

      const connectWs = () => {
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
                  (m) => m.text === message.text && m.timestamp === message.timestamp && m.sender === message.sender
                );
                if (isDuplicate) return prev;
                return [...prev, message];
              });
            } else if (parsed.event === "chat_closed") {
              setMessages((prev) => [
                ...prev,
                { sender: "admin", text: "This chat has been closed by the agent.", timestamp: new Date().toISOString() },
              ]);
              localStorage.removeItem("chatSessionId");
              localStorage.removeItem("chatCustomerName");
              socket?.close();
            }
          } catch (err) {
            console.error("WS parse error", err);
          }
        };

        socket.onclose = () => {
          reconnectTimeout = setTimeout(connectWs, 3000);
        };
      };

      connectWs();

      return () => {
        clearTimeout(reconnectTimeout);
        if (socket) {
          socket.onclose = null;
          socket.close();
        }
        socketRef.current = null;
      };
    }
  }, [isOpen, isNameSet, sessionId, customerName]);

  // Fetch history when opening existing session
  useEffect(() => {
    if (isOpen && isNameSet && sessionId && messages.length === 0) {
      const fetchHistory = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/chat/${sessionId}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            if (data.status === "closed") {
              localStorage.removeItem("chatSessionId");
              localStorage.removeItem("chatCustomerName");
              setIsNameSet(false);
              setSessionId(null);
            } else {
              setMessages(data.messages || []);
            }
          } else if (res.status === 404) {
            // Session not found on server
            localStorage.removeItem("chatSessionId");
            localStorage.removeItem("chatCustomerName");
            setIsNameSet(false);
            setSessionId(null);
          }
        } catch (error) {
          console.error("Failed to fetch chat history", error);
        }
      };

      fetchHistory();

      // Polling fallback
      const intervalId = setInterval(() => {
        fetchHistory();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [isOpen, isNameSet, sessionId, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
    setIsNameSet(true);
    localStorage.setItem("chatSessionId", newSessionId);
    localStorage.setItem("chatCustomerName", customerName);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !sessionId) return;

    const message: Message = {
      sender: "customer",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add message
    setMessages((prev) => [...prev, message]);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          event: "send_support_message",
          data: {
            sessionId,
            sender: "customer",
            text: newMessage,
          },
        })
      );
    }
    
    setNewMessage("");
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[480px] max-h-[70vh] flex flex-col bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="p-4 border-b border-amber-500/30 bg-amber-900/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Support</h3>
                <p className="text-[10px] text-amber-400 uppercase tracking-widest">We reply instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-neutral-900/50">
            {!isNameSet ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageCircle className="w-12 h-12 text-neutral-600 mb-4" />
                <h4 className="text-white font-bold mb-2">Welcome to VELORA Support</h4>
                <p className="text-neutral-400 text-xs mb-6 px-4">Please enter your name to start chatting with our support team.</p>
                <form onSubmit={handleStartChat} className="w-full max-w-[240px]">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition mb-3"
                    required
                  />
                  <button type="submit" className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition text-sm">
                    Start Chat
                  </button>
                </form>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="text-center text-neutral-500 text-xs py-10">
                    Connecting to an agent...
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "customer"
                        ? "bg-amber-500 text-black rounded-tr-sm self-end"
                        : "bg-neutral-800 text-white rounded-tl-sm self-start border border-neutral-700"
                    }`}
                  >
                    {msg.sender === "admin" && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Support Agent</div>
                    )}
                    {msg.text}
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
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 z-50 ${
          isOpen
            ? "bg-neutral-800 text-white"
            : "bg-amber-500 text-black shadow-amber-500/40"
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
