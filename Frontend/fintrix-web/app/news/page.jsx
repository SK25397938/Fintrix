"use client";

import { useEffect, useState } from "react";
import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";
import { getApiBaseUrl } from "../../lib/api";

export default function NewsPage() {
  const API_BASE = getApiBaseUrl();
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadNews() {
      try {
        const response = await fetch(`${API_BASE}/api/news`, { cache: "no-store" });
        if (!response.ok) {
          if (active) setItems([]);
          return;
        }
        const data = await response.json();
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (active) setItems([]);
      }
    }

    loadNews();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ConnectedShell
      title="News"
      description="Live finance and compliance news pulled directly from the connected S92 backend."
    >
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {items.length ? (
          items.slice(0, 8).map((item, index) => (
            <article
              key={`${item.id ?? index}-${item.title}`}
              className={`overflow-hidden rounded-2xl border ${
                darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/10 bg-white"
              }`}
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title || "News image"}
                  className="h-44 w-full object-cover sm:h-52"
                />
              ) : (
                <div
                  className={`relative flex h-44 w-full items-center justify-center overflow-hidden text-base font-medium sm:h-52 ${
                    darkMode ? "bg-white/6 text-white/72" : "bg-[#edf7fb] text-fintrix-ink/70"
                  }`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,253,251,0.28),_transparent_45%),linear-gradient(135deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))]" />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${darkMode ? "border-white/12 bg-white/8" : "border-fintrix-dark/10 bg-white"}`}>
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
                        <path d="m7 15 2.8-2.8a1 1 0 0 1 1.4 0L13 14l1.2-1.2a1 1 0 0 1 1.4 0L17 15" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="10" cy="9" r="1.2" />
                      </svg>
                    </div>
                    <span className="rounded-full border border-current/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                      Image unavailable
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 sm:p-5">
                <p className={`text-sm font-semibold uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>
                  {item.source || "FinTrix"}
                </p>
                <h2 className={`mt-3 text-lg font-semibold sm:text-xl ${darkMode ? "text-white" : "text-fintrix-dark"}`}>
                  {item.title}
                </h2>
                <p className={`mt-3 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                  {item.description || item.content || "No description available."}
                </p>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-4 inline-flex text-base font-semibold ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}
                  >
                    Read article
                  </a>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div
            className={`rounded-2xl border p-5 text-base font-medium ${
              darkMode ? "border-white/14 bg-white/10 text-white/88" : "border-fintrix-dark/10 bg-white text-fintrix-ink/80"
            }`}
          >
            No news available from the backend right now.
          </div>
        )}
      </div>
    </ConnectedShell>
  );
}
