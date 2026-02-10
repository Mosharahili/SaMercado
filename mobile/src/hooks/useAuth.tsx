import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken, removeToken } from "@api/client";

type Role = "CUSTOMER" | "VENDOR" | "ADMIN" | "OWNER";

export type PermissionKey =
  | "MANAGE_BANNERS"
  | "MANAGE_POPUPS"
  | "MANAGE_MARKETS"
  | "MANAGE_VENDORS"
  | "MANAGE_PRODUCTS"
  | "VIEW_ANALYTICS"
  | "MANAGE_ORDERS"
  | "MANAGE_USERS"
  | "MANAGE_PAYMENTS"
  | "SEND_NOTIFICATIONS";

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  token: string;
  permissions?: string[];
  vendorId?: string | null;
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
    const loadUser = async () => {
      try {
        const token = await getToken();
        if (token) {
          // Verify token with backend
          const res = await api.get("/auth/me");
          const userData = res.data;
          const authUser: AuthUser = {
            id: userData.id,
            name: userData.name,
            role: userData.role,
            token,
            permissions: userData.permissions,
            vendorId: userData.vendorId,
          };
          setUser(authUser);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        await removeToken();
      } finally {
        setLoading(false);
      }
    };
    void loadUser();
  }, []);

  const login = async (next: AuthUser) => {
    setUser(next);
    await setToken(next.token);
  };

  const logout = async () => {
    setUser(null);
    await removeToken();
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

