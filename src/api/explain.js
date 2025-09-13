// File: /api/explain.js
// POST JSON: { question, userAnswer, isCorrect, topic, passage?, choices?, correctIndex? }
// Returns: { bullets: string[], tips: string[], nextSteps: string[], mock: boolean }

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const {
      question,
      userAnswer,
      isCorrect,
      topic,
      passage,
      choices,
      correctIndex,
    } = req.body || {};

    if (!question || typeof isCorrect !== "boolean") {
      res.status(400).json({ error: "Missing required fields: question, isCorrect" });
      return;
    }

    const key = (process.env.OPENAI_API_KEY || "").trim();
    const useMock = !key;

    if (useMock) {
      // Deterministic local mock for dev without a key
      const bullets = [
        `Clarify the ask${topic ? ` (topic: ${topic})` : ""}: what exact value/claim is needed?`,
        `List givens & constraints; translate words into equations or textual claims.`,
        `Eliminate choices with wrong units, sign, or claims stronger than the evidence.`,
      ];
      const tips = [
        `Predict before peeking at choices.`,
        `Underline the target; circle key info.`,
      ];
      const nextSteps = [`Try a similar ${topic || "SAT"} item to cement the pattern.`];
      res.status(200).json({ bullets, tips, nextSteps, mock: true });
      return;
    }

    // --- Real model path (prod) ---
    const system = `You are a concise SAT tutor. Respond with STRICT JSON:
{"bullets":[...],"tips":[...],"nextSteps":[...]}
- bullets: 3–5 steps explaining reasoning (no fluff)
- tips: 1–3 short strategies
- nextSteps: 1–2 actionable follow-ups
Keep it SAT-appropriate and precise.`;

    const user = JSON.stringify(
      { question, userAnswer, isCorrect, topic, passage: passage ?? null, choices: choices ?? null, correctIndex: typeof correctIndex === "number" ? correctIndex : null },
      null,
      2
    );

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Context:\n${user}\n\nReturn STRICT JSON only.` },
      ],
      response_format: { type: "json_object" },
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("OpenAI error:", txt);
      res.status(502).json({ error: "Upstream model error" });
      return;
    }

    const data = await r.json();
    let content = data?.choices?.[0]?.message?.content ?? "{}";

    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const bullets = Array.isArray(parsed.bullets) ? parsed.bullets.slice(0, 5) : [];
    const tips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [];
    const nextSteps = Array.isArray(parsed.nextSteps) ? parsed.nextSteps.slice(0, 2) : [];

    res.status(200).json({
      bullets: bullets.length ? bullets : [
        "Identify the exact target in your own words.",
        "Translate givens into equations/claims; track constraints.",
        "Test choices quickly against constraints; eliminate aggressively.",
      ],
      tips: tips.length ? tips : ["Predict before choices; underline the target; check units/signs."],
      nextSteps: nextSteps.length ? nextSteps : ["Do one similar problem to lock it in."],
      mock: false,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}
