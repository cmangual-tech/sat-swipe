// src/lib/explainApi.js
// Simple client for /api/explain with basic validation and safe defaults.

export async function requestExplanation(payload) {
  const body = normalizePayload(payload);

  const res = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Explain API failed with ${res.status}`);
  }

  const data = await res.json().catch(() => ({}));
  return sanitizeResponse(data);
}

/* ---------------- helpers ---------------- */

function normalizePayload(p = {}) {
  const {
    question = "Question",
    userAnswer = "",
    isCorrect = false,
    topic = "General",
    passage = null,
    choices = null,
    correctIndex = null,
  } = p || {};

  return {
    question: String(question),
    userAnswer: String(userAnswer ?? ""),
    isCorrect: !!isCorrect,
    topic: topic ?? "General",
    passage: passage ?? null,
    choices: Array.isArray(choices) ? choices.slice(0, 8) : null,
    correctIndex:
      typeof correctIndex === "number" && Number.isFinite(correctIndex)
        ? correctIndex
        : null,
  };
}

function sanitizeResponse(d = {}) {
  const bullets = Array.isArray(d.bullets) ? d.bullets.filter(isNonEmpty).slice(0, 5) : [];
  const tips = Array.isArray(d.tips) ? d.tips.filter(isNonEmpty).slice(0, 3) : [];
  const nextSteps = Array.isArray(d.nextSteps) ? d.nextSteps.filter(isNonEmpty).slice(0, 2) : [];
  const mock = !!d.mock;

  // Guard rails so the UI never looks empty
  return {
    bullets: bullets.length ? bullets : [
      "Clarify the exact target of the question.",
      "Translate givens into equations/claims and track constraints.",
      "Check choices quickly against constraints; eliminate aggressively.",
    ],
    tips: tips.length ? tips : ["Predict before looking at choices.", "Underline the target; circle key info."],
    nextSteps: nextSteps.length ? nextSteps : ["Try one similar problem to lock it in."],
    mock,
  };
}

function isNonEmpty(x) {
  return typeof x === "string" && x.trim().length > 0;
}
