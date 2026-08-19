"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { MessageCircle, Send, CheckCircle, Clock } from "lucide-react";
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
}

export default function AdminChatPage() {
  const { token, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch active sessions
  const fetchSessions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to fetch chat sessions", err);
    }
  };

  useEffect(() => {
    if (!loading && token) {
      fetchSessions();

      const socket = io(API_BASE_URL, {
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;

      socket.on("active_chats_updated", () => {
        fetchSessions();
      });

      socket.on("support_message", (message: Message) => {
        // If we are currently viewing the session that got a message, 
        // we might need to refresh sessions to get the latest message in the view
        fetchSessions();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [loading, token]);

  useEffect(() => {
    if (activeSessionId && socketRef.current) {
      socketRef.current.emit("admin_join_support", activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId]);

  const activeSession = sessions.find((s) => s._id === activeSessionId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !activeSessionId) return;

    socketRef.current.emit("send_support_message", {
      sessionId: activeSessionId,
      sender: "admin",
      text: newMessage,
    });

    setNewMessage("");
  };

  const closeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/${sessionId}/close`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
        }
        fetchSessions();
      }
    } catch (err) {
      console.error("Failed to close session", err);
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 bg-transparent p-4 sm:p-0">
      {/* Sessions List */}
      <div className="w-full sm:w-1/3 max-w-[320px] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-500" />
            Live Support
          </h2>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{sessions.length} Active Chats</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
          {sessions.length === 0 ? (
            <div className="text-center text-neutral-500 py-10 text-sm">
              No active customer chats.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => setActiveSessionId(session._id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeSessionId === session._id
                    ? "bg-amber-500/10 border-amber-500/50"
                    : "bg-neutral-800/50 border-neutral-800 hover:bg-neutral-800"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-white text-sm">{session.customerName}</span>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-neutral-400 truncate">
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
            <div className="p-5 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-white">{activeSession.customerName}</h3>
                <p className="text-xs text-emerald-400 uppercase tracking-widest mt-1">Online</p>
              </div>
              <button
                onClick={() => closeSession(activeSession._id)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 transition rounded-xl text-sm font-semibold"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Resolved
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              {activeSession.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === "admin"
                      ? "bg-amber-500 text-black rounded-tr-sm self-end"
                      : "bg-neutral-800 text-white rounded-tl-sm self-start border border-neutral-700"
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${msg.sender === "admin" ? "text-amber-900" : "text-neutral-500"}`}>
                    {msg.sender === "admin" ? "You" : activeSession.customerName}
                  </div>
                  {msg.text}
                  <div className={`text-[9px] mt-2 text-right ${msg.sender === "admin" ? "text-amber-700" : "text-neutral-500"}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-800 bg-neutral-950/50 flex gap-3 shrink-0">
              <input
                type="text"
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 bg-amber-500 text-black rounded-2xl hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a chat session to start replying.</p>
          </div>
        )}
      </div>
    </div>
  );
}
