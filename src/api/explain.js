// /api/explain.js
// Vercel serverless function for SAT explanations.
// - POST only
// - If OPENAI_API_KEY is missing, returns a safe mock so you can develop.
// - Keeps output shape: { bullets: string[], tips: string[], nextSteps: string[] }

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 20;
const bucket = new Map();

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Soft rate limit (best effort)
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const now = Date.now();
    const hits = bucket.get(ip)?.filter((t) => now - t < RATE_LIMIT_WINDOW_MS) || [];
    hits.push(now);
    bucket.set(ip, hits);
    if (hits.length > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: "Too Many Requests. Try again shortly." });
    }

    // Parse/validate input
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { prompt, context } = body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return res.status(400).json({ error: 'Invalid input: "prompt" is required.' });
    }
    const ctx = normalizeContext(context);

    // If no key, return mock so local dev always works
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json(mockResponse(ctx));
    }

    // Call OpenAI (JSON mode)
    const sys = [
      "You are a concise SAT tutor.",
      "Return JSON with keys: bullets, tips, nextSteps.",
      "Be brief, school-appropriate, and stepwise."
    ].join(" ");

    const user = JSON.stringify({
      prompt,
      context: ctx,
      shape: { bullets: "string[]", tips: "string[]", nextSteps: "string[]" }
    });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await safeText(resp);
      return res.status(200).json(mockResponse(ctx, {
        note: "Using fallback while AI service is unavailable.",
        detail: String(detail || "").slice(0, 200)
      }));
    }

    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    return res.status(200).json(shapeOut(parsed));

  } catch (e) {
    console.error("[/api/explain] fatal:", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/* helpers */
function normalizeContext(c = {}) {
  const subject = ["math", "reading", "vocab"].includes(c.subject) ? c.subject : "reading";
  const s = (v) => (typeof v === "string" ? v.slice(0, 2000) : undefined);
  const a = (arr) => (Array.isArray(arr) ? arr.slice(0, 8).map(s).filter(Boolean) : undefined);
  return {
    subject,
    question: s(c.question),
    choices: a(c.choices),
    userAnswer: s(c.userAnswer),
  };
}
function toArr(x) { return Array.isArray(x) ? x.map(String).filter(Boolean) : []; }
function shapeOut(obj) {
  return {
    bullets: toArr(obj.bullets).slice(0, 6),
    tips: toArr(obj.tips).slice(0, 4),
    nextSteps: toArr(obj.nextSteps).slice(0, 3),
  };
}
function mockResponse(ctx, meta) {
  const common = [
    "Read the question stem twice; underline the task.",
    "Eliminate two choices fast; compare the last two carefully.",
    "Check units, definitions, or the cited lines before deciding.",
  ];
  const bySubject = {
    math: [
      "Translate words into an equation; solve step-by-step.",
      "If stuck, plug choices or pick easy numbers.",
    ],
    reading: [
      "Prove with the text—find a line that supports your choice.",
      "Beware answers that are too strong (always/never).",
    ],
    vocab: [
      "Use contrast/result words to infer meaning.",
      "Swap each choice into the sentence; test tone/fit.",
    ],
  };
  const bullets = [...common, ...(bySubject[ctx.subject] || [])].slice(0, 6);
  const tips = [
    meta?.note ? meta.note : "Pace yourself; don’t let one item sink your momentum.",
    "Mark-and-move if unsure; return later with fresh eyes.",
  ];
  const nextSteps = [
    `Practice 2–3 more ${ctx.subject} items of the same type.`,
    "Write one sentence: why the correct answer is right.",
  ];
  return { bullets, tips, nextSteps };
}
async function safeText(r) { try { return await r.text(); } catch { return null; } }
