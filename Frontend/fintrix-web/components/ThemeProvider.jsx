"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_STORAGE_KEY = "fintrix-theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    setDarkMode(stored ? stored === "dark" : true);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    document.body.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode, isReady]);

  const value = useMemo(
    () => ({
      darkMode,
      isReady,
      toggleTheme() {
        setDarkMode((current) => !current);
      },
      setDarkMode,
    }),
    [darkMode, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
