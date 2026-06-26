"use client";

function formatTimestamp(value) {
  if (!value) return "";
  const input = typeof value === "string" && /\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistorySidebar({
  darkMode,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  isMobileOpen,
  onToggleMobile,
}) {
  const panelClasses = `flex min-h-0 flex-col overflow-hidden border shadow-soft ${
    darkMode
      ? "border-white/14 bg-[#0d2948] text-white"
      : "border-fintrix-dark/10 bg-white text-fintrix-ink"
  }`;

  const content = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-5">
        <h2 className="text-lg font-semibold">History</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewChat}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              darkMode
                ? "bg-white/12 text-white hover:bg-white/18"
                : "bg-fintrix-accent text-fintrix-dark hover:opacity-90"
            }`}
          >
            New Chat
          </button>
          <button
            type="button"
            onClick={onToggleMobile}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition xl:hidden ${
              darkMode
                ? "border-white/14 bg-white/10 text-white hover:bg-white/18"
                : "border-fintrix-dark/10 bg-fintrix-bg text-fintrix-ink hover:bg-fintrix-accent/70"
            }`}
            aria-label="Close chat history"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {sessions.length ? (
          <div className="space-y-2">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    isActive
                      ? darkMode
                        ? "border-fintrix-accent/60 bg-fintrix-accent/20"
                        : "border-fintrix-dark/20 bg-fintrix-accent/40"
                      : darkMode
                        ? "border-white/10 bg-white/5 hover:bg-white/10"
                        : "border-fintrix-dark/10 bg-fintrix-bg/40 hover:bg-fintrix-accent/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{session.title || "New chat"}</p>
                      <p className={`mt-1 text-xs ${darkMode ? "text-white/70" : "text-fintrix-ink/65"}`}>
                        {formatTimestamp(session.updatedAt || session.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                        darkMode
                          ? "border-white/14 text-white/85 hover:bg-white/12"
                          : "border-fintrix-dark/15 text-fintrix-ink hover:bg-fintrix-bg"
                      }`}
                      aria-label="Delete chat"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-2xl border px-4 py-4 text-sm ${darkMode ? "border-white/10 bg-white/5 text-white/80" : "border-fintrix-dark/10 bg-fintrix-bg/40 text-fintrix-ink/75"}`}>
            No chat history yet.
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside className={`${panelClasses} hidden rounded-3xl xl:flex`}>
        {content}
      </aside>

      <div className={`fixed inset-x-0 bottom-0 top-[88px] z-[90] sm:top-[104px] xl:hidden ${isMobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close chat history"
          onClick={onToggleMobile}
          className={`absolute inset-0 bg-black/45 transition-opacity duration-200 ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`${panelClasses} absolute left-0 top-0 h-full w-[min(86vw,360px)] rounded-r-[24px] transition-transform duration-300 ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
