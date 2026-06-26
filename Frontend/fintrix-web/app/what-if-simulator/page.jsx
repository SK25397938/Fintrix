"use client";

import { useState } from "react";
import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { getApiBaseUrl } from "../../lib/api";
import { getAuthHeaders } from "../../lib/auth";

export default function WhatIfPage() {
  const API_BASE = getApiBaseUrl();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/what-if`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ question }),
      });
      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      const data = await response.json();
      setResult(response.ok ? data : { error: data?.detail || "Unable to evaluate the scenario." });
    } catch {
      setResult({ error: "Unable to connect to the What-If backend." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectedShell
      title="What-If Simulator"
      description="Submit a scenario and get a connected backend what-if response."
    >
      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        {[
          "I transfer 10 lakh abroad without declaring the purpose.",
          "A borrower defaults on a 2 crore loan and EMI is overdue.",
        ].map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => setQuestion(prompt)}
            className={`rounded-2xl border p-4 text-left text-base font-medium transition-all duration-300 ${
              darkMode
                ? "border-white/14 bg-white/10 text-white/90 hover:bg-white/14"
                : "border-fintrix-dark/10 bg-white text-fintrix-ink/80 hover:bg-[#f6faf3]"
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: I transfer 10 lakh abroad without declaring the purpose."
          className={`min-h-[120px] w-full rounded-2xl border p-4 text-base outline-none sm:min-h-[140px] ${
            darkMode
              ? "border-white/14 bg-white/10 text-white placeholder:text-white/70"
              : "border-fintrix-dark/10 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
          }`}
        />
        <button
          type="submit"
          className="w-full rounded-2xl bg-fintrix-accent px-5 py-3 text-base font-semibold text-fintrix-dark sm:w-auto"
        >
          {loading ? "Evaluating..." : "Run Scenario"}
        </button>
      </form>
      {result ? (
        <section
          className={`mt-6 rounded-2xl border p-5 ${
            darkMode
              ? "border-white/14 bg-[#08150f]/70 text-white/90"
              : "border-fintrix-dark/10 bg-white text-fintrix-ink"
          }`}
        >
          {result.error ? (
            <p className={`text-base font-medium ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{result.error}</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                  <div className="text-sm uppercase tracking-[0.2em] text-fintrix-accent">Compliance</div>
                  <div className="mt-2 text-lg font-semibold">{result.compliance_status || "Unknown"}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                  <div className="text-sm uppercase tracking-[0.2em] text-fintrix-accent">Risk Level</div>
                  <div className="mt-2 text-lg font-semibold">{result.risk_level || "Unknown"}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                  <div className="text-sm uppercase tracking-[0.2em] text-fintrix-accent">Rule Summary</div>
                  <div className={`mt-2 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{result.rule_summary || "No rule summary available."}</div>
                </div>
              </div>
              <div className={`mt-5 rounded-2xl border p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                <h2 className="text-lg font-semibold">Short explanation</h2>
                <p className={`mt-3 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                  {result.analysis || result.reason || "No explanation available."}
                </p>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <div className={`rounded-2xl border p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>What could happen next</h3>
                  <ul className={`mt-3 space-y-2 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                    {[
                      ...(result.what_could_happen_next?.immediate || []),
                      ...(result.what_could_happen_next?.regulatory || []),
                      ...(result.what_could_happen_next?.tax || []),
                    ]
                      .slice(0, 5)
                      .map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                  </ul>
                </div>
                <div className={`rounded-2xl border p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/10 bg-[#f8fbf5]"}`}>
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>What you should do</h3>
                  <ul className={`mt-3 space-y-2 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
                    {[
                      ...(result.what_should_you_do?.immediate_actions || []),
                      ...(result.what_should_you_do?.compliance_actions || []),
                      ...(result.what_should_you_do?.risk_mitigation || []),
                    ]
                      .slice(0, 5)
                      .map((item, index) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      ) : null}
    </ConnectedShell>
  );
}
