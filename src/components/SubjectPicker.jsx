// src/components/SubjectPicker.jsx
// Props:
//   - value: "math" | "reading" | "vocab"
//   - onChange: (newSubject: string) => void
//   - dark?: boolean
// Optional:
//   - subjects?: string[] (default ["math","reading","vocab"])
//   - showSurprise?: boolean (default true)

import { useMemo, useRef } from "react";

export default function SubjectPicker({
  value,
  onChange,
  dark = false,
  subjects = ["math", "reading", "vocab"],
  showSurprise = true,
}) {
  const wrapRef = useRef(null);
  const idx = useMemo(() => Math.max(0, subjects.indexOf(value)), [subjects, value]);

  function setSubject(s) {
    if (!s || s === value) return;
    onChange?.(s);
  }

  function keyNav(e) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(e.key)) return;
    e.preventDefault();
    const cur = Math.max(0, subjects.indexOf(value));
    const clamp = (n) => Math.max(0, Math.min(n, subjects.length - 1));
    if (e.key === "ArrowLeft") setSubject(subjects[clamp(cur - 1)]);
    else if (e.key === "ArrowRight") setSubject(subjects[clamp(cur + 1)]);
    else if (e.key === "Home") setSubject(subjects[0]);
    else if (e.key === "End") setSubject(subjects[subjects.length - 1]);
    else if (e.key === "Enter" || e.key === " ") setSubject(subjects[cur]);
  }

  return (
    <div
      ref={wrapRef}
      role="tablist"
      aria-label="Choose subject"
      onKeyDown={keyNav}
      style={bar(dark)}
    >
      {subjects.map((s, i) => {
        const active = i === idx;
        return (
          <button
            key={s}
            role="tab"
            aria-selected={active}
            aria-controls={`subject-panel-${s}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setSubject(s)}
            title={`Switch to ${label(s)}`}
            style={chip(dark, active)}
          >
            {emoji(s)} {label(s)}
          </button>
        );
      })}
      {showSurprise && (
        <button
          onClick={() => {
            const pool = subjects.filter((s) => s !== value);
            const pick = pool[Math.floor(Math.random() * pool.length)] || value;
            setSubject(pick);
          }}
          title="Surprise me"
          style={ghost(dark)}
          aria-label="Surprise me"
        >
          🎲 Surprise
        </button>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function label(s) {
  const map = { math: "Math", reading: "Reading", vocab: "Vocab" };
  return map[s] || (s?.[0]?.toUpperCase() + s?.slice(1) || "Subject");
}
function emoji(s) {
  if (s === "math") return "➗";
  if (s === "reading") return "📚";
  if (s === "vocab") return "📝";
  return "▶︎";
}

/* ---------- styles ---------- */

const bar = (dark) => ({
  position: "sticky",
  top: 0,
  zIndex: 50,
  display: "flex",
  gap: 8,
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 12px",
  background: dark ? "rgba(12,12,14,0.75)" : "rgba(255,255,255,0.85)",
  backdropFilter: "saturate(180%) blur(6px)",
  borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
});

const chip = (dark, active) => ({
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  border: active
    ? "2px solid #2563EB"
    : dark
      ? "1px solid rgba(255,255,255,0.16)"
      : "1px solid rgba(0,0,0,0.12)",
  background: active
    ? (dark ? "rgba(37,99,235,0.2)" : "rgba(37,99,235,0.12)")
    : (dark ? "rgba(20,20,24,0.9)" : "#ffffff"),
  color: dark ? "#E5E7EB" : "#111827",
  transition: "transform 120ms ease, border-color 120ms ease",
});

const ghost = (dark) => ({
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  border: "1px dashed " + (dark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.18)"),
  background: "transparent",
  color: "inherit",
});
