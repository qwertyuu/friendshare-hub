import React, { createContext, useContext, useState, useEffect } from "react";
import { api, User } from "@/services/api";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  loginWithSSO: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getCurrentUser();
        setUser(response.user);
      } catch (err) {
        // Silently fail - no token means not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginWithSSO = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get authorization URL from backend
      const response = await api.getLoginUrl();

      // Redirect to Authentik
      window.location.href = response.authorizationUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const response = await api.logout();
      setUser(null);

      // If SSO logout URL provided, redirect to end SSO session
      if (response.ssoLogoutUrl) {
        window.location.href = response.ssoLogoutUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithSSO, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
