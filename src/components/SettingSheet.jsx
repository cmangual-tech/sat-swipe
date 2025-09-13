// src/components/SettingsSheet.jsx
// A lightweight bottom-sheet for app settings & data tools.
//
// Props:
//  - open: boolean
//  - onClose: () => void
//  - dark: boolean
//  - onToggleDark: () => void
//  - onResetMastery: () => void          // e.g., Adaptive.resetModel(); Adaptive.initModel(lessons)
//  - onResetProgress: () => void         // clear XP/streak/completed/etc.
//  - subject?: string                    // optional, to show current track
//
// Extras: Export/Import local data (localStorage keys starting with "satx_")

import { useEffect, useRef, useState } from "react";

const LS_PREFIX = "satx_";

export default function SettingsSheet({
  open,
  onClose,
  dark,
  onToggleDark,
  onResetMastery,
  onResetProgress,
  subject,
}) {
  const [envInfo] = useState(() => getEnvInfo());
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={sheet(dark)} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Settings">
        {/* Header */}
        <div style={header(dark)}>
          <strong>Settings</strong>
          <button style={xBtn(dark)} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Quick toggles */}
        <section style={section}>
          <Row
            label="Dark mode"
            right={
              <button style={pillBtn(dark)} onClick={onToggleDark}>
                {dark ? "🌙 On" : "☀️ Off"}
              </button>
            }
          />
          <Row label="Current subject" value={cap(subject || "—")} />
        </section>

        {/* Data controls */}
        <section style={section}>
          <h4 style={h4}>Data & privacy (this device only)</h4>
          <div style={btnRow}>
            <button
              style={dangerBtn(dark)}
              onClick={() => confirm("Reset mastery (adaptive model) on this device?") && onResetMastery?.()}
              title="Clears per-topic mastery ELO on this device"
            >
              🧹 Reset Mastery
            </button>
            <button
              style={dangerBtn(dark)}
              onClick={() => confirm("Reset progress (XP/streak/completed) on this device?") && onResetProgress?.()}
              title="Clears XP/Streak/Completed on this device"
            >
              🧼 Reset Progress
            </button>
          </div>

          <div style={btnRow}>
            <button style={pillBtn(dark)} onClick={exportData} title="Download your local SAT Swipe data">
              ⬇️ Export Data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => importData(e.target.files?.[0])}
            />
            <button style={pillBtn(dark)} onClick={() => fileRef.current?.click()} title="Import a previously exported JSON">
              ⬆️ Import Data
            </button>
          </div>
          <small style={{ opacity: 0.7 }}>
            Export/Import includes keys starting with <code>satx_</code> (mastery, progress, stats).
          </small>
        </section>

        {/* Environment info */}
        <section style={section}>
          <h4 style={h4}>Environment</h4>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.5 }}>
            <li>Mode: <strong>{envInfo.mode}</strong></li>
            <li>Host: {envInfo.host}</li>
            <li>Feedback URL: {envInfo.hasFeedback ? "configured" : "not set"}</li>
          </ul>
        </section>

        {/* Footer */}
        <div style={footer}>
          <a
            href={import.meta.env?.VITE_FEEDBACK_FORM_URL || "#"}
            target="_blank"
            rel="noreferrer"
            style={linkBtn(dark)}
            title="Open feedback form"
          >
            ✨ Insider Feedback
          </a>
          <button style={pillBtn(dark)} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function exportData() {
  const payload = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) {
      payload[k] = localStorage.getItem(k);
    }
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `satx-data-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result || "{}"));
      Object.keys(obj || {}).forEach((k) => {
        if (k.startsWith(LS_PREFIX)) localStorage.setItem(k, obj[k]);
      });
      alert("Data imported. Reloading…");
      window.location.reload();
    } catch {
      alert("Import failed: invalid JSON.");
    }
  };
  reader.readAsText(file);
}

function getEnvInfo() {
  const host = window.location.host;
  const mode = host.includes("localhost") || host.includes("127.0.0.1") ? "Local" : "Production";
  const hasFeedback = !!import.meta.env?.VITE_FEEDBACK_FORM_URL;
  return { host, mode, hasFeedback };
}

function cap(s) { return (s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }

/* ---------- styles ---------- */

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

const section = { marginTop: 12 };

const h4 = { margin: "0 0 6px 0", fontSize: 13, opacity: 0.9, textTransform: "uppercase", letterSpacing: 0.4 };

const btnRow = { display: "flex", gap: 8, flexWrap: "wrap" };

const pillBtn = (dark) => ({
  padding: "8px 12px",
  borderRadius: 12,
  border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
  background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
  color: "inherit",
  fontWeight: 800,
  cursor: "pointer",
});

const dangerBtn = (dark) => ({
  ...pillBtn(dark),
  border: "1px solid rgba(220,38,38,0.5)",
  background: dark ? "rgba(220,38,38,0.15)" : "rgba(220,38,38,0.07)",
});

const footer = { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 8 };

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

function Row({ label, value, right }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      padding: "8px 0",
      borderTop: "1px solid rgba(0,0,0,0.06)",
    }}>
      <div>
        <div style={{ fontWeight: 700 }}>{label}</div>
        {value != null && <div style={{ opacity: 0.75 }}>{value}</div>}
      </div>
      {right}
    </div>
  );
}
