"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API_BASE_URL from "./api";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatarIcon?: string;
  avatarColor?: string;
  addresses?: Array<{
    id: string;
    label: string;
    line: string;
    city: string;
    pincode: string;
    isPrimary?: boolean;
  }>;
  role: string;
  isVerified?: boolean;
  loyaltyPoints?: number;
  membership?: {
    tier: "silver" | "gold" | "platinum" | null;
    active: boolean;
    startedAt?: string;
    expiresAt?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (jwt: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 401) {
        // Attempt session refresh with refresh token
        const storedRefresh = localStorage.getItem("refreshToken");
        if (storedRefresh) {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefresh }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("token", data.token);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            setToken(data.token);
            setUser(data.user);
            return;
          }
        }
        // 401 and refresh failed — clear session
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setToken(null);
        setUser(null);
      }
    } catch {
      // Server unreachable — keep token, don't log out
    } finally {
      setLoading(false);
    }
  };

  // On mount, restore token from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      } else {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    localStorage.setItem("token", newToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      }
    } catch { /* ignore */ } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
