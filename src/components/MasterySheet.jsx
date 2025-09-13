// src/components/MasterySheet.jsx
import { useEffect, useMemo, useRef } from "react";
import { Adaptive } from "../lib/adaptiveEngine";
import { lessons as ALL_LESSONS } from "../lessons";

/**
 * MasterySheet: bottom-sheet view of adaptive mastery.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - subject?: "math" | "reading" | "vocab" | string  (optional filter)
 *  - dark?: boolean
 */
export default function MasterySheet({ open, onClose, subject, dark }) {
  const data = useMemo(() => {
    // Make sure model seeded (safe if called multiple times)
    Adaptive.initModel(ALL_LESSONS);
    const dash = Adaptive.getDashboard(ALL_LESSONS);
    // Optional subject filter for table
    const topics = subject
      ? dash.topics.filter(t => t.subject === subject)
      : dash.topics;
    return {
      overall: dash.overall,
      strengths: dash.strengths,
      weaknesses: dash.weaknesses,
      topics,
    };
  }, [subject]);

  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      listRef.current?.scrollTo({ top: 0 });
    }, 60);
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={sheetStyle(dark)} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 16 }}>
              Mastery{subject ? ` — ${cap(subject)}` : ""}
            </span>
            <LevelBadge level={data.overall.level} />
            <span style={{ opacity: 0.8, fontSize: 12 }}>
              Overall: {data.overall.rating}
            </span>
          </div>
          <button style={styles.close} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Strengths / Weaknesses */}
        <div style={grid2}>
          <Card title="Top strengths">
            {listMini(data.strengths)}
          </Card>
          <Card title="Needs work">
            {listMini(data.weaknesses)}
          </Card>
        </div>

        {/* Topic table */}
        <div style={{ marginTop: 10 }}>
          <div style={tableWrap(dark)} ref={listRef} role="table" aria-label="Topic mastery table">
            <Row head dark={dark} cells={["Topic", "Level", "Rating", "Accuracy", "Attempts", "Last seen"]} />
            {data.topics
              .sort((a, b) => a.subject === b.subject ? a.topic.localeCompare(b.topic) : a.subject.localeCompare(b.subject))
              .map((t) => (
                <Row
                  key={t.key}
                  dark={dark}
                  cells={[
                    `${cap(t.subject)} • ${cap(t.topic)}`,
                    <LevelBadge key="lvl" level={t.level} />,
                    String(t.rating),
                    t.accuracy == null ? "—" : `${t.accuracy}%`,
                    `${t.seen}`,
                    t.last ? timeAgo(t.last) : "—",
                  ]}
                />
              ))}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 8 }}>
          <button style={pillBtn(dark)} onClick={() => window.location.reload()}>
            🔄 Rebuild playlist
          </button>
          <button
            style={pillBtn(dark)}
            onClick={() => {
              Adaptive.resetModel();
              Adaptive.initModel(ALL_LESSONS);
              window.location.reload();
            }}
            title="Clears your mastery and stats on this device"
          >
            🧹 Reset mastery (local)
          </button>
          <button style={pillBtn(dark)} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- small building blocks ---------- */

function Card({ title, children }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.04)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function listMini(arr = []) {
  if (!arr.length) return <div style={{ opacity: 0.7 }}>No data yet.</div>;
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {arr.map((t) => (
        <li key={t.key} style={{ marginBottom: 4 }}>
          <LevelBadge level={t.level} />{" "}
          <span style={{ opacity: 0.9 }}>{cap(t.subject)} • {cap(t.topic)}</span>{" "}
          <span style={{ opacity: 0.6 }}>({t.rating})</span>
        </li>
      ))}
    </ul>
  );
}

function Row({ head, cells, dark }) {
  const style = head ? rowHead(dark) : rowStyle(dark);
  return (
    <div role="row" style={style}>
      {cells.map((c, i) => (
        <div role={head ? "columnheader" : "cell"} key={i} style={{ flex: colFlex[i] || 1 }}>
          {c}
        </div>
      ))}
    </div>
  );
}

const colFlex = [2.2, 1.1, 1, 1, 1, 1.2];

function LevelBadge({ level }) {
  const color = levelColor(level);
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      background: color.bg,
      color: color.fg,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: 0.2,
    }}>
      {level}
    </span>
  );
}

function levelColor(level) {
  switch (level) {
    case "Bronze":    return { bg: "#5b4636", fg: "#fff" };
    case "Silver":    return { bg: "#9ca3af", fg: "#111" };
    case "Gold":      return { bg: "#eab308", fg: "#111" };
    case "Platinum":  return { bg: "#60a5fa", fg: "#111" };
    default:          return { bg: "rgba(255,255,255,0.12)", fg: "#fff" };
  }
}

/* ---------- styles ---------- */

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
};

const sheetStyle = (dark) => ({
  width: "100%",
  maxWidth: 860,
  background: dark ? "#111827" : "#ffffff",
  color: dark ? "#F9FAFB" : "#2B2B2B",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
  padding: 16,
  border: dark ? "1px solid #1F2937" : "1px solid #E0E7EF",
});

const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 12,
};

const tableWrap = (dark) => ({
  borderRadius: 12,
  border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
  overflow: "hidden",
});

const rowHead = (dark) => ({
  display: "grid",
  gridTemplateColumns: "2.2fr 1.1fr 1fr 1fr 1fr 1.2fr",
  gap: 12,
  padding: "10px 12px",
  fontWeight: 700,
  background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
});

const rowStyle = (dark) => ({
  display: "grid",
  gridTemplateColumns: "2.2fr 1.1fr 1fr 1fr 1fr 1.2fr",
  gap: 12,
  padding: "10px 12px",
  borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
});

const pillBtn = (dark) => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: dark ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(0,0,0,0.12)",
  background: "transparent",
  color: "inherit",
  fontWeight: 800,
  cursor: "pointer",
});

/* ---------- utils ---------- */

function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor(diff / 60000);
  if (m > 0) return `${m}m ago`;
  return "just now";
}
function cap(s) { return (s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }
