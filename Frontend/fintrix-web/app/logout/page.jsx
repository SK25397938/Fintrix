"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { useTheme } from "../../components/ThemeProvider";

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { darkMode } = useTheme();

  useEffect(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  return (
    <main className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className={`rounded-[28px] border p-8 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl ${darkMode ? "border-white/18 bg-white/12 text-white" : "border-fintrix-dark/10 bg-white text-fintrix-ink"}`}>
          <div className={`text-sm ${darkMode ? "text-white/75" : "text-fintrix-muted"}`}>Signing you out...</div>
        </div>
      </div>
    </main>
  );
}
