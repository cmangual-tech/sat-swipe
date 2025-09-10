// src/components/ExplainSheet.jsx
import React, { useEffect } from "react";

export default function ExplainSheet({ open, onClose, dark, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: open ? "rgba(0,0,0,0.55)" : "transparent",
          opacity: open ? 1 : 0,
          transition: "opacity 220ms ease",
          pointerEvents: open ? "auto" : "none",
          zIndex: 80,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          transform: open ? "translateY(0%)" : "translateY(102%)",
          transition: "transform 280ms cubic-bezier(.2,.8,.25,1)",
          background: dark ? "#0f1117" : "#ffffff",
          color: dark ? "#e5e7eb" : "#111827",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          boxShadow: dark
            ? "0 -16px 48px rgba(0,0,0,0.6)"
            : "0 -16px 48px rgba(0,0,0,0.18)",
          zIndex: 90,
        }}
      >
        {/* Grab bar + Close */}
        <div
          style={{
            padding: "10px 14px 6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 4,
              borderRadius: 999,
              background: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
            }}
          />
        </div>

        <div style={{ padding: "12px 14px 18px", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Explain with AI</strong>
            <button
              onClick={onClose}
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                background: "transparent",
                color: "inherit",
                borderRadius: 10,
                fontWeight: 800,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
