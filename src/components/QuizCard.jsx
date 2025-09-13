import { useState } from "react";
import { motion } from "framer-motion";import { useState } from "react";
import TutorSheet from "./components/TutorSheet";

// inside your component:
const [tutorOpen, setTutorOpen] = useState(false);

<><button onClick={() => setTutorOpen(true)}>
  🧠 Tutor Chat
</button><TutorSheet
    open={tutorOpen}
    onClose={() => setTutorOpen(false)}
    subject={subject} // "math" | "reading" | "vocab"
    quiz={item} // pass the current quiz/lesson object if available
    startingQuestion="I’m stuck—can you give me the first step?"
    sessionId={`${subject}-${item?.id || "general"}`} /></>


export default function QuizCard({ quiz, onSubmit, darkMode, gateShake }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'wrong' | 'correct'
  const [shake, setShake] = useState(false);

  const groupName = `choice-${quiz.id}`; // ✅ unique radios per quiz

  const handleSubmit = () => {
    if (selected === null) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }

    const correct = selected === quiz.answerIndex;

    if (correct) {
      setStatus("correct");
      onSubmit?.(true);       // ✅ only unlock/advance on correct
    } else {
      setStatus("wrong");     // ❌ let them try again (inputs stay enabled)
      onSubmit?.(false);      // optional: record an attempt, but App won’t unlock/advance
    }
  };

  return (
    <motion.section
      style={wrap}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        style={inner(darkMode)}
        animate={(shake || gateShake) ? { x: [0, -10, 10, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
      >
        <h2 style={{ marginTop: 0, fontFamily: "Merriweather, serif" }}>Quick Check</h2>
        <p style={{ fontWeight: 600 }}>{quiz.prompt}</p>

        <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0" }}>
          {quiz.choices.map((c, i) => {
            const isCorrect = i === quiz.answerIndex;
            const showFeedback = status !== "idle" && (isCorrect || i === selected);
            return (
              <li key={i} style={{ margin: "8px 0" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name={groupName}        // ✅ unique per quiz
                    checked={selected === i}
                    onChange={() => setSelected(i)}
                    // disabled only after correct, so they can retry when wrong
                    disabled={status === "correct"}
                  />
                  <span
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: showFeedback
                        ? isCorrect
                          ? "#E6F9F0"  // pale green (correct)
                          : "#FEECEC"  // pale red (wrong)
                        : (darkMode ? "#1F2937" : "#F4F8FC"),
                      border: "1px solid #E0E7EF",
                    }}
                  >
                    {c}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {status === "wrong" && (
          <div style={{ marginTop: 10, fontSize: 14, color: darkMode ? "#FCA5A5" : "#B91C1C" }}>
            Not quite—try another choice.
          </div>
        )}

        {status === "correct" && (
          <>
            <div style={{ marginTop: 10, fontSize: 14 }}>Nice! Correct.</div>
            {quiz.explanation && <p style={{ marginTop: 6 }}>{quiz.explanation}</p>}
            <small style={{ opacity: 0.6 }}>Advancing…</small>
          </>
        )}

        {status !== "correct" && (
          <button style={btn} onClick={handleSubmit}>
            Submit
          </button>
        )}
      </motion.div>
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
  padding: 16,
  boxSizing: "border-box",
};

const inner = (dark) => ({
  width: "min(520px, 92vw)",
  background: dark ? "#111827" : "#FFFFFF",
  color: dark ? "#F9FAFB" : "#2B2B2B",
  borderRadius: 16,
  padding: 20,
  textAlign: "center",
  boxShadow: dark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.06)",
  border: dark ? "1px solid #1F2937" : "1px solid #E0E7EF",
  fontFamily: "Inter, sans-serif",
});

const btn = {
  marginTop: 12,
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  background: "#2563EB",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};


