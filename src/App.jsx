// src/App.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lessons as ALL_LESSONS } from "./lessons";
import LessonCard from "./components/LessonCard";
import QuizCard from "./components/QuizCard";
import SubjectPicker from "./components/SubjectPicker";
import ExplainSheet from "./components/ExplainSheet";
import TutorSheet from "./components/TutorSheet";
import MasterySheet from "./components/MasterySheet";
import SettingsSheet from "./components/SettingsSheet";
import { Adaptive } from "./lib/adaptiveEngine";

/* ---------------- LocalStorage helpers ---------------- */
const LS = {
  DARK: "satx_dark",
  SUBJECT: "satx_selectedSubject",
  XP: "satx_xp",
  STREAK: "satx_streak",
  BEST: "satx_bestStreak",
  COMPLETED_PREFIX: "satx_completed_",
  STATS: "satx_stats", // { explainClicks, answeredTodayCount, answeredTodayDate }
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
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{ position: "fixed", top: 76, left: 0, right: 0, display: "grid", placeItems: "center", zIndex: 60, pointerEvents: "none" }}
    >
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

/* ---------------- Local mock explanation (fallback) ---------------- */
function buildExplanationLocal(quiz) {
  const correctIndex = quiz.answerIndex;
  const choices = quiz.choices || [];
  const correctText = choices[correctIndex];
  const wrongWhy = (choice) => {
    if (/^cannot/i.test(choice) || /cannot/i.test(choice)) return "Tempting when info feels incomplete, but the prompt gives enough.";
    if (/^always|never|only/i.test(choice)) return "Absolute language is risky—look for evidence that’s too strong.";
    if (/^because|since/i.test(choice)) return "Causal wording needs clear evidence; here the link isn’t proven.";
    return "Plausible at first glance, but not the best match for the ask.";
  };
  const bullets = [
    `✅ Correct: ${correctText}`,
    quiz.explanation ? `🧠 Why it's right: ${quiz.explanation}` : "🧠 Why it's right: It matches the rule/idea being tested.",
    "🚫 Why others aren’t as good:",
    ...choices.map((c, i) => (i === correctIndex ? null : `• ${c} — ${wrongWhy(c)}`)).filter(Boolean),
    "💡 Remember: Identify the core ask. Eliminate off-scope or overly absolute choices.",
  ];
  return { bullets, tips: ["Predict before you peek at choices."], nextSteps: ["Try one more in this topic."] };
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

  /* Subject (sync with ?subject= query) */
  const initialSubject = (() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("subject");
    return q || readLS(LS.SUBJECT, "math");
  })();
  const [subject, setSubject] = useState(initialSubject);
  useEffect(() => writeLS(LS.SUBJECT, subject), [subject]);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("subject", subject);
    window.history.replaceState({}, "", url);
  }, [subject]);

  /* Initialize adaptive model once */
  useEffect(() => {
    Adaptive.initModel(ALL_LESSONS);
  }, []);

  /* Completed quizzes per subject (gating) */
  const completedKey = `${LS.COMPLETED_PREFIX}${subject}`;
  const [completed, setCompleted] = useState(() => new Set(readLS(completedKey, [])));
  useEffect(() => writeLS(completedKey, Array.from(completed)), [completedKey, completed]);
  useEffect(() => setCompleted(new Set(readLS(`${LS.COMPLETED_PREFIX}${subject}`, []))), [subject]);

  /* XP / Streak */
  const [xp, setXp] = useState(() => readLS(LS.XP, 0));
  const [streak, setStreak] = useState(() => readLS(LS.STREAK, 0));
  const [bestStreak, setBestStreak] = useState(() => readLS(LS.BEST, 0));
  useEffect(() => writeLS(LS.XP, xp), [xp]);
  useEffect(() => writeLS(LS.STREAK, streak), [streak]);
  useEffect(() => writeLS(LS.BEST, bestStreak), [bestStreak]);

  /* Stats: daily answered + explain clicks (persist & auto-reset daily) */
  const todayStr = new Date().toISOString().slice(0, 10);
  const initialStats = readLS(LS.STATS, { explainClicks: 0, answeredTodayCount: 0, answeredTodayDate: todayStr });
  const [stats, setStats] = useState(() =>
    initialStats.answeredTodayDate === todayStr ? initialStats : { explainClicks: 0, answeredTodayCount: 0, answeredTodayDate: todayStr }
  );
  useEffect(() => writeLS(LS.STATS, stats), [stats]);

  /* Toasts */
  const { add: toast, ui: Toasts } = useToast();

  /* Build the ADAPTIVE FEED for the current subject */
  const [adaptiveFeed, setAdaptiveFeed] = useState(() =>
    Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed })
  );
  useEffect(() => {
    setAdaptiveFeed(Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed }));
  }, [subject, completed]);

  /* Gate logic on this adaptive feed */
  const blockingIndex = useMemo(() => {
    const idx = adaptiveFeed.findIndex((it) => it.type === "quiz" && !completed.has(it.id));
    return idx;
  }, [adaptiveFeed, completed]);
  const isLocked = useCallback(
    (index) => (blockingIndex === -1 ? false : index > blockingIndex),
    [blockingIndex]
  );

  /* Snap-back if scrolled past the block */
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
        let closest = 0;
        let min = Infinity;
        sections.forEach((sec, i) => {
          const rect = sec.getBoundingClientRect();
          const dist = Math.abs(rect.top - (58 + 52)); // HUD offset
          if (dist < min) { min = dist; closest = i; }
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

  /* Keyboard navigation */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e) => {
      const sections = Array.from(el.children);
      const tops = sections.map((sec) => Math.abs(sec.getBoundingClientRect().top - (58 + 52)));
      let i = tops.indexOf(Math.min(...tops));
      const clamp = (n) => Math.max(0, Math.min(n, sections.length - 1));
      const allowedMax = blockingIndex === -1 ? sections.length - 1 : blockingIndex;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        i = clamp(Math.min(i + 1, allowedMax));
        sections[i].scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        i = clamp(i - 1);
        sections[i].scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "Home") {
        sections[0].scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (e.key === "End") {
        sections[allowedMax].scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blockingIndex]);

  /* -------- Explain with AI (real API w/ fallback) -------- */
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainData, setExplainData] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);

  async function tryExplain(quiz) {
    setStats((s) => ({ ...s, explainClicks: (s.explainClicks || 0) + 1 }));

    const payload = {
      question: quiz.prompt || quiz.title || "Question",
      userAnswer: "",
      isCorrect: false,
      topic: quiz.topic || subject,
      passage: quiz.passage || null,
      choices: quiz.choices || null,
      correctIndex: typeof quiz.answerIndex === "number" ? quiz.answerIndex : null,
    };

    setExplainOpen(true);
    setExplainLoading(true);
    setExplainError(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Explain API not ready");
      const data = await res.json();
      const safe = {
        bullets: Array.isArray(data.bullets) ? data.bullets : [],
        tips: Array.isArray(data.tips) ? data.tips : [],
        nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
        mock: !!data.mock,
      };
      if (safe.bullets.length === 0) throw new Error("Empty response");
      setExplainData(safe);
    } catch (e) {
      const local = buildExplanationLocal(quiz);
      setExplainData({ ...local, mock: true });
      setExplainError("Using local helper (API fallback)");
    } finally {
      setExplainLoading(false);
      window.scrollBy({ top: 1, behavior: "smooth" });
    }
  }
  const closeExplain = useCallback(() => setExplainOpen(false), []);

  /* -------- Tutor Mode (interactive chat) -------- */
  const [tutorOpen, setTutorOpen] = useState(false);
  const openTutor = useCallback(() => setTutorOpen(true), []);
  const closeTutor = useCallback(() => setTutorOpen(false), []);

  /* -------- Mastery + Settings sheets -------- */
  const [masteryOpen, setMasteryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const resetMastery = useCallback(() => {
    Adaptive.resetModel();
    Adaptive.initModel(ALL_LESSONS);
    setAdaptiveFeed(Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed }));
  }, [subject, completed]);

  const resetProgress = useCallback(() => {
    // clear XP/Streak/Completed/Stats for all subjects
    ["satx_xp","satx_streak","satx_bestStreak","satx_completed_math","satx_completed_reading","satx_completed_vocab","satx_stats"]
      .forEach((k) => localStorage.removeItem(k));
    setXp(0); setStreak(0); setBestStreak(0); setCompleted(new Set());
    setAdaptiveFeed(Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed: new Set() }));
  }, [subject]);

  /* Quiz submit handlers (update Adaptive model too) */
  const { add: toastAdd } = useToast(); // not used; kept pattern-safe

  const handleCorrect = useCallback(
    (quizId, itemObj) => {
      setStats((s) => {
        const today = new Date().toISOString().slice(0, 10);
        const sameDay = s.answeredTodayDate === today;
        return {
          explainClicks: s.explainClicks || 0,
          answeredTodayCount: (sameDay ? s.answeredTodayCount : 0) + 1,
          answeredTodayDate: today,
        };
      });

      setCompleted((prev) => new Set(prev).add(quizId));
      setXp((prev) => prev + 10);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });

      Adaptive.recordResult(itemObj, true);
      setAdaptiveFeed(Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed: new Set([...completed, quizId]) }));

      tinyConfetti();
    },
    [bestStreak, subject, completed]
  );

  const handleWrong = useCallback((itemObj) => {
    Adaptive.recordResult(itemObj, false);
    setAdaptiveFeed(Adaptive.buildAdaptiveFeed(subject, ALL_LESSONS, { count: 12, completed }));
  }, [subject, completed]);

  const barPct = Math.min(streak / Math.max(10, bestStreak || 10), 1);

  /* --------------------- Render --------------------- */
  return (
    <div style={{ height: "100vh", overflow: "hidden", background: dark ? "#0b0c0f" : "#ffffff" }}>
      {/* Subject Picker */}
      <SubjectPicker value={subject} onChange={setSubject} dark={dark} />

      {/* HUD */}
      <div
        role="region"
        aria-label="Progress HUD"
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
          <Badge label="Answered today" value={stats.answeredTodayCount || 0} dark={dark} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={openTutor}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
              background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
              color: dark ? "#E5E7EB" : "#111827",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
            title="Open Tutor Chat"
            aria-label="Open Tutor Chat"
          >
            🧠 Tutor Chat
          </button>

          <button
            onClick={() => setMasteryOpen(true)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
              background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
              color: dark ? "#E5E7EB" : "#111827",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
            title="Open Mastery"
            aria-label="Open Mastery"
          >
            📊 Mastery
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
              background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
              color: dark ? "#E5E7EB" : "#111827",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
            title="Open Settings"
            aria-label="Open Settings"
          >
            ⚙️ Settings
          </button>

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
            aria-label="Toggle dark mode"
          >
            {dark ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Toasts */}
      {Toasts}

      {/* Feed (ADAPTIVE) */}
      <div ref={containerRef} className="feed" role="main" aria-label="Lesson and quiz feed">
        {adaptiveFeed.map((item, idx) => {
          const locked = isLocked(idx);
          return (
            <section
              key={item.id || `${item.type}-${idx}`}
              className="card"
              style={{
                position: "relative",
                borderBottom: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)",
                background: dark ? "#0f1115" : "#ffffff",
              }}
            >
              {item.type === "lesson" && (
                <>
                  <LessonCard lesson={item} darkMode={dark} />
                  {locked && <LockOverlay dark={dark} />}
                </>
              )}

              {item.type === "quiz" && (
                <>
                  <QuizCard
                    quiz={item}
                    darkMode={dark}
                    gateShake={blockingIndex !== -1 && idx > blockingIndex}
                    onSubmit={(correct) => {
                      if (correct) {
                        handleCorrect(item.id, item);
                      } else {
                        handleWrong(item);
                      }
                    }}
                  />

                  {/* Floating actions: Explain + Tutor */}
                  <div style={{ position: "absolute", right: 14, bottom: 18, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => tryExplain(item)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
                        color: dark ? "#E5E7EB" : "#111827",
                        fontWeight: 800,
                        fontSize: 13,
                        boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.08)",
                        cursor: "pointer",
                      }}
                      aria-label="Explain this question with AI"
                    >
                      💡 Explain
                    </button>
                    <button
                      onClick={openTutor}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 999,
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
                        color: dark ? "#E5E7EB" : "#111827",
                        fontWeight: 800,
                        fontSize: 13,
                        boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.45)" : "0 8px 24px rgba(0,0,0,0.08)",
                        cursor: "pointer",
                      }}
                      aria-label="Open Tutor Chat"
                      title="Chat with tutor about this question"
                    >
                      🧠 Tutor
                    </button>
                  </div>

                  {locked && idx !== blockingIndex && <LockOverlay dark={dark} />}
                </>
              )}

              {item.type !== "lesson" && item.type !== "quiz" && (
                <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
                  <div style={{ opacity: 0.6 }}>Unsupported card type</div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Explain with AI Sheet */}
      <ExplainSheet
        open={explainOpen}
        onClose={closeExplain}
        dark={dark}
        badge={explainData?.mock ? "Mock mode (local)" : undefined}
      >
        {explainLoading && (
          <div style={{ padding: 6 }}>
            <div style={{ fontSize: 14, opacity: 0.85 }}>Generating a quick explanation…</div>
          </div>
        )}
        {!explainLoading && explainError && (
          <div style={{ padding: 6, color: dark ? "#FCA5A5" : "#B91C1C" }}>{explainError}</div>
        )}
        {!explainLoading && explainData && (
          <div style={{ display: "grid", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
              {explainData.mock ? "Let’s break it down (local)" : "Let’s break it down"}
            </h3>
            {Array.isArray(explainData.bullets) && explainData.bullets.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                {explainData.bullets.map((b, i) => (
                  <li key={i} style={{ lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            )}
            {Array.isArray(explainData.tips) && explainData.tips.length > 0 && (
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                <strong>Tips:</strong> {explainData.tips.join(" • ")}
              </div>
            )}
            {Array.isArray(explainData.nextSteps) && explainData.nextSteps.length > 0 && (
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                <strong>Next:</strong> {explainData.nextSteps.join(" • ")}
              </div>
            )}
          </div>
        )}
      </ExplainSheet>

      {/* Tutor Chat Sheet */}
      <TutorSheet
        open={tutorOpen}
        onClose={closeTutor}
        subject={subject}
        startingQuestion="I’m stuck—can you give me the first step?"
        sessionId={`tutor-${subject}`}
      />

      {/* Mastery & Settings Sheets */}
      <MasterySheet
        open={masteryOpen}
        onClose={() => setMasteryOpen(false)}
        subject={subject}
        dark={dark}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        dark={dark}
        onToggleDark={() => setDark((v) => !v)}
        onResetMastery={resetMastery}
        onResetProgress={resetProgress}
        subject={subject}
      />
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
