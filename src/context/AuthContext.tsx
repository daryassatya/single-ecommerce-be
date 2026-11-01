import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { adminAccountsService } from '@/services/adminAccountsService';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  updateUserSession: (user: AdminUser) => void;
  updateCredentials: (params: {
    currentEmail: string;
    currentPassword: string;
    newEmail?: string;
    newPassword?: string;
    newName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AUTH_STORAGE_KEY = 'admin_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setIsAuthenticated(true);
          setUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 1. Verify via adminAccountsService (supports Supabase admin_accounts & seeded accounts)
    const adminAcc = await adminAccountsService.verifyLogin(cleanEmail, cleanPassword);

    if (adminAcc) {
      const adminData: AdminUser = {
        email: adminAcc.email,
        name: adminAcc.name,
        role: adminAcc.role || 'Super Admin',
      };

      // Also try signing in to Supabase Auth silently in the background if possible
      try {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });
      } catch {
        // Silently continue with admin session
      }

      setIsAuthenticated(true);
      setUser(adminData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminData));
      return { success: true };
    }

    // 2. Try standard Supabase auth fallback
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.user) {
        const userData: AdminUser = {
          email: data.user.email || cleanEmail,
          name: data.user.user_metadata?.full_name || 'Admin',
          role: 'Super Admin',
        };
        setIsAuthenticated(true);
        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        return { success: true };
      }
    } catch {
      // Continue to error
    }

    return {
      success: false,
      error: 'Email atau password yang Anda masukkan salah. Silakan coba lagi.',
    };
  };

  const logout = () => {
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUserSession = (updatedUser: AdminUser) => {
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const updateCredentials = async (params: {
    currentEmail: string;
    currentPassword: string;
    newEmail?: string;
    newPassword?: string;
    newName?: string;
  }) => {
    const res = await adminAccountsService.updateCredentials(params);
    if (res.success && res.updatedUser) {
      updateUserSession(res.updatedUser);
      return { success: true };
    }
    return { success: false, error: res.error || 'Gagal mengubah data akun' };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        updateUserSession,
        updateCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
