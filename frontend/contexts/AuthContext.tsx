"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types/auth";
import {
  loginUser,
  logout as logoutService,
  getCurrentUserProfile,
} from "@/services/authService";
import { getAuthToken, clearAuthToken } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getAuthToken();
        if (storedToken) {
          setToken(storedToken);
          const profile = await getCurrentUserProfile();
          setUser(profile);
        }
      } catch (err) {
        console.error("Failed to restore auth:", err);
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await loginUser({ email, password });
      setToken(response.access_token);

      // Fetch user profile
      const profile = await getCurrentUserProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutService();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.employee.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
