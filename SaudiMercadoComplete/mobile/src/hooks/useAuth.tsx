import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '@api/client';
import { User } from '@app-types/models';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const cachedUser = await SecureStore.getItemAsync(USER_KEY);
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setIsLoading(false);
        }

        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return;

        const response = await api.get<{ user: User }>('/auth/me');
        setUser(response.user);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
      } catch (_error) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  };

  const signup = async (input: { name: string; email: string; password: string }) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', input);
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_error) {
      // ignore logout API failure
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  const hasPermission = (code: string) => {
    if (!user) return false;
    if (user.role === 'OWNER') return true;
    return user.permissions.includes(code as any);
  };

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, hasPermission }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
