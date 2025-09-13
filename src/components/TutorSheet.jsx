// src/components/TutorSheet.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * TutorSheet: bottom-sheet chat UI for interactive SAT tutor.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - subject?: "math" | "reading" | "vocab" | string
 *  - quiz?: {
 *      prompt?: string,
 *      choices?: string[],
 *      passage?: string,
 *      answerIndex?: number,
 *      topic?: string,
 *      id?: string
 *    }
 *  - startingQuestion?: string   // optional: seed user's first message
 *  - sessionId?: string          // optional: for localStorage thread persistence
 *
 * No other files required; this component POSTs directly to /api/tutor.
 */

export default function TutorSheet({
  open,
  onClose,
  subject,
  quiz,
  startingQuestion,
  sessionId = "default",
}) {
  const [messages, setMessages] = useState(() => loadThread(sessionId));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mockBadge, setMockBadge] = useState(null); // string | null
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Build context packet for the API (helps tutoring quality)
  const context = useMemo(() => {
    return {
      subject: subject || quiz?.subject || "other",
      topic: quiz?.topic || undefined,
      question: quiz?.prompt || undefined,
      choices: Array.isArray(quiz?.choices) ? quiz.choices : undefined,
      passage: quiz?.passage || undefined,
      userAnswer: undefined,
      isCorrect: undefined,
    };
  }, [subject, quiz]);

  // Autofocus & escape to close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Seed a greeting once per new session if thread is empty
  useEffect(() => {
    if (!open) return;
    if (messages.length > 0) return;

    const greet = {
      role: "assistant",
      content:
        "Hi! I’m your SAT tutor. Tell me what you’re working on, and I’ll guide you step by step. Want a hint or the first step?",
    };
    let seed = [greet];
    if (startingQuestion && startingQuestion.trim()) {
      seed = [...seed, { role: "user", content: startingQuestion.trim() }];
      // immediately send it
      setMessages(seed);
      persistThread(sessionId, seed);
      // Call tutor with the seeded question
      void sendToTutor(seed, context);
    } else {
      setMessages(seed);
      persistThread(sessionId, seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]); // intentional: don't depend on startingQuestion to avoid reseeding

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Core: call /api/tutor with the running thread
  async function sendToTutor(currentMessages, ctx) {
    setLoading(true);
    setMockBadge(null);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, context: ctx }),
      });
      if (!res.ok) throw new Error("Tutor API failed");
      const data = await res.json();
      const reply = (data?.reply || "").trim();
      const sugg = Array.isArray(data?.suggestions) ? data.suggestions : [];
      setSuggestions(sugg);
      if (data?.mock) setMockBadge("Mock mode (local)");
      const next = [...currentMessages, { role: "assistant", content: reply || fallbackReply(ctx) }];
      setMessages(next);
      persistThread(sessionId, next);
    } catch (e) {
      const next = [...currentMessages, { role: "assistant", content: fallbackReply(context) }];
      setMessages(next);
      persistThread(sessionId, next);
      setSuggestions(["Give me a hint", "Show the first step", "Explain my mistake"]);
      setMockBadge("Offline fallback");
    } finally {
      setLoading(false);
    }
  }

  function fallbackReply(ctx) {
    const subj = ctx?.subject ? ` (${ctx.subject})` : "";
    return `Let’s reason it out${subj}. First, restate the question in your own words. What is it asking for exactly? If there are choices, which ones can you eliminate and why?`;
  }

  function onSend(textFromUI) {
    const text = (textFromUI ?? input).trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    persistThread(sessionId, next);
    void sendToTutor(next, context);
  }

  function onSuggestionClick(s) {
    if (!s) return;
    onSend(s);
  }

  if (!open) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800 }}>Tutor Mode</span>
            {mockBadge && (
              <span title="Helpful dev badge" style={styles.badge}>
                {mockBadge}
              </span>
            )}
          </div>
          <button style={styles.close} onClick={onClose} aria-label="Close tutor">
            ✕
          </button>
        </div>

        {/* Context strip (optional, collapsible in future) */}
        <ContextStrip subject={subject} quiz={quiz} />

        {/* Message list */}
        <div ref={listRef} style={styles.list} aria-live="polite" aria-atomic="false">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.content} />
          ))}
          {loading && <Typing />}
        </div>

        {/* Suggestion chips */}
        {suggestions?.length > 0 && (
          <div style={styles.chipsRow}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => onSuggestionClick(s)} style={styles.chip}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          style={styles.composerRow}
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask for a hint, first step, or explain your thinking…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={styles.input}
            aria-label="Message the tutor"
          />
          <button type="submit" disabled={loading || !input.trim()} style={styles.sendBtn}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Small UI bits ---------- */

function ContextStrip({ subject, quiz }) {
  const parts = [];
  if (subject) parts.push(cap(subject));
  if (quiz?.topic) parts.push(quiz.topic);
  if (quiz?.prompt) {
    const p = quiz.prompt.length > 72 ? quiz.prompt.slice(0, 69) + "…" : quiz.prompt;
    parts.push(`Q: ${p}`);
  }
  if (!parts.length) return null;
  return (
    <div style={styles.contextStrip} title="Current context">
      {parts.join(" • ")}
    </div>
  );
}

function Bubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: isUser ? "#2563EB" : "rgba(255,255,255,0.06)",
          color: isUser ? "#fff" : "inherit",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "8px 12px",
          fontSize: 14,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 2px", opacity: 0.85 }}>
      <span style={{ fontSize: 12 }}>Tutor is typing</span>
      <span style={styles.dots} aria-hidden>•••</span>
    </div>
  );
}

/* ---------- Local storage helpers ---------- */

function persistThread(id, msgs) {
  try {
    localStorage.setItem(`satx_tutor_${id}`, JSON.stringify(msgs));
  } catch {}
}
function loadThread(id) {
  try {
    const s = localStorage.getItem(`satx_tutor_${id}`);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

/* ---------- Styles ---------- */

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
  },
  sheet: {
    width: "100%",
    maxWidth: 760,
    background: "var(--bg, #111)",
    color: "var(--fg, #eee)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
    padding: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  close: {
    border: "none",
    background: "transparent",
    color: "inherit",
    fontSize: 20,
    cursor: "pointer",
  },
  badge: {
    fontSize: 12,
    opacity: 0.85,
    padding: "2px 8px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
  },
  contextStrip: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 12,
    opacity: 0.85,
  },
  list: {
    height: 300,
    overflowY: "auto",
    padding: "6px 2px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  chipsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "transparent",
    color: "inherit",
    fontSize: 13,
    cursor: "pointer",
  },
  composerRow: {
    marginTop: 10,
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "transparent",
    color: "inherit",
    padding: "10px 12px",
    fontSize: 14,
  },
  sendBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    fontWeight: 700,
    cursor: "pointer",
  },
  dots: {
    fontSize: 20,
    letterSpacing: 2,
    animation: "pulse 1.4s infinite",
  },
};

/* ---------- small utils ---------- */
function cap(s) { return (s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }
