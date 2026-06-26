"use client";

import { useState } from "react";
import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { getApiBaseUrl } from "../../lib/api";
import { getAuthHeaders } from "../../lib/auth";

const domains = [
  { value: "forex", label: "Forex" },
  { value: "lending", label: "Lending" },
  { value: "trading", label: "Trading" },
  { value: "bonds", label: "Bonds" },
];

const declarationModes = [
  { value: "false", label: "Not Declared" },
  { value: "true", label: "Declared" },
];

export default function EvaluationPage() {
  const API_BASE = getApiBaseUrl();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const [domain, setDomain] = useState("forex");
  const [amount, setAmount] = useState("30000000");
  const [declared, setDeclared] = useState("false");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/rules/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          input_data: {
            domain,
            amount: Number(amount || 0),
            declared: declared === "true",
          },
          debug: true,
        }),
      });
      if (response.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      const data = await response.json();
      setResult(response.ok ? data : { error: data?.detail || "Unable to run the evaluation." });
    } catch {
      setResult({ error: "Unable to connect to the evaluation backend." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConnectedShell
      title="Evaluation Simulator"
      description="Run a structured evaluation against the connected S92 rules engine."
    >
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
          <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Domain</div>
          <div className={`mt-2 text-base font-medium ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>Choose the scenario type you want to test.</div>
        </div>
        <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
          <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Amount</div>
          <div className={`mt-2 text-base font-medium ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>Use a realistic transaction or exposure value.</div>
        </div>
        <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
          <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Declared</div>
          <div className={`mt-2 text-base font-medium ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>Toggle whether the activity was properly declared.</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
          <label className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Choose domain</label>
          <div className="mt-3 flex flex-wrap gap-3">
            {domains.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setDomain(item.value)}
                className={`rounded-full px-4 py-2 text-base font-semibold transition-all duration-300 ${
                  domain === item.value
                    ? "bg-fintrix-accent text-fintrix-dark shadow-lg"
                    : darkMode
                      ? "border border-white/12 bg-white/8 text-white/90 hover:bg-white/12"
                      : "border border-fintrix-dark/15 bg-white text-fintrix-ink hover:bg-fintrix-accent/25"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
            <label className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Amount</label>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={`mt-3 w-full rounded-2xl border p-4 text-base outline-none ${
                darkMode
                  ? "border-white/12 bg-fintrix-dark text-white placeholder:text-white/70"
                  : "border-fintrix-dark/15 bg-white text-fintrix-ink placeholder:text-fintrix-ink/70"
              }`}
              placeholder="Enter amount"
            />
          </div>

          <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/15 bg-white"}`}>
            <label className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Declaration status</label>
            <div className="mt-3 flex flex-wrap gap-3">
              {declarationModes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDeclared(item.value)}
                  className={`rounded-full px-4 py-2 text-base font-semibold transition-all duration-300 ${
                    declared === item.value
                    ? "bg-fintrix-accent text-fintrix-dark shadow-lg"
                    : darkMode
                      ? "border border-white/12 bg-white/8 text-white/90 hover:bg-white/12"
                      : "border border-fintrix-dark/15 bg-white text-fintrix-ink hover:bg-fintrix-accent/25"
                }`}
              >
                {item.label}
              </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-fintrix-accent px-5 py-3 text-base font-semibold text-fintrix-dark sm:w-auto"
        >
          {loading ? "Running..." : "Run Evaluation"}
        </button>
      </form>

      {result ? (
        <section className={`mt-6 rounded-2xl border p-5 ${
          darkMode
            ? "border-white/14 bg-fintrix-dark/70 text-white/90"
            : "border-fintrix-dark/15 bg-white text-fintrix-ink"
        }`}>
          {result.error ? (
            <p className={`text-base font-medium ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>{result.error}</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/15 bg-white"}`}>
                  <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Rules Checked</div>
                  <div className="mt-2 text-2xl font-semibold">{result.total_rules ?? 0}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/15 bg-white"}`}>
                  <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Matches Found</div>
                  <div className="mt-2 text-2xl font-semibold">{result.match_count ?? 0}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/15 bg-white"}`}>
                  <div className={`text-sm uppercase tracking-[0.2em] ${darkMode ? "text-fintrix-accent" : "text-fintrix-dark"}`}>Result</div>
                  <div className={`mt-2 text-base font-medium leading-6 ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>
                    {result.rule_summary?.summary || "No summary available."}
                  </div>
                </div>
              </div>

              <div className={`mt-5 rounded-2xl border p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/15 bg-white"}`}>
                <h2 className="text-lg font-semibold">Small explanation</h2>
                <p className={`mt-3 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>
                  {result.match_count
                    ? `This scenario triggered ${result.match_count} rule${result.match_count === 1 ? "" : "s"}. Review the matched rule names below and adjust the declaration, domain, or amount before proceeding.`
                    : `This scenario did not trigger any active rule violations across ${result.total_rules ?? 0} rules checked. It looks safe based on the current rule set and the inputs you entered.`}
                </p>
              </div>

              {Array.isArray(result.matched_rules) && result.matched_rules.length ? (
                <div className={`mt-5 rounded-2xl border p-5 ${darkMode ? "border-white/10 bg-white/5" : "border-fintrix-dark/15 bg-white"}`}>
                  <h3 className={`text-base font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Matched rules</h3>
                  <div className="mt-3 grid gap-3">
                    {result.matched_rules.map((rule) => (
                      <div
                        key={rule.rule_id}
                        className={`rounded-2xl border p-4 text-base font-medium ${
                          darkMode
                            ? "border-white/10 bg-white/5 text-white/88"
                            : "border-fintrix-dark/15 bg-white text-fintrix-ink"
                        }`}
                      >
                        <div className={`font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{rule.title || rule.rule_title || rule.rule_id}</div>
                        <div className={`mt-1 ${darkMode ? "text-white/88" : "text-fintrix-ink"}`}>{rule.description || rule.reason || "Rule matched this scenario."}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </ConnectedShell>
  );
}
