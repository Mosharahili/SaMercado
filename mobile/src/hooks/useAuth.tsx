import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@api/client";

type Role = "CUSTOMER" | "VENDOR" | "ADMIN" | "OWNER";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: load from secure storage
    setLoading(false);
  }, []);

  const login = async (next: AuthUser) => {
    setUser(next);
    api.defaults.headers.common.Authorization = `Bearer ${next.token}`;
    // TODO: persist token to secure storage
  };

  const logout = async () => {
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    // TODO: clear secure storage
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

