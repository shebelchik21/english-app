import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';

export interface User {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  role: 'STUDENT' | 'ADMIN';
  packages?: Package[];
}

export interface Package {
  id: number;
  name: string;
  lessonsTotal: number;
  lessonsUsed: number;
  expiresAt: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.getMe();
      setUser(res.data);
    } catch (err: unknown) {
      console.error('Failed to fetch user:', err);
      setError('Не удалось загрузить данные пользователя');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
