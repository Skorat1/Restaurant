"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { CheckCircle2 } from "lucide-react";

type OrderItem = {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  options: any[];
  addons: any[];
};

type Order = {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  status: string;
  createdAt: string;
  notes?: string;
};

export default function KDSPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
  }, []);

  useEffect(() => {
    if (!token) return;
    
    // Fetch initial active orders
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/kds/active`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load active orders");
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Connect to WebSocket
    const socket: Socket = io(API_BASE_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("KDS connected to websocket");
      setIsLive(true);
    });

    socket.on("disconnect", () => {
      setIsLive(false);
    });

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => {
        // Prevent duplicate if already exists
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [...prev, newOrder].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    });

    socket.on("order_status_updated", (updatedOrder: Order) => {
      setOrders((prev) => {
        if (updatedOrder.status === "Out for Delivery" || updatedOrder.status === "Delivered" || updatedOrder.status === "Cancelled") {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Status update will come through socket anyway, but we can optimistically update
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Confirmed":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Preparing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Ready":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading KDS...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-neutral-800 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              Operations
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Sync
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mt-2">Kitchen Display System</h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">Real-time order management and fulfillment.</p>
        </div>
        <div className="flex gap-4 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-2 px-4 rounded-full shadow-inner">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" /> Pending
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" /> Preparing
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max px-2">
          {["Pending", "Confirmed", "Preparing", "Ready"].map((columnStatus) => {
            const columnOrders = orders.filter((o) => o.status === columnStatus);
            return (
              <div key={columnStatus} className="flex-shrink-0 w-80 bg-neutral-900/40 backdrop-blur-2xl rounded-[2rem] border border-neutral-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl pointer-events-none"></div>
                <div className="p-5 border-b border-neutral-800/60 bg-neutral-950/40 flex items-center justify-between relative z-10 backdrop-blur-xl">
                  <span className="text-white font-serif font-bold text-lg tracking-wide">{columnStatus}</span>
                  <span className="bg-neutral-800 text-xs px-3 py-1 rounded-full text-neutral-300 font-bold border border-neutral-700 shadow-inner">{columnOrders.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10">
                  {columnOrders.map((order) => (
                    <div key={order._id} className={`p-5 rounded-2xl border ${getStatusColor(order.status)} bg-neutral-900/80 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <p className="font-mono font-bold text-white text-xl tracking-wider">{order.orderNumber}</p>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1 font-bold">{new Date(order.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium shadow-inner relative z-10">
                          <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Notes</span>
                          {order.notes}
                        </div>
                      )}

                      <div className="space-y-3 mb-6 relative z-10">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm bg-neutral-950/50 p-2.5 rounded-xl border border-neutral-800/50">
                            <span className="font-black text-white bg-neutral-800 px-2 py-0.5 rounded-md shadow-sm">{item.quantity}x</span>
                            <span className="text-neutral-300 font-medium">
                              {item.name}
                              {(item.addons?.length > 0 || item.options?.length > 0) && (
                                <span className="block text-xs text-neutral-500 mt-1 italic">
                                  + {item.addons?.map(a => a.name).join(", ")}
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 relative z-10">
                        {order.status === "Pending" && (
                          <SlideButton label="Swipe to Accept" bg="bg-amber-500" text="text-amber-950" onComplete={() => updateStatus(order._id, "Confirmed")} />
                        )}
                        {order.status === "Confirmed" && (
                          <SlideButton label="Swipe to Prep" bg="bg-blue-500" text="text-white" onComplete={() => updateStatus(order._id, "Preparing")} />
                        )}
                        {order.status === "Preparing" && (
                          <SlideButton label="Swipe for Ready" bg="bg-emerald-500" text="text-emerald-950" onComplete={() => updateStatus(order._id, "Ready")} />
                        )}
                      </div>
                    </div>
                  ))}
                  {columnOrders.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm py-12">
                      <div className="w-16 h-16 rounded-full border-2 border-neutral-800 bg-neutral-900/50 flex items-center justify-center mb-4 shadow-inner">
                        <CheckCircle2 className="w-8 h-8 text-neutral-600" />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-xs">All caught up!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Custom touch-friendly slide-to-action button
function SlideButton({ label, bg, text, onComplete }: { label: string, bg: string, text: string, onComplete: () => void }) {
  const [slideAmount, setSlideAmount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    isDragging.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX.current;
    const maxSlide = containerRef.current.offsetWidth - 56; // 56 is the button width approx

    if (delta > 0 && delta <= maxSlide) {
      setSlideAmount(delta);
    } else if (delta > maxSlide) {
      setSlideAmount(maxSlide);
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    if (!containerRef.current) return;
    const maxSlide = containerRef.current.offsetWidth - 56;
    if (slideAmount >= maxSlide * 0.8) { // 80% threshold
      setSlideAmount(maxSlide);
      setTimeout(onComplete, 200);
    } else {
      setSlideAmount(0); // Snap back
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative h-14 rounded-xl bg-neutral-950/80 backdrop-blur-sm overflow-hidden flex items-center justify-center select-none shadow-inner border border-neutral-800/80 transition-all hover:border-neutral-700`}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      {/* Background Progress */}
      <div 
        className={`absolute left-0 top-0 bottom-0 ${bg} opacity-20`}
        style={{ width: slideAmount + 56 }}
      />
      
      {/* Text Label */}
      <span className="text-neutral-400 font-extrabold uppercase tracking-widest text-[10px] pointer-events-none z-0">
        {label}
      </span>

      {/* Draggable Thumb */}
      <div 
        className={`absolute left-1 top-1 bottom-1 w-12 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_15px_rgba(0,0,0,0.5)] ${bg} ${text} z-10 transition-transform ${isDragging.current ? '' : 'duration-300'}`}
        style={{ transform: `translateX(${slideAmount}px)` }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
