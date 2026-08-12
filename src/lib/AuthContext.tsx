"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import API_BASE_URL from "./api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  loyaltyPoints?: number;
  membership?: {
    tier: "gold" | "platinum" | null;
    active: boolean;
    startedAt?: string;
    expiresAt?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
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
      } else {
        // 401 = token expired or invalid — clear session
        localStorage.removeItem("token");
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

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
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
