"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import Navbar from "./Navbar";

export default function ConnectedShell({ title, description, children, hideHeader = false, compact = false }) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isReady, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <main className={`min-h-screen px-3 pb-5 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8 ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
        <div className="mx-auto max-w-6xl">
          <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />
        </div>
        <div className="mx-auto mt-8 w-full max-w-6xl sm:mt-10">
          <div className={`rounded-[24px] border p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:rounded-[28px] sm:p-8 ${darkMode ? "border-white/18 bg-white/12 text-white" : "border-fintrix-dark/10 bg-white text-fintrix-ink"}`}>
            <div className={`text-sm ${darkMode ? "text-white/75" : "text-fintrix-muted"}`}>Checking your session...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen px-3 pb-5 pt-20 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8 ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
      <div className="mx-auto max-w-6xl">
        <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />
      </div>

      <div
        className={`mx-auto mt-8 w-full max-w-6xl rounded-[24px] border shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:mt-10 sm:rounded-[28px] ${
          compact ? "p-2 sm:p-4" : "p-4 sm:p-8"
        } ${
          darkMode
            ? "border-white/18 bg-white/12 text-white"
            : "border-fintrix-dark/10 bg-white text-fintrix-ink"
        }`}
      >
        {!hideHeader ? (
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl lg:text-4xl">{title}</h1>
              <p className={`mt-4 max-w-3xl text-base font-medium leading-7 sm:text-lg sm:leading-8 ${darkMode ? "text-white/85" : "text-fintrix-muted"}`}>
                {description}
              </p>
            </div>
          </div>
        ) : null}
        <div className={hideHeader ? "" : "mt-6 sm:mt-8"}>{children}</div>
      </div>
    </main>
  );
}
