'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// Mock user data for simulation
const MOCK_USERS: Record<string, User> = {
  'user@example.com': {
    name: 'John Doe',
    email: 'user@example.com',
    zkAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    isAdmin: false,
  },
  'admin@university.edu': {
    name: 'Admin User',
    email: 'admin@university.edu',
    zkAddress: '0xabcdeffedcba0987654321fedcba0987654321fedcba0987654321fedcba0',
    isAdmin: true,
  },
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const storedUserEmail = localStorage.getItem('sui-org-user');
      if (storedUserEmail && MOCK_USERS[storedUserEmail]) {
        setUser(MOCK_USERS[storedUserEmail]);
      }
    } catch (error) {
      console.error('Could not access localStorage', error);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string) => {
    const userToLogin = MOCK_USERS[email];
    if (userToLogin) {
      setUser(userToLogin);
      try {
        localStorage.setItem('sui-org-user', email);
      } catch (error) {
        console.error('Could not access localStorage', error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('sui-org-user');
      // Redirect to home page on logout for a better UX
      window.location.href = '/';
    } catch (error) {
      console.error('Could not access localStorage', error);
    }
  }, []);

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
