"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import FeatureCard from "../components/FeatureCard";
import HeroVideo from "../components/HeroVideo";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "AI Agent",
    description:
      "Automate compliance tracking and query regulatory guidelines using AI with guided workflows and clear compliance summaries.",
    icon: "spark",
    href: "/ai-agent",
  },
  {
    title: "What-If Simulator",
    description:
      "Test the impact of potential regulatory changes and simulate compliance scenarios before policy execution.",
    icon: "branch",
    href: "/what-if-simulator",
  },
  {
    title: "Evaluation Simulator",
    description:
      "Analyze compliance risks, rules, and audit performance across operating decisions and organizational policies.",
    icon: "chart",
    href: "/evaluation-simulator",
  },
];

export default function HomePage() {
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
      <main className={`min-h-screen px-3 py-5 sm:px-6 sm:py-8 lg:px-8 ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
        <div className="mx-auto max-w-6xl">
          <Navbar darkMode={darkMode} onToggleTheme={toggleTheme} />
          <div className={`mt-24 rounded-[28px] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:mt-28 sm:p-8 ${darkMode ? "border-white/18 bg-white/12 text-white" : "border-fintrix-dark/10 bg-white text-fintrix-ink"}`}>
            <div className={`text-sm ${darkMode ? "text-white/75" : "text-fintrix-muted"}`}>Checking your session...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      id="home"
      className={`relative overflow-hidden transition-colors duration-300 ${
        darkMode ? "bg-fintrix-dark text-white" : "bg-fintrix-bg text-fintrix-ink"
      }`}
    >
      <Navbar
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        darkModeNavItemsBlack
      />

      <section className="flex min-h-screen w-full flex-col">
        <div className={`w-full ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
          <HeroVideo />
        </div>

        <div className={`w-full ${darkMode ? "bg-fintrix-dark" : "bg-fintrix-bg"}`}>
        <div className="mx-auto w-full max-w-[1300px] px-6 pb-16 pt-6 sm:px-10 sm:pb-20 sm:pt-8 lg:px-12">
          <section id="features" className="mt-0">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} darkMode={darkMode} />
              ))}
            </div>
          </section>

          <div
            id="brand"
            className={`pt-8 text-center text-[20px] font-semibold ${
              darkMode ? "text-fintrix-accent" : "text-fintrix-dark"
            }`}
          >
            FinTrix
          </div>

          <section className="mx-auto mt-6 max-w-4xl text-center">
            <h2 className={`text-2xl font-semibold tracking-[-0.03em] sm:text-3xl ${darkMode ? "text-white" : "text-fintrix-ink"}`}>
              About the website
            </h2>
            <p className={`mt-4 text-base font-medium leading-8 sm:text-lg ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
              FinTrix is a modern regulatory compliance workspace built to help users monitor updates more clearly
              through live news, AI-assisted guidance, scenario testing, and rule-based evaluation. It brings together tracking,
              compliance support, and community-driven discussion in one clean interface so users can move from
              understanding a regulation to actually implementing it with confidence.
            </p>
          </section>
        </div>
        </div>
      </section>
    </main>
  );
}
