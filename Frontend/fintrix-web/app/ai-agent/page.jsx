"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectedShell from "../../components/ConnectedShell";
import { useTheme } from "../../components/ThemeProvider";
import { getApiBaseUrl } from "../../lib/api";
import { getAuthHeaders } from "../../lib/auth";
import { useAuth } from "../../components/AuthProvider";
import HistorySidebar from "../../components/ai-agent/HistorySidebar";
import ChatPanel from "../../components/ai-agent/ChatPanel";

function normalizeResult(payload) {
  if (typeof payload === "string") {
    return {
      answer: payload,
      key_points: [],
      sources: [],
      helpful_links: [],
      source_reliability: null,
      mode: "AI",
      is_off_topic: false,
    };
  }

  return {
    answer: payload?.answer || "No answer available.",
    key_points: Array.isArray(payload?.key_points) ? payload.key_points : [],
    sources: Array.isArray(payload?.sources) ? payload.sources : [],
    helpful_links: Array.isArray(payload?.helpful_links) ? payload.helpful_links : [],
    source_reliability:
      payload?.source_reliability && typeof payload.source_reliability === "object"
        ? payload.source_reliability
        : null,
    mode: payload?.mode || "AI",
    is_off_topic: payload?.is_off_topic === true,
  };
}

function buildErrorResult(message) {
  return {
    answer: message,
    key_points: [],
    sources: [],
    helpful_links: [],
    source_reliability: null,
    mode: "ERROR",
    is_off_topic: false,
  };
}

function normalizeChatMessages(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.reduce((acc, entry, index) => {
    if (entry.role === "user") {
      acc.push({
        id: `history-user-${index}`,
        role: "user",
        text: entry.content,
      });
      return acc;
    }

    if (entry.role === "assistant") {
      let parsed = null;
      try {
        parsed = JSON.parse(entry.content);
      } catch {
        parsed = entry.content;
      }

      acc.push({
        id: `history-assistant-${index}`,
        role: "assistant",
        result: normalizeResult(parsed),
      });
    }

    return acc;
  }, []);
}

