"use client";

import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";

const foundations = [
  {
    title: "What is fintech?",
    description:
      "Fintech is the use of technology to improve financial services such as payments, banking, lending, investing, insurance, and compliance.",
  },
  {
    title: "Why it matters",
    description:
      "It helps people and businesses move money faster, reduce friction, automate decisions, and access better financial tools with clearer digital experiences.",
  },
  {
    title: "Core areas",
    description:
      "Key areas include digital banking, payments, wealth tech, insurtech, regtech, lending platforms, fraud monitoring, and AI-assisted financial workflows.",
  },
];

const topicPaths = [
  {
    label: "Payments",
    description: "Understand UPI, cards, wallets, gateways, settlement, and payment failure handling.",
  },
  {
    label: "Banking",
    description: "Learn how digital banking products work across accounts, transfers, KYC, and customer operations.",
  },
  {
    label: "Compliance",
    description: "Explore reporting, AML, fraud controls, audit trails, and regulator-facing requirements.",
  },
  {
    label: "Investing",
    description: "Study markets, portfolios, risk, order flows, and how platforms present investment decisions.",
  },
];

const resources = [
  {
    title: "Khan Academy Finance & Capital Markets",
    description: "Useful for fundamentals like money, markets, interest, banking, and investing concepts.",
    href: "https://www.khanacademy.org/economics-finance-domain/core-finance",
  },
  {
    title: "Reserve Bank of India YouTube",
    description: "Helpful when you want regulator-facing explainers and official updates tied to banking in India.",
    href: "https://www.youtube.com/@ReserveBankofIndiaOfficial",
  },
  {
    title: "The Plain Bagel",
    description: "A strong channel for clear explanations on markets, risk, investing, and financial products.",
    href: "https://www.youtube.com/@ThePlainBagel",
  },
];

export default function LearnPage() {
  const { darkMode } = useTheme();
  return (
    <ConnectedShell
      title="Learn Fintech"
      description="A structured learning space with simple subsections so users can understand fintech, explore core topics, and find useful learning resources."
    >
      <div className="flex flex-wrap gap-3">
        <a
          href="#foundations"
          className={`rounded-full border px-4 py-2 text-base font-semibold transition-all duration-300 ${
            darkMode
              ? "border-white/12 bg-white/10 text-white/90 hover:bg-white/14"
              : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink hover:bg-fintrix-panel/80"
          }`}
        >
          Foundations
        </a>
        <a
          href="#paths"
          className={`rounded-full border px-4 py-2 text-base font-semibold transition-all duration-300 ${
            darkMode
              ? "border-white/12 bg-white/10 text-white/90 hover:bg-white/14"
              : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink hover:bg-fintrix-panel/80"
          }`}
        >
          Topic Paths
        </a>
        <a
          href="#fintrix-fit"
          className={`rounded-full border px-4 py-2 text-base font-semibold transition-all duration-300 ${
            darkMode
              ? "border-white/12 bg-white/10 text-white/90 hover:bg-white/14"
              : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink hover:bg-fintrix-panel/80"
          }`}
        >
          FinTrix Fit
        </a>
        <a
          href="#videos"
          className={`rounded-full border px-4 py-2 text-base font-semibold transition-all duration-300 ${
            darkMode
              ? "border-white/12 bg-white/10 text-white/90 hover:bg-white/14"
              : "border-fintrix-dark/10 bg-fintrix-panel text-fintrix-ink hover:bg-fintrix-panel/80"
          }`}
        >
          Videos & Links
        </a>
      </div>
      <section className="mt-10 scroll-mt-20">
        <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Foundations</h2>
        <p className={`mt-3 text-base ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>Master the fundamentals of fintech, finance, and compliance.</p>
      </section>

      <section className="mt-10 scroll-mt-20">
        <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Topic Paths</h2>
        <p className={`mt-3 text-base ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>Structured learning paths for different compliance domains.</p>
      </section>

      <section className="mt-10 scroll-mt-20">
        <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>FinTrix Fit</h2>
        <p className={`mt-3 text-base ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>Find resources tailored to your compliance needs.</p>
      </section>

      <section className="mt-10 scroll-mt-20">
        <h2 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Videos</h2>
        <p className={`mt-3 text-base ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>Watch in-depth tutorials and expert guidance.</p>
      </section>
      <section id="foundations" className="mt-8">
        <div className="text-sm uppercase tracking-[0.22em] text-fintrix-accent">Foundations</div>
        <h2 className={`mt-3 text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Start with the basics</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {foundations.map((item) => (
            <article
              key={item.title}
              className={`rounded-2xl border p-6 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/10 bg-fintrix-panel"}`}
            >
              <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{item.title}</h3>
              <p className={`mt-4 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="paths" className="mt-10">
        <div className="text-sm uppercase tracking-[0.22em] text-fintrix-accent">Topic Paths</div>
        <h2 className={`mt-3 text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Choose what you want to explore</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {topicPaths.map((item) => (
            <div key={item.label} className={`rounded-2xl border p-5 ${darkMode ? "border-white/14 bg-white/10" : "border-fintrix-dark/10 bg-fintrix-panel"}`}>
              <div className={`text-lg font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{item.label}</div>
              <p className={`mt-3 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fintrix-fit" className="mt-10">
        <div className="text-sm uppercase tracking-[0.22em] text-fintrix-accent">FinTrix Fit</div>
        <h2 className={`mt-3 text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Where FinTrix fits into learning</h2>
        <div className={`mt-5 rounded-2xl border p-6 ${darkMode ? "border-white/14 bg-fintrix-dark/65" : "border-fintrix-dark/10 bg-fintrix-panel"}`}>
          <p className={`text-base font-medium leading-8 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>
            FinTrix sits at the practical side of fintech learning. Instead of only defining concepts, it helps
            users explore live news, ask finance questions, test what-if scenarios, and evaluate rule-based
            outcomes in one place. That makes it useful for people who want to move from theory into applied
            understanding.
          </p>
        </div>
      </section>

      <section id="videos" className="mt-10">
        <div className="text-sm uppercase tracking-[0.22em] text-fintrix-accent">Videos & Links</div>
        <h2 className={`mt-3 text-2xl font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>Useful places to learn more</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {resources.map((item) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                darkMode
                  ? "border-white/14 bg-white/10 hover:bg-white/14"
                  : "border-fintrix-dark/10 bg-fintrix-panel hover:bg-fintrix-panel/80"
              }`}
            >
              <div className={`text-lg font-semibold ${darkMode ? "text-white" : "text-fintrix-ink"}`}>{item.title}</div>
              <p className={`mt-4 text-base font-medium leading-7 ${darkMode ? "text-white/88" : "text-fintrix-ink/80"}`}>{item.description}</p>
              <div className="mt-5 text-base font-semibold text-fintrix-accent">Open resource</div>
            </a>
          ))}
        </div>
      </section>
    </ConnectedShell>
  );
}
