// src/App.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lessons as ALL_LESSONS } from "./lessons";
import LessonCard from "./components/LessonCard";
import QuizCard from "./components/QuizCard";
import SubjectPicker from "./components/SubjectPicker";
import ExplainSheet from "./components/ExplainSheet";

/* ---------------- LocalStorage helpers ---------------- */
const LS = {
  DARK: "satx_dark",
  SUBJECT: "satx_selectedSubject",
  XP: "satx_xp",
  STREAK: "satx_streak",
  BEST: "satx_bestStreak",
  COMPLETED_PREFIX: "satx_completed_",
};
const readLS = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
};
const writeLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/* --------------- Tiny confetti + toast --------------- */
function tinyConfetti(x = 0.5, y = 0.55) {
  const el = document.createElement("div");
  el.textContent = "🎉";
  Object.assign(el.style, {
    position: "fixed",
    left: `${x * 100}vw`,
    top: `${y * 100}vh`,
    transform: "translate(-50%, -50%) scale(1.6)",
    pointerEvents: "none",
    zIndex: 9999,
    transition: "all 800ms cubic-bezier(.21,1,.21,1)",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = "translate(-50%, -120vh) rotate(540deg)";
    el.style.opacity = "0";
  });
  setTimeout(() => el.remove(), 900);
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1600);
  }, []);
  const ui = (
    <div style={{ position: "fixed", top: 76, left: 0, right: 0, display: "grid", placeItems: "center", zIndex: 60, pointerEvents: "none" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              backdropFilter: "saturate(160%) blur(6px)",
              background: "rgba(0,0,0,0.65)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
  return { add, ui };
}

/* ---------------- Mock “AI” explanation ---------------- */
function buildExplanation(quiz) {
  const correctIndex = quiz.answerIndex;
  const choices = quiz.choices || [];
  const correctText = choices[correctIndex];

  // Lightweight wrong-choice nudges to make it feel helpful
  const wrongWhy = (choice) => {
    // Generic templates—feel smart without backend:
    if (/^cannot/i.test(choice) || /cannot/i.test(choice)) {
      return "It’s tempting when info feels incomplete, but the prompt gives enough to decide.";
    }
    if (/^always|never|only/i.test(choice)) {
      return "Absolute language is risky on SAT—look for evidence that’s too strong.";
    }
    if (/^because|since/i.test(choice)) {
      return "Causal wording needs clear evidence; here the link isn’t proven.";
    }
    return "Plausible at first glance, but it doesn’t align best with the prompt’s core task.";
  };

  return {
    title: "Let’s break it down",
    bullets: [
      `✅ **Correct:** ${correctText}`,
      quiz.explanation
        ? `🧠 **Why it’s right:** ${quiz.explanation}`
        : "🧠 **Why it’s right:** It directly matches the rule/idea the prompt is testing.",
      "🚫 **Why others aren’t as good:**",
      ...choices
        .map((c, i) => (i === correctIndex ? null : `• ${c} — ${wrongWhy(c)}`))
        .filter(Boolean),
      "💡 **Remember:** Identify what the question is truly asking. Eliminate choices that are off-scope or too absolute.",
    ],
    tip: "Pro move: read the question stem twice and predict an answer before looking at choices.",
  };
}

/* ----------------------- App ----------------------- */
export default function App() {
  /* Theme */
  const [dark, setDark] = useState(() =>
    readLS(LS.DARK, window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false)
  );
  useEffect(() => writeLS(LS.DARK, dark), [dark]);
  useEffect(() => {
    document.documentElement.style.background = dark ? "#0b0c0f" : "#ffffff";
    document.documentElement.style.color = dark ? "#fafafa" : "#111111";
  }, [dark]);

  /* Subject */
  const [subject, setSubject] = useState(() => readLS(LS.SUBJECT, "math"));
  useEffect(() => writeLS(LS.SUBJECT, subject), [subject]);

  /* Feed filtered by subject */
  const feed = useMemo(() => ALL_LESSONS.filter((x) => x.subject === subject), [subject]);

  /* Completed quizzes per subject */
  const completedKey = `${LS.COMPLETED_PREFIX}${subject}`;
  const [completed, setCompleted] = useState(() => new Set(readLS(completedKey, [])));
  useEffect(() => writeLS(completedKey, Array.from(completed)), [completedKey, completed]);
  useEffect(() => {
    setCompleted(new Set(readLS(`${LS.COMPLETED_PREFIX}${subject}`, [])));
  }, [subject]);

  /* XP / Streak */
  const [xp, setXp] = useState(() => readLS(LS.XP, 0));
  const [streak, setStreak] = useState(() => readLS(LS.STREAK, 0));
  const [bestStreak, setBestStreak] = useState(() => readLS(LS.BEST, 0));
  // Track how many quizzes answered this session
const [answeredToday, setAnsweredToday] = useState(0);

  useEffect(() => writeLS(LS.XP, xp), [xp]);
  useEffect(() => writeLS(LS.STREAK, streak), [streak]);
  useEffect(() => writeLS(LS.BEST, bestStreak), [bestStreak]);

  const { add: toast, ui: Toasts } = useToast();

  /* Gate logic: only lock cards AFTER first incomplete quiz */
  const blockingIndex = useMemo(() => {
    const idx = feed.findIndex((it) => it.type === "quiz" && !completed.has(it.id));
    return idx;
  }, [feed, completed]);

  const isLocked = useCallback(
    (index) => {
      if (blockingIndex === -1) return false;
      return index > blockingIndex;
    },
    [blockingIndex]
  );

  // Optional: snap-back if scrolled past the block
  const containerRef = useRef(null);
  const lastSnapRef = useRef(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const sections = Array.from(el.children);
        // find section closest to top
        let closest = 0;
        let min = Infinity;
        sections.forEach((sec, i) => {
          const rect = sec.getBoundingClientRect();
          const dist = Math.abs(rect.top - (58 + 52));
          if (dist < min) {
            min = dist;
            closest = i;
          }
        });
        const allowedMax = blockingIndex === -1 ? sections.length - 1 : blockingIndex;
        if (closest > allowedMax && lastSnapRef.current !== allowedMax) {
          sections[allowedMax].scrollIntoView({ behavior: "smooth", block: "start" });
          lastSnapRef.current = allowedMax;
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [blockingIndex]);

  /* Quiz submit handlers */
  const handleCorrect = useCallback(
    (quizId) => {
      setAnsweredToday((n) => n + 1);   // NEW
      setCompleted((prev) => new Set(prev).add(quizId));
      setXp((prev) => prev + 10);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      tinyConfetti();
      toast("+10 XP • Correct!");
    },
    [bestStreak, toast]
  );

  const handleWrong = useCallback(() => {
    toast("Try another choice!");
  }, [toast]);

  const barPct = Math.min(streak / Math.max(10, bestStreak || 10), 1);

  /* -------- Explain with AI (mock) state -------- */
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainData, setExplainData] = useState(null); // {title, bullets[], tip}

  const openExplain = useCallback((quiz) => {
    const data = buildExplanation(quiz);
    setExplainData(data);
    setExplainOpen(true);
    window.scrollBy({ top: 1, behavior: "smooth" }); // nudge to avoid overlap on some mobiles

  }, []);
  const closeExplain = useCallback(() => setExplainOpen(false), []);

  /* --------------------- Render --------------------- */
  return (
    <div style={{ height: "100vh", overflow: "hidden", background: dark ? "#0b0c0f" : "#ffffff" }}>
      {/* Subject Picker */}
      <SubjectPicker value={subject} onChange={setSubject} dark={dark} />
     <div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "36px",     // ⬅️ top margin
    marginBottom: "8px"   // ⬅️ bottom margin
  }}
>
  <button
    onClick={() =>
      window.open(
        import.meta.env?.VITE_FEEDBACK_FORM_URL || "#",
        "_blank",
        "noopener,noreferrer"
      )
    }
    style={{
      padding: "10px 16px",
      borderRadius: 999,
      border: dark
        ? "1px solid rgba(255,255,255,0.16)"
        : "1px solid rgba(0,0,0,0.12)",
      background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
      color: dark ? "#E5E7EB" : "#111827",
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
      boxShadow: dark
        ? "0 4px 12px rgba(0,0,0,0.45)"
        : "0 4px 12px rgba(0,0,0,0.08)",
    }}
    title="Open feedback form"
  >
    ✨ Insider Feedback
  </button>
</div>


      {/* HUD */}
      <div
        style={{
          position: "sticky",
          top: 58,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          background: dark ? "rgba(12,12,14,0.6)" : "rgba(255,255,255,0.7)",
          backdropFilter: "saturate(180%) blur(6px)",
          borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge label="XP" value={xp} dark={dark} />
          <Badge label="Streak" value={streak} dark={dark} />
          <Badge label="Best" value={bestStreak} dark={dark} />
          <Badge label="Answered today" value={answeredToday} dark={dark} />

        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
          <div
            aria-label="streak progress"
            style={{
              position: "relative",
              flex: 1,
              height: 8,
              borderRadius: 999,
              background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${barPct * 100}%`,
                transition: "width 400ms ease",
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
              }}
            />
          </div>
          <button
            onClick={() => setDark((v) => !v)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.12)",
              background: "transparent",
              color: dark ? "#fafafa" : "#111",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Toasts */}
      {Toasts}

      {/* Feed */}
      <div
        ref={containerRef}
        style={{
          height: "calc(100vh - 110px)",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {feed.map((item, idx) => {
          const locked = isLocked(idx);
          const sectionStyle = {
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
            height: "calc(100vh - 110px)",
            position: "relative",
            borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
            background: dark ? "#0f1115" : "#ffffff",
          };

          if (item.type === "lesson") {
            return (
              <section key={item.id || `lesson-${idx}`} style={sectionStyle}>
                <LessonCard lesson={item} darkMode={dark} /> {/* uses lesson/src/title/caption :contentReference[oaicite:2]{index=2} */}
                {locked && <LockOverlay dark={dark} />}
              </section>
            );
          }

          if (item.type === "quiz") {
            // Only lock items AFTER the blocking quiz
            const gateShake = blockingIndex !== -1 && idx > blockingIndex;
            return (
              <section key={item.id || `quiz-${idx}`} style={sectionStyle}>
                <QuizCard
                  quiz={item}
                  darkMode={dark}
                  gateShake={gateShake}  /* uses quiz/prompt/choices/answerIndex/explanation :contentReference[oaicite:3]{index=3} */
                  onSubmit={(correct) => {
                    if (correct) handleCorrect(item.id);
                    else handleWrong();
                  }}
                />

                {/* Floating "Explain with AI" button (always available) */}
                <button
                  onClick={() => openExplain(item)}
                  style={{
                    position: "absolute",
                    right: 14,
                    bottom: 18,
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
                    color: dark ? "#E5E7EB" : "#111827",
                    fontWeight: 800,
                    fontSize: 13,
                    boxShadow: dark
                      ? "0 8px 24px rgba(0,0,0,0.45)"
                      : "0 8px 24px rgba(0,0,0,0.08)",
                    cursor: "pointer",
                  }}
                >
                  💡 Explain with AI
                </button>

                {locked && idx !== blockingIndex && <LockOverlay dark={dark} />}
              </section>
            );
          }

          return (
            <section key={`unknown-${idx}`} style={sectionStyle}>
              <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
                <div style={{ opacity: 0.6 }}>Unsupported card type</div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Explain with AI Sheet */}
      <ExplainSheet open={explainOpen} onClose={closeExplain} dark={dark}>
        {explainData && (
          <div style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{explainData.title}</h3>
            <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
              {explainData.bullets.map((b, i) => (
                <li key={i} style={{ lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: sanitize(b) }} />
              ))}
            </ul>
            <div style={{ fontSize: 13, opacity: 0.8 }}>✨ {explainData.tip}</div>
          </div>
        )}
      </ExplainSheet>
    </div>
  );
}

/* ---------------- Small UI bits ---------------- */
function Badge({ label, value, dark }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        color: dark ? "#fff" : "#111",
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function LockOverlay({ dark }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background: dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.45)",
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          background: dark ? "rgba(20,20,24,0.92)" : "rgba(255,255,255,0.96)",
          border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
          color: dark ? "#fff" : "#111",
          fontWeight: 800,
          fontSize: 13,
          boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        🔒 Answer the previous quiz to unlock
      </div>
    </div>
  );
}

/* very tiny sanitizer for bold/italics; avoids scripts */
function sanitize(html) {
  return String(html).replace(/</g, "&lt;").replace(/&lt;(b|i|strong|em)&gt;/g, "<$1>").replace(/&lt;\/(b|i|strong|em)&gt;/g, "</$1>");
}