export default function AiAgentPage() {
  const API_BASE = getApiBaseUrl();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { isAuthenticated, isReady, logout } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHistoryOpenMobile, setIsHistoryOpenMobile] = useState(false);
  const initializedSessionId = useRef(null);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  async function authorizedFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      logout();
      router.replace("/login");
      return null;
    }

    return response;
  }

  async function fetchSessions(preferredSessionId = null) {
    const response = await authorizedFetch(`${API_BASE}/api/chats`);
    if (!response || !response.ok) {
      return;
    }

    const data = await response.json();
    const list = Array.isArray(data) ? data : [];
    setSessions(list);

    const targetId = preferredSessionId ?? activeSessionId;
    if (targetId && list.some((item) => item.id === targetId)) {
      return;
    }

    if (!activeSessionId && list.length) {
      setActiveSessionId(list[0].id);
    }
  }

  async function loadSessionMessages(sessionId) {
    const response = await authorizedFetch(`${API_BASE}/api/chats/${sessionId}/messages`);
    if (!response || !response.ok) {
      return;
    }

    const data = await response.json();
    setMessages(normalizeChatMessages(data));
  }

  async function createSessionFromTitle(title) {
    const response = await authorizedFetch(`${API_BASE}/api/chats`, {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    if (!response || !response.ok) {
      return null;
    }

    const created = await response.json();
    setSessions((current) => [created, ...current.filter((item) => item.id !== created.id)]);
    return created;
  }

  async function appendMessage(sessionId, role, content) {
    const response = await authorizedFetch(`${API_BASE}/api/chats/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ role, content }),
    });

    if (!response || !response.ok) {
      return null;
    }

    return response.json();
  }

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE, isReady, isAuthenticated]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    if (initializedSessionId.current === activeSessionId) {
      initializedSessionId.current = null;
      return;
    }

    loadSessionMessages(activeSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSessionId, API_BASE, isReady, isAuthenticated]);

  async function handleSendQuestion(askedQuestion) {
    if (!askedQuestion.trim() || loading) {
      return;
    }

    setLoading(true);

    let sessionId = activeSessionId;
    let sessionTitle = askedQuestion.trim().slice(0, 40);

    if (!sessionId) {
      const created = await createSessionFromTitle(sessionTitle);
      if (!created?.id) {
        setLoading(false);
        return;
      }
      sessionId = created.id;
      initializedSessionId.current = sessionId;
      setActiveSessionId(sessionId);
      setIsHistoryOpenMobile(false);
    }

    const timestamp = Date.now();
    const userMessageId = `user-${timestamp}`;
    const pendingId = `assistant-pending-${timestamp}`;

    setMessages((current) => [
      ...current,
      { id: userMessageId, role: "user", text: askedQuestion },
      { id: pendingId, role: "assistant", pending: true },
    ]);

    try {
      const appendRes = await appendMessage(sessionId, "user", askedQuestion);

      if (!appendRes) {
        // Append to chat failed; remove pending and show a friendly error
        setMessages((current) =>
          current.map((message) =>
            message.id === pendingId
              ? {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  result: buildErrorResult("Failed to save your message. Try again."),
                }
              : message
          )
        );
        setLoading(false);
        return;
      }

      const aiResponse = await authorizedFetch(`${API_BASE}/api/ai/session/message`, {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          message: askedQuestion,
          persist: false,
        }),
      });

      if (!aiResponse) {
        setMessages((current) =>
          current.map((message) =>
            message.id === pendingId
              ? {
                  id: `assistant-${Date.now()}`,
                  role: "assistant",
                  result: buildErrorResult("Unable to connect to the AI backend."),
                }
              : message
          )
        );
        setLoading(false);
        return;
      }

      let payload = null;
      try {
        payload = await aiResponse.json();
      } catch {
        payload = null;
      }

      const normalized = aiResponse.ok
        ? normalizeResult(payload)
        : buildErrorResult((payload && payload.detail) || "Unable to get an answer right now.");

      // Try to persist assistant message in chats table; ignore failure but log
      try {
        await appendMessage(sessionId, "assistant", JSON.stringify(normalized));
      } catch (err) {
        console.warn("Failed to persist assistant message:", err);
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                result: normalized,
              }
            : message
        )
      );

      // Refresh sessions to keep list in sync; ignore failures
      try {
        await fetchSessions(sessionId);
      } catch (err) {
        console.warn("fetchSessions failed:", err);
      }
    } catch {
      const fallback = buildErrorResult("Unable to connect to the AI backend.");
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                result: fallback,
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelectSession(sessionId) {
    setActiveSessionId(sessionId);
    setIsHistoryOpenMobile(false);
  }

  async function handleDeleteSession(sessionId) {
    const response = await authorizedFetch(`${API_BASE}/api/chats/${sessionId}`, {
      method: "DELETE",
    });

    if (!response || !response.ok) {
      return;
    }

    setSessions((current) => {
      const nextSessions = current.filter((session) => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        const next = nextSessions[0] || null;
        setActiveSessionId(next?.id || null);
        if (!next) {
          setMessages([]);
        }
      }
      return nextSessions;
    });
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setIsHistoryOpenMobile(false);
  }

  return (
    <ConnectedShell
      title="AI Agent"
      description="Ask the connected AI backend a finance or compliance question."
      hideHeader
      compact
    >
      <div className="min-h-[calc(100dvh-128px)] xl:min-h-[60vh]">
        <div className="grid min-h-0 grid-cols-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <HistorySidebar
            darkMode={darkMode}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            onNewChat={handleNewChat}
            isMobileOpen={isHistoryOpenMobile}
            onToggleMobile={() => setIsHistoryOpenMobile((open) => !open)}
          />

          <ChatPanel
            darkMode={darkMode}
            apiBase={API_BASE}
            messages={messages}
            loading={loading}
            onSendQuestion={handleSendQuestion}
            onNewChat={handleNewChat}
            onOpenHistory={() => setIsHistoryOpenMobile(true)}
            activeTitle={activeSession?.title || ""}
          />
        </div>
      </div>
    </ConnectedShell>
  );
}
