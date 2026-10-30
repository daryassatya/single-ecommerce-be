import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminUser {
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
}

const AUTH_STORAGE_KEY = 'syafira_admin_session_v1';

// Admin credentials
const ADMIN_EMAIL = 'prabandarisyafira@gmail.com';
const ADMIN_PASSWORD = '@syafira123';

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

    // Check credentials against admin credentials
    const matchesAdmin =
      cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD;

    if (matchesAdmin) {
      const adminData: AdminUser = {
        email: ADMIN_EMAIL,
        name: 'Syafira Prabandari',
        role: 'Super Admin',
      };

      // Also try signing in to Supabase Auth silently in the background
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

    // Try Supabase auth fallback
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!error && data?.user) {
        const userData: AdminUser = {
          email: data.user.email || cleanEmail,
          name: data.user.user_metadata?.full_name || 'Admin',
          role: 'Administrator',
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

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
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
