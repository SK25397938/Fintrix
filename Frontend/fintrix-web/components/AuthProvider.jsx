"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, fetchCurrentUser, getAuthToken, getStoredUser, storeAuth } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ email: "developer@fintrix.local", name: "Developer Mode" });
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    // Automatically authenticated in local developer mode to bypass Gmail auth/login redirects
    setIsAuthenticated(true);
    setUser({ email: "developer@fintrix.local", name: "Developer Mode" });
    setIsReady(true);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isReady,
      login(nextUser, token) {
        storeAuth(token, nextUser);
        setUser(nextUser || null);
        setIsAuthenticated(true);
      },
      logout() {
        clearAuth();
        setIsAuthenticated(false);
        setUser(null);
      },
    }),
    [isAuthenticated, isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
