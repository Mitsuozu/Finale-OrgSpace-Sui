'use client';

import type { User } from '@/lib/types';
import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// This is a placeholder for a real user object once zkLogin completes.
// In a full implementation, this might be fetched from a DB after login.
const getMockUserFromEmail = (email: string, zkAddress: string): User => {
    const isAdmin = email.endsWith('@university.edu'); // Example admin logic
    return {
        name: email.split('@')[0],
        email: email,
        zkAddress: zkAddress,
        isAdmin: isAdmin,
    };
};

type AuthContextType = {
  user: User | null;
  login: (email: string, zkAddress: string) => void;
  logout: () => void;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    try {
      const storedUser = localStorage.getItem('sui-org-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Could not access localStorage', error);
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, zkAddress: string) => {
    // This function will be called from the auth callback page.
    const userToLogin = getMockUserFromEmail(email, zkAddress);
    setUser(userToLogin);
    try {
      localStorage.setItem('sui-org-user', JSON.stringify(userToLogin));
    } catch (error) {
      console.error('Could not access localStorage', error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('sui-org-user');
      // Additional session clearing logic for zkLogin will go here
      sessionStorage.removeItem('zk-ephemeral-keypair');
      sessionStorage.removeItem('zk-nonce');
      window.location.href = '/';
    } catch (error) {
      console.error('Could not access localStorage', error);
    }
  }, []);

  const value = useMemo(() => ({ user, login, logout, loading }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
