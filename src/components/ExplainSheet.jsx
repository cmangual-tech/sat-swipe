// src/components/ExplainSheet.jsx
// src/components/ExplainSheet.jsx
import { useEffect, useRef } from "react";

/**
 * ExplainSheet
 * Bottom-sheet container used by App.jsx to show AI explanations.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - dark?: boolean
 *  - badge?: string   // optional (e.g., "Mock mode (local)")
 *  - children: ReactNode  // content area (bullets/tips/next steps)
 */
export default function ExplainSheet({ open, onClose, dark, badge, children }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Focus trap-lite + Esc to close
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    // Reset scroll to top each open
    const t = setTimeout(() => {
      listRef.current?.scrollTo({ top: 0 });
    }, 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={backdrop} onClick={onClose} aria-label="Close explanation panel">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Explain with AI"
        onClick={(e) => e.stopPropagation()}
        style={sheet(dark)}
      >
        {/* Header */}
        <div style={header(dark)}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 800 }}>Explain with AI</span>
            {badge && <span style={pill(dark)}>{badge}</span>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={xBtn(dark)}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={listRef} style={content(dark)}>
          {children || (
            <div style={{ opacity: 0.8 }}>No explanation available.</div>
          )}
        </div>

        {/* Footer actions (optional extension point) */}
        <div style={footer(dark)}>
          <a
            href={import.meta.env?.VITE_FEEDBACK_FORM_URL || "#"}
            target="_blank"
            rel="noreferrer"
            style={linkBtn(dark)}
            title="Open feedback form"
          >
            ✨ Insider Feedback
          </a>
          <button onClick={onClose} style={btn(dark)}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- styles ---------------- */

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 1000,
};

const sheet = (dark) => ({
  width: "100%",
  maxWidth: 760,
  background: dark ? "#111827" : "#ffffff",
  color: dark ? "#F9FAFB" : "#2B2B2B",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
  padding: 16,
  border: dark ? "1px solid #1F2937" : "1px solid #E0E7EF",
});

const header = (dark) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingBottom: 8,
  borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
});

const xBtn = (dark) => ({
  border: "none",
  background: "transparent",
  color: "inherit",
  fontSize: 20,
  cursor: "pointer",
});

const pill = (dark) => ({
  fontSize: 12,
  opacity: 0.9,
  padding: "2px 8px",
  borderRadius: 999,
  background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
});

const content = (dark) => ({
  maxHeight: 320,
  overflowY: "auto",
  padding: "10px 2px",
  marginTop: 8,
  borderRadius: 10,
  background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
  border: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
});

const footer = (dark) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 12,
  gap: 8,
});

const btn = (dark) => ({
  padding: "8px 12px",
  borderRadius: 12,
  border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
  background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
  color: "inherit",
  fontWeight: 800,
  cursor: "pointer",
});

const linkBtn = (dark) => ({
  textDecoration: "none",
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 12,
  border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
  background: "transparent",
  color: "inherit",
  fontWeight: 800,
});
