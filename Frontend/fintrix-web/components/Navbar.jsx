"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const navItems = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Blog", href: "/blog" },
  { label: "Learn", href: "/learn" },
];

function LogoMark() {
  const logoSrc = "/fintrix-logo-white.png";
  return (
    <div className="flex items-center min-w-0">
      <img
        src={logoSrc}
        alt="FinTrix"
        className="block h-9 w-[140px] object-contain object-left sm:h-10 sm:w-[168px] lg:h-11 lg:w-[180px]"
      />
    </div>
  );
}

function ThemeIcon({ darkMode }) {
  if (darkMode) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar({ darkMode, onToggleTheme, forceDark = false, themeLabelOverride = null, darkModeNavItemsBlack = false }) {
  const pathname = usePathname();
  const { isAuthenticated, isReady } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const useDarkStyle = forceDark || darkMode;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) {
        setIsMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] px-3 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <nav
        className={`mx-auto max-w-6xl rounded-2xl border px-3 py-3 backdrop-blur-2xl transition-all duration-300 sm:px-4 lg:px-5 ${
          useDarkStyle
            ? "border-white/15 bg-white/10 text-white shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
            : "border-fintrix-dark/15 bg-white/35 text-fintrix-dark shadow-[0_22px_60px_rgba(5,47,95,0.16)]"
        }`}
        style={{ backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      >
        <div className="flex items-center justify-between gap-3 xl:hidden">
          <Link href="/" className="min-w-0 flex-1 rounded-2xl transition-opacity duration-300 hover:opacity-85">
            <LogoMark />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Toggle theme preview"
              onClick={onToggleTheme}
              className={`group inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                useDarkStyle
                  ? darkModeNavItemsBlack
                    ? "border-black/20 bg-white/35 text-black"
                    : "border-white/15 bg-white/10 text-white"
                  : "border-fintrix-dark/15 bg-white/55 text-fintrix-dark"
              }`}
            >
              <ThemeIcon darkMode={darkMode} />
            </button>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMenuOpen((value) => !value)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border shadow-md transition-all duration-300 ${
                useDarkStyle
                  ? "border-white/15 bg-white/10 text-white"
                  : "border-fintrix-dark/15 bg-white/55 text-fintrix-dark"
              }`}
            >
              <MenuIcon open={isMenuOpen} />
            </button>
          </div>
        </div>

        <div className="hidden xl:flex xl:items-center xl:justify-between xl:gap-6">
          <Link href="/" className="rounded-2xl transition-opacity duration-300 hover:opacity-85">
            <LogoMark />
          </Link>

          <div className="flex items-center gap-5">
            <div className={`flex items-center rounded-2xl p-1.5 ${useDarkStyle ? "bg-white/8" : "bg-white/12"}`}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-fintrix-accent text-fintrix-dark shadow-md"
                        : useDarkStyle
                          ? darkModeNavItemsBlack
                            ? "text-black hover:bg-black/10 hover:text-black"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                          : "text-[#173019] hover:bg-white/20 hover:text-fintrix-dark"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Toggle theme preview"
                onClick={onToggleTheme}
                className={`group inline-flex min-w-[112px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                  useDarkStyle
                    ? darkModeNavItemsBlack
                      ? "border-black/20 bg-white/35 text-black"
                      : "border-white/15 bg-white/10 text-white"
                    : "border-fintrix-dark/15 bg-white/55 text-fintrix-dark"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fintrix-accent/20 transition-all duration-300 group-hover:bg-fintrix-accent/30">
                  <ThemeIcon darkMode={darkMode} />
                </div>
                <span className="hidden text-sm font-semibold sm:inline">
                  {themeLabelOverride ?? (darkMode ? "Dark" : "Light")}
                </span>
              </button>

              {isReady ? (
                <Link
                  href={isAuthenticated ? "/logout" : "/login"}
                  className="inline-flex min-w-[104px] items-center justify-center rounded-2xl bg-fintrix-dark px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#09551d] hover:shadow-xl"
                >
                  {isAuthenticated ? "Logout" : "Login"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 xl:hidden ${isMenuOpen ? "max-h-[420px] pt-4" : "max-h-0"}`}>
          <div className="space-y-3">
            <div className={`grid grid-cols-1 gap-2 rounded-2xl p-1.5 sm:grid-cols-2 ${useDarkStyle ? "bg-white/8" : "bg-white/12"}`}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-fintrix-accent text-fintrix-dark shadow-md"
                        : useDarkStyle
                          ? darkModeNavItemsBlack
                            ? "text-black hover:bg-black/10 hover:text-black"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                          : "text-[#173019] hover:bg-white/20 hover:text-fintrix-dark"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {isReady ? (
              <Link
                href={isAuthenticated ? "/logout" : "/login"}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-fintrix-dark px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#09551d] hover:shadow-xl"
              >
                {isAuthenticated ? "Logout" : "Login"}
              </Link>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}
