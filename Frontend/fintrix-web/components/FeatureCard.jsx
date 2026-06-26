import Link from "next/link";

const iconMap = {
  spark: {
    light: ["/ai-agent-logo-lightpng.png", "/ai-agent-logo.png"],
    dark: ["/ai-agent-logo.png"],
  },
  branch: {
    light: ["/what-if-logo-light.png", "/what-if-logo.png"],
    dark: ["/what-if-logo.png"],
  },
  chart: {
    light: ["/evaluation-logo-light.png", "/evaluation-logo.png"],
    dark: ["/evaluation-logo.png"],
  },
};

export default function FeatureCard({ title, description, icon, href, darkMode = false }) {
  const iconSet = iconMap[icon];
  const iconCandidates = darkMode ? iconSet?.dark || [] : iconSet?.light || [];
  const iconSrc = iconCandidates[0] || "";

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[300px] w-full transform flex-col items-center gap-4 overflow-hidden rounded-2xl border p-8 text-center transition-all duration-300 hover:-translate-y-1 sm:p-10 ${
        darkMode ? "border-white/10 bg-white text-fintrix-dark" : "border-fintrix-dark/10 bg-white text-fintrix-ink"
      }`}
    >
      {/* circular icon at top (inside flow) */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 bg-white p-2 shadow-lg sm:h-24 sm:w-24">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={`${title} logo`}
            className="h-full w-full object-contain"
            onError={(event) => {
              const currentIndex = iconCandidates.findIndex((candidate) => event.currentTarget.src.endsWith(candidate));
              const nextSrc = iconCandidates[currentIndex + 1];
              if (!nextSrc) return;
              event.currentTarget.src = nextSrc;
            }}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center text-sm font-semibold ${darkMode ? "text-white/80" : "text-fintrix-dark/70"}`}>
            {icon?.toUpperCase?.() || ""}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col items-center justify-center gap-3">
        <h3 className="text-2xl font-semibold leading-tight sm:text-3xl text-fintrix-dark">{title}</h3>

        <p className="max-w-[32rem] text-sm font-medium leading-7 sm:text-base text-fintrix-ink/78">{description}</p>

        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-full border px-4 py-2 text-sm font-semibold border-fintrix-dark/10 bg-white text-fintrix-dark">Open</span>
        </div>
      </div>
    </Link>
  );
}
