// src/components/StartStrip.jsx
// A compact CTA bar to start a subject track fast.
// Usage:
//   <StartStrip dark={dark} onSelect={(subj) => setSubject(subj)} />
//
// Optional props:
// - dark?: boolean
// - subjects?: string[] (defaults ["math","reading","vocab"])
// - onFeedback?: () => void  // if you want a tiny feedback link inline

export default function StartStrip({
  dark = false,
  subjects = ["math", "reading", "vocab"],
  onSelect,
  onFeedback,
}) {
  const s = style(dark);
  const label = (x) => {
    const m = { math: "Math", reading: "Reading", vocab: "Vocab" };
    return m[x] || (x?.[0]?.toUpperCase() + x?.slice(1) || "Start");
  };

  function surpriseMe() {
    const pool = subjects.length ? subjects : ["math", "reading", "vocab"];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    onSelect?.(pick);
  }

  return (
    <div style={s.wrap} role="group" aria-label="Start a subject">
      <div style={s.row}>
        {subjects.map((subj) => (
          <button
            key={subj}
            style={s.btn}
            onClick={() => onSelect?.(subj)}
            aria-label={`Start ${label(subj)}`}
            title={`Start ${label(subj)}`}
          >
            ▶︎ {label(subj)}
          </button>
        ))}

        <button
          style={s.btnGhost}
          onClick={surpriseMe}
          aria-label="Surprise me"
          title="Surprise me"
        >
          🎲 Surprise me
        </button>
      </div>

      <div style={s.metaRow}>
        <small style={s.hint}>
          Swipe to browse. Answer to unlock the next card.
        </small>
        <a
          href={import.meta.env?.VITE_FEEDBACK_FORM_URL || "#"}
          target="_blank"
          rel="noreferrer"
          style={s.link}
          onClick={(e) => {
            if (!import.meta.env?.VITE_FEEDBACK_FORM_URL) e.preventDefault();
            onFeedback?.();
          }}
        >
          ✨ Insider Feedback
        </a>
      </div>
    </div>
  );
}

/* ---------------- styles ---------------- */

function style(dark) {
  return {
    wrap: {
      width: "min(820px, 96vw)",
      margin: "0 auto",
      padding: 12,
      borderRadius: 16,
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
      border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
      boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.25)" : "0 8px 24px rgba(0,0,0,0.05)",
    },
    row: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    btn: {
      padding: "10px 14px",
      borderRadius: 999,
      border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
      background: dark ? "rgba(20,20,24,0.9)" : "#ffffff",
      color: dark ? "#E5E7EB" : "#111827",
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
      minWidth: 120,
    },
    btnGhost: {
      padding: "10px 14px",
      borderRadius: 999,
      border: "1px dashed " + (dark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.18)"),
      background: "transparent",
      color: "inherit",
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
      minWidth: 140,
    },
    metaRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 8,
      paddingInline: 4,
    },
    hint: {
      opacity: 0.7,
    },
    link: {
      textDecoration: "none",
      fontWeight: 800,
      padding: "6px 10px",
      borderRadius: 999,
      border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
      color: "inherit",
      background: "transparent",
    },
  };
}
