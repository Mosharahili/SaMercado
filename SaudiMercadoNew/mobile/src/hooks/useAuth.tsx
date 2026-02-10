import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'OWNER';
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userData = await SecureStore.getItemAsync('userData');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Implement login API call
    // For now, mock
    const mockUser: User = {
      id: '1',
      email,
      name: 'User',
      role: 'CUSTOMER',
    };
    setUser(mockUser);
    await SecureStore.setItemAsync('authToken', 'mock-token');
    await SecureStore.setItemAsync('userData', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');
  };

  const register = async (email: string, password: string, name: string) => {
    // Implement register API call
    // Mock
    const mockUser: User = {
      id: '1',
      email,
      name,
      role: 'CUSTOMER',
    };
    setUser(mockUser);
    await SecureStore.setItemAsync('authToken', 'mock-token');
    await SecureStore.setItemAsync('userData', JSON.stringify(mockUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};