// SubjectPicker.jsx
import React from "react";

const SUBJECTS = [
  { key: "math", label: "Math", icon: MathIcon },
  { key: "reading", label: "Reading", icon: ReadingIcon },
  { key: "vocab", label: "Vocab", icon: VocabIcon },
];

export default function SubjectPicker({ value, onChange, dark }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(6px)",
        background: dark ? "rgba(12,12,12,0.5)" : "rgba(255,255,255,0.6)",
        padding: "10px 12px",
        borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {SUBJECTS.map(({ key, label, icon: Icon }) => {
          const active = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-pressed={active}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                border: active
                  ? "1px solid transparent"
                  : dark
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(0,0,0,0.12)",
                background: active
                  ? (dark ? "linear-gradient(0deg,#2a2a2a,#2a2a2a)" : "linear-gradient(0deg,#f2f2f2,#f2f2f2)")
                  : "transparent",
                color: dark ? "#fafafa" : "#111",
                cursor: "pointer",
                transition: "transform 120ms ease, background 160ms ease",
              }}
              onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Icon filled={active} dark={dark} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MathIcon({ filled, dark }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 6h6M7 3v6M14 5h6M14 9h6M14 13h6M4 14l6 6M10 14l-6 6"
        fill="none"
        stroke={filled ? (dark ? "#fff" : "#111") : (dark ? "#ddd" : "#333")}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReadingIcon({ filled, dark }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 5a3 3 0 0 1 3-3h13v16a3 3 0 0 1-3 3H4z"
        fill="none"
        stroke={filled ? (dark ? "#fff" : "#111") : (dark ? "#ddd" : "#333")}
        strokeWidth="1.8"
      />
      <path
        d="M7 7h9M7 10h9M7 13h6"
        stroke={filled ? (dark ? "#fff" : "#111") : (dark ? "#ddd" : "#333")}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VocabIcon({ filled, dark }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 19V5a2 2 0 0 1 2-2h12"
        fill="none"
        stroke={filled ? (dark ? "#fff" : "#111") : (dark ? "#ddd" : "#333")}
        strokeWidth="1.8"
      />
      <path
        d="M8 15l2-6 2 6M9 13h2M14 10h6v8l-3-2-3 2z"
        fill="none"
        stroke={filled ? (dark ? "#fff" : "#111") : (dark ? "#ddd" : "#333")}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
