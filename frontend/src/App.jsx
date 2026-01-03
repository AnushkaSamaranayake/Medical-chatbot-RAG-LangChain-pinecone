import React, { useEffect, useMemo, useRef, useState } from "react";
export const API_BASE = import.meta.env.VITE_API_BASE_URL;

const BRAND = "MediChat";
const STORAGE_THEME_KEY = "medichat_theme";
const STORAGE_THREADS_KEY = "medichat_threads_v1";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

function IconSun(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 2v2M12 20v2M4 12H2M22 12h-2M5.64 5.64 4.22 4.22M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMoon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 13.2A7.5 7.5 0 0 1 10.8 3 9 9 0 1 0 21 13.2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M22 2 11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 2 15 22l-4-9-9-4 20-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function newId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const initialAssistantMessage = {
  id: newId(),
  role: "assistant",
  createdAt: Date.now(),
  content:
    "Hi! I’m a medical information assistant. I can help explain symptoms, medications, and next steps — but I’m not a substitute for a clinician.\n\nIf this is an emergency (e.g., chest pain, trouble breathing, severe bleeding), call local emergency services right now.",
};

const quickChips = [
  "I have a headache—what could cause it?",
  "What are red flags I should watch for?",
  "How should I take this medication safely?",
  "Can you suggest questions to ask my doctor?",
];

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Replace this with your real backend call.
 * Expected output: a string assistant message.
 */
async function callChatApi({ message, thread }) {
  // Example:
  // const res = await fetch("/api/chat", { method:"POST", headers:{...}, body: JSON.stringify({ message, thread }) });
  // const data = await res.json();
  // return data.reply;

  console.log("API call with message:", message);
  console.log("Thread:", thread);
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.answer;

  // Demo response (no backend)
  // await new Promise((r) => setTimeout(r, 650));
  // return (
  //   "Thanks — I can help with general info.\n\n" +
  //   "1) How long has this been going on?\n" +
  //   "2) Any other symptoms (fever, shortness of breath, rash, vomiting, severe pain)?\n" +
  //   "3) Any relevant history (conditions, meds, allergies)?\n\n" +
  //   "If you share those, I’ll suggest common causes and what to watch for."
  // );
}

export default function App() {
  // Theme
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Threads (simple local history)
  const [threads, setThreads] = useState(() => {
    const stored = safeParse(localStorage.getItem(STORAGE_THREADS_KEY), null);
    if (stored?.length) return stored;
    return [
      {
        id: newId(),
        title: "New chat",
        createdAt: Date.now(),
        messages: [initialAssistantMessage],
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
  }, [threads]);

  const [activeThreadId, setActiveThreadId] = useState(() => threads[0]?.id);
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId]
  );

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    // auto-scroll to bottom on new messages
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeThread?.messages?.length, isTyping]);

  function updateActiveThread(updater) {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? updater(t) : t))
    );
  }

  function newChat() {
    const t = {
      id: newId(),
      title: "New chat",
      createdAt: Date.now(),
      messages: [initialAssistantMessage],
    };
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
    setInput("");
  }

  function deleteChat(id) {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (!next.length) {
        const t = {
          id: newId(),
          title: "New chat",
          createdAt: Date.now(),
          messages: [initialAssistantMessage],
        };
        setActiveThreadId(t.id);
        return [t];
      }
      if (activeThreadId === id) setActiveThreadId(next[0].id);
      return next;
    });
  }

  function renameFromFirstUserMessage(thread) {
    const firstUser = thread.messages.find((m) => m.role === "user");
    if (!firstUser) return thread.title;
    const text = firstUser.content.trim().split("\n")[0].slice(0, 36);
    return text || thread.title;
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setInput("");

    const userMsg = {
      id: newId(),
      role: "user",
      createdAt: Date.now(),
      content: trimmed,
    };

    updateActiveThread((t) => {
      const next = {
        ...t,
        messages: [...t.messages, userMsg],
      };
      return {
        ...next,
        title: t.title === "New chat" ? renameFromFirstUserMessage(next) : t.title,
      };
    });

    setIsTyping(true);

    try {
      const reply = await callChatApi({ message: trimmed, thread: activeThread });
      const assistantMsg = {
        id: newId(),
        role: "assistant",
        createdAt: Date.now(),
        content: reply,
      };
      updateActiveThread((t) => ({
        ...t,
        messages: [...t.messages, assistantMsg],
      }));
    } catch (e) {
      updateActiveThread((t) => ({
        ...t,
        messages: [
          ...t.messages,
          {
            id: newId(),
            role: "assistant",
            createdAt: Date.now(),
            content:
              "Sorry — I couldn’t reach the server. Please try again in a moment.",
          },
        ],
      }));
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 md:block">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {BRAND}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Medical info assistant
              </div>
            </div>

            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <IconSun className="h-5 w-5" />
              ) : (
                <IconMoon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            onClick={newChat}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 dark:bg-slate-100 dark:text-slate-900"
          >
            <IconPlus className="h-5 w-5" />
            New chat
          </button>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Chats
            </div>

            <div className="max-h-[calc(100vh-180px)] space-y-2 overflow-auto pr-1">
              {threads.map((t) => {
                const active = t.id === activeThreadId;
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "group flex items-center justify-between gap-2 rounded-2xl border px-3 py-2",
                      active
                        ? "border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-900/60"
                    )}
                  >
                    <button
                      onClick={() => setActiveThreadId(t.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="truncate text-sm font-medium">
                        {t.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      onClick={() => deleteChat(t.id)}
                      className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 group-hover:inline-flex dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <IconTrash className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar (mobile + title) */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {activeThread?.title ?? "Chat"}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Not for emergencies • Seek professional care when needed
                </div>
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={newChat}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="New chat"
                  title="New chat"
                >
                  <IconPlus className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-label="Toggle theme"
                  title="Toggle theme"
                >
                  {theme === "dark" ? (
                    <IconSun className="h-5 w-5" />
                  ) : (
                    <IconMoon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Messages */}
          <section className="flex-1">
            <div className="mx-auto flex h-full max-w-3xl flex-col px-4">
              <div
                ref={listRef}
                className="flex-1 space-y-4 overflow-auto py-6"
              >
                {(activeThread?.messages ?? []).map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}

                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-9 w-9 shrink-0 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 grid place-items-center text-xs font-bold">
                      MC
                    </div>
                    <div className="max-w-[85%] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <TypingDots />
                    </div>
                  </div>
                )}

                {/* Quick chips (only when the user hasn’t typed yet) */}
                {activeThread?.messages?.filter((x) => x.role === "user").length === 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Try asking
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickChips.map((c) => (
                        <button
                          key={c}
                          onClick={() => sendMessage(c)}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-slate-200 pb-5 pt-4 dark:border-slate-800">
                <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(input);
                        }
                      }}
                      rows={1}
                      placeholder="Describe your symptoms or question… (Shift+Enter for a new line)"
                      className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isTyping}
                      className={cn(
                        "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-semibold",
                        (!input.trim() || isTyping)
                          ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          : "bg-slate-900 text-white hover:opacity-95 dark:bg-slate-100 dark:text-slate-900"
                      )}
                      aria-label="Send"
                      title="Send"
                    >
                      <IconSend className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="px-3 pb-1 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    This provides general information only and may be inaccurate. For urgent concerns, seek emergency care.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "mt-1 h-9 w-9 shrink-0 rounded-2xl grid place-items-center text-xs font-bold",
          isUser
            ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
            : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
        )}
      >
        {isUser ? "You" : "MC"}
      </div>

      <div className={cn("max-w-[85%]")}>
        <div
          className={cn(
            "rounded-3xl border px-4 py-3 text-sm shadow-sm whitespace-pre-wrap",
            isUser
              ? "border-slate-200 bg-slate-100 text-slate-900 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-50"
              : "border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
          )}
        >
          {msg.content}
        </div>
        <div
          className={cn(
            "mt-1 text-[11px] text-slate-500 dark:text-slate-400",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatTime(msg.createdAt)}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s] dark:bg-slate-500" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s] dark:bg-slate-500" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 dark:bg-slate-500" />
    </div>
  );
}
