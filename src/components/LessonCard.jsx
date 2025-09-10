// src/components/LessonCard.jsx
import useInViewVideo from "../useInViewVideo";
import { motion } from "framer-motion";

export default function LessonCard({ lesson, darkMode }) {
  const videoRef = useInViewVideo();

  const isSummary = typeof lesson.title === "string" && lesson.title.toLowerCase().startsWith("summary:");
  const feedbackUrl = import.meta.env?.VITE_FEEDBACK_FORM_URL || "#";

  return (
    <motion.section
      style={wrap}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Summary card layout */}
      {isSummary ? (
        <div style={summaryWrap(darkMode)}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "Merriweather, serif", fontWeight: 700 }}>
              {lesson.title}
            </h2>
            {lesson.caption && <p style={{ margin: "8px 0 0", opacity: 0.9 }}>{lesson.caption}</p>}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={pillBtn(darkMode)}
              title="Go pick another subject"
            >
              ⤴️ Start another track
            </button>
            <button
              onClick={() => feedbackUrl !== "#" && window.open(feedbackUrl, "_blank", "noopener,noreferrer")}
              style={pillBtn(darkMode)}
              title="Open feedback form"
            >
              ✨ Insider Feedback
            </button>
          </div>
        </div>
      ) : (
        // Normal lesson layout (video or placeholder)
        <>
          {lesson.src ? (
            <div style={mediaWrap}>
              <video
                ref={videoRef}
                src={lesson.src}
                style={videoEl}
                muted
                playsInline
                loop
                controls={false}
              />
              <div style={overlayGrad} />
              <div style={overlayText(darkMode)}>
                <h2 style={{ margin: 0, fontFamily: "Merriweather, serif", fontWeight: 700 }}>{lesson.title}</h2>
                {lesson.caption && <p style={{ margin: "6px 0 0" }}>{lesson.caption}</p>}
              </div>
            </div>
          ) : (
            <div style={placeholder(darkMode)}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{lesson.title || "15s Lesson"}</div>
                {lesson.caption && <div style={{ opacity: 0.8 }}>{lesson.caption}</div>}
              </div>
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}

/* styles */
const wrap = {
  height: "100vh",
  scrollSnapAlign: "start",
  scrollSnapStop: "always",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const VIDEO_H = "calc(100vh - 72px)";

const mediaWrap = {
  width: "100vw",
  height: VIDEO_H,
  position: "relative",
};

const videoEl = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const overlayGrad = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 160,
  background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
  pointerEvents: "none",
};

const overlayText = (dark) => ({
  position: "absolute",
  left: 16,
  right: 16,
  bottom: 16,
  color: "#FFFFFF",
  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
  fontFamily: "Inter, sans-serif",
  lineHeight: 1.25,
});

const placeholder = (dark) => ({
  width: "100vw",
  height: VIDEO_H,
  borderRadius: 0,
  background: dark ? "#1E293B" : "#E9F2FB",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: dark ? "#E5E7EB" : "#111827",
  userSelect: "none",
  padding: "0 16px",
});

const summaryWrap = (dark) => ({
  width: "min(600px, 94vw)",
  margin: "0 auto",
  background: dark ? "#111827" : "#FFFFFF",
  color: dark ? "#F9FAFB" : "#2B2B2B",
  borderRadius: 16,
  padding: 20,
  textAlign: "left",
  boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.06)",
  border: dark ? "1px solid #1F2937" : "1px solid #E0E7EF",
  fontFamily: "Inter, sans-serif",
});

const pillBtn = (dark) => ({
  border: "1px solid " + (dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)"),
  background: "transparent",
  color: "inherit",
  borderRadius: 999,
  fontWeight: 800,
  padding: "8px 12px",
  cursor: "pointer",
});
