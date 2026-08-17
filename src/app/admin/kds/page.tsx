"use client";
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/lib/AuthContext";
import API_BASE_URL from "@/lib/api";
import { CheckCircle2, Flame, Clock, ChefHat, Coffee, Pizza, LayoutGrid } from "lucide-react";

type OrderItem = {
  _id: string;
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  options: any[];
  addons: any[];
  station: string;
  itemStatus: string;
  estimatedPrepTime: number;
  prepStartTime: string | null;
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

const STATIONS = ["All", "Main Kitchen", "Tandoor", "Chinese", "Bakery", "Beverage", "Dessert"];

export default function KDSPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [activeStation, setActiveStation] = useState("All");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return;
    
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/kds/active`, {
          headers: { Authorization: `Bearer ${token}` },
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

    const socket: Socket = io(API_BASE_URL, { withCredentials: true });

    socket.on("connect", () => {
      console.log("KDS connected to websocket");
      setIsLive(true);
    });

    socket.on("disconnect", () => setIsLive(false));

    socket.on("new_order", (newOrder: Order) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [...prev, newOrder].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
      if (audioRef.current) audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    });

    socket.on("order_status_updated", (updatedOrder: Order) => {
      setOrders((prev) => {
        if (["Out for Delivery", "Delivered", "Cancelled"].includes(updatedOrder.status)) {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });
    });

    socket.on("order_item_updated", (data: { orderId: string; itemId: string; status: string }) => {
      setOrders(prev => prev.map(order => {
        if (order._id !== data.orderId) return order;
        return {
          ...order,
          items: order.items.map(item => {
            if (item._id !== data.itemId) return item;
            return {
              ...item,
              itemStatus: data.status,
              prepStartTime: data.status === 'Preparing' && !item.prepStartTime ? new Date().toISOString() : item.prepStartTime
            };
          })
        };
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const updateItemStatus = async (orderId: string, itemId: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items/${itemId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      console.error(err);
      alert("Failed to update item status");
    }
  };

  const getStationIcon = (station: string) => {
    switch(station) {
      case "Tandoor": return <Flame className="w-4 h-4 text-orange-500" />;
      case "Bakery": return <Pizza className="w-4 h-4 text-amber-500" />;
      case "Beverage": return <Coffee className="w-4 h-4 text-cyan-500" />;
      case "Main Kitchen": return <ChefHat className="w-4 h-4 text-red-500" />;
      default: return <LayoutGrid className="w-4 h-4 text-neutral-400" />;
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading Smart KDS...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // Flatten items for the selected station
  const stationItems = orders.flatMap(order => 
    order.items
      .filter(item => activeStation === "All" || item.station === activeStation)
      .map(item => ({ ...item, orderId: order._id, orderNumber: order.orderNumber, orderTime: order.createdAt, notes: order.notes }))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-neutral-800 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              KDS 2.0
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Live
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mt-2">Smart Kitchen Display</h1>
        </div>
        
        {/* Station Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 p-1.5 rounded-2xl shadow-inner custom-scrollbar">
          {STATIONS.map(station => (
            <button
              key={station}
              onClick={() => setActiveStation(station)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeStation === station
                  ? "bg-amber-500 text-black shadow-md"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              }`}
            >
              {getStationIcon(station)}
              {station}
            </button>
          ))}
        </div>
      </div>

      {/* KDS Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max px-2">
          {["Pending", "Preparing", "Ready"].map((colStatus) => {
            const colItems = stationItems.filter(i => (i.itemStatus || "Pending") === colStatus);
            
            return (
              <div key={colStatus} className="flex-shrink-0 w-[350px] bg-neutral-900/40 backdrop-blur-2xl rounded-[2rem] border border-neutral-800 flex flex-col h-full overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl pointer-events-none"></div>
                
                <div className="p-5 border-b border-neutral-800/60 bg-neutral-950/40 flex items-center justify-between relative z-10">
                  <span className="text-white font-serif font-bold text-lg tracking-wide">{colStatus}</span>
                  <span className="bg-neutral-800 text-xs px-3 py-1 rounded-full text-neutral-300 font-bold border border-neutral-700 shadow-inner">{colItems.length} items</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar relative z-10">
                  {colItems.map((item) => {
                    // Calculate elapsed prep time
                    let isOverdue = false;
                    let elapsedMins = 0;
                    if (item.prepStartTime && colStatus === "Preparing") {
                      elapsedMins = Math.floor((currentTime - new Date(item.prepStartTime).getTime()) / 60000);
                      isOverdue = elapsedMins > (item.estimatedPrepTime || 15);
                    }

                    return (
                      <div key={item._id || item.itemId} className={`p-4 rounded-2xl border bg-neutral-900/80 backdrop-blur-xl shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                        isOverdue ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-neutral-800'
                      }`}>
                        
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-mono font-bold text-amber-500 text-sm">{item.orderNumber}</span>
                            <span className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-0.5">
                              {new Date(item.orderTime).toLocaleTimeString()}
                            </span>
                          </div>
                          
                          {/* Station Badge */}
                          {activeStation === "All" && (
                            <span className="px-2 py-1 rounded-md bg-neutral-800 text-[9px] font-black uppercase tracking-widest text-neutral-400 border border-neutral-700 flex items-center gap-1">
                              {getStationIcon(item.station)} {item.station}
                            </span>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50 mb-4 relative">
                           {isOverdue && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-bounce shadow-lg flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Delayed
                              </div>
                           )}
                          <div className="flex items-start gap-3">
                            <span className="font-black text-white bg-neutral-800 px-2 py-0.5 rounded-md text-sm shadow-sm">{item.quantity}x</span>
                            <div>
                              <span className="text-white font-bold text-base">{item.name}</span>
                              {(item.addons?.length > 0 || item.options?.length > 0) && (
                                <span className="block text-xs text-amber-500/80 mt-1 font-medium italic">
                                  + {item.addons?.map(a => a.name).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {item.notes && (
                          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">
                            <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5">Notes</span>
                            {item.notes}
                          </div>
                        )}

                        {/* Timers & Bump Actions */}
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-800/80">
                          <div className="flex flex-col text-[10px] font-mono">
                            <span className="text-neutral-500 uppercase tracking-widest font-bold">Target Time</span>
                            <span className="text-neutral-300">{item.estimatedPrepTime || 15} mins</span>
                          </div>
                          
                          {colStatus === "Preparing" && (
                            <div className="flex flex-col items-end text-[10px] font-mono">
                              <span className="text-neutral-500 uppercase tracking-widest font-bold">Elapsed</span>
                              <span className={`font-bold ${isOverdue ? 'text-red-400' : 'text-blue-400'}`}>{elapsedMins} mins</span>
                            </div>
                          )}

                          {colStatus === "Pending" && (
                            <button 
                              onClick={() => updateItemStatus(item.orderId, item._id || item.itemId, "Preparing")}
                              className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-400 transition-colors"
                            >
                              START PREP
                            </button>
                          )}
                          
                          {colStatus === "Preparing" && (
                            <button 
                              onClick={() => updateItemStatus(item.orderId, item._id || item.itemId, "Ready")}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-emerald-950 text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
                            >
                              MARK READY
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {colItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm py-12">
                      <div className="w-16 h-16 rounded-full border-2 border-neutral-800 bg-neutral-900/50 flex items-center justify-center mb-4 shadow-inner">
                        <CheckCircle2 className="w-8 h-8 text-neutral-600" />
                      </div>
                      <span className="font-bold uppercase tracking-widest text-xs">Queue Empty</span>
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
