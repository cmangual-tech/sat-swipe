// File: /api/tutor.js
// POST JSON:
// {
//   sessionId?: string,
//   messages: [{role:"user"|"assistant"|"system", content:string}],
//   context?: {
//     subject?: string,
//     topic?: string,
//     question?: string,
//     choices?: string[],
//     passage?: string,
//     userAnswer?: string,
//     isCorrect?: boolean
//   }
// }
// Returns: { reply: string, mock: boolean, suggestions?: string[] }

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const { messages, context } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Missing messages array" });
      return;
    }

    const key = (process.env.OPENAI_API_KEY || "").trim();
    const useMock = !key;

    // ---------- Local Mock ----------
    if (useMock) {
      const lastUser = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
      const canned =
        "Let’s work it out together. First, restate the question in your own words. " +
        "What is it asking for exactly? If there are choices, which can you eliminate quickly and why?";
      const reply = `You said: "${truncate(lastUser, 160)}"\n\n${canned}`;
      return res.status(200).json({
        reply,
        mock: true,
        suggestions: [
          "Give me a hint, not the answer",
          "Show me the first step",
          "Explain why choice B is wrong",
        ],
      });
    }

    // ---------- Real Model ----------
    const sys = buildSystemPrompt(context);
    const trimmed = trimMessages(messages, 12);

    const payload = {
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "system", content: sys }, ...trimmed],
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("OpenAI tutor error:", txt);
      res.status(502).json({ error: "Upstream model error" });
      return;
    }

    const data = await r.json();
    const reply = (data?.choices?.[0]?.message?.content || "").trim();

    res.status(200).json({
      reply: reply || fallbackReply(context),
      mock: false,
      suggestions: buildSuggestions(context),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
}

/* ---------- Helpers ---------- */

function buildSystemPrompt(ctx = {}) {
  const subject = ctx.subject ? `Subject: ${ctx.subject}.` : "";
  const topic = ctx.topic ? ` Topic: ${ctx.topic}.` : "";
  const q = ctx.question ? `\nQuestion: ${ctx.question}` : "";
  const p = ctx.passage ? `\nPassage:\n${ctx.passage}` : "";
  const choices = Array.isArray(ctx.choices) && ctx.choices.length
    ? `\nChoices:\n${ctx.choices.map((c,i)=>`${String.fromCharCode(65+i)}. ${c}`).join("\n")}`
    : "";
  const ua = ctx.userAnswer ? `\nStudent's last answer: ${ctx.userAnswer}` : "";
  const cor = typeof ctx.isCorrect === "boolean" ? ` (${ctx.isCorrect ? "correct" : "incorrect"})` : "";

  return [
    "You are SAT Tutor Mode: an expert, friendly, *interactive* SAT coach.",
    "Teaching style:",
    "- Be Socratic: ask short guiding questions, then wait for the student’s response.",
    "- Reveal one small step at a time; do NOT dump full solutions unless the student asks.",
    "- Prefer plain language; keep responses concise (4–8 sentences max).",
    "- For Reading: tie claims to textual evidence; avoid absolutist language unless warranted.",
    "- For Math: name the skill (e.g., linear functions, systems, percent) and show the next step.",
    "- For Vocab: define the word, check connotation/tone, and test fit by substitution.",
    "",
    "Safety & tone:",
    "- Encourage effort; avoid shaming. Offer hints before answers.",
    "- If the student asks for the answer directly, give it, but follow with a quick why.",
    "",
    "When you ask a question, end with a clear, brief prompt for the student to respond.",
    subject + topic + q + p + choices + ua + cor,
  ].join("\n");
}

function buildSuggestions(ctx = {}) {
  const base = ["Give me a hint", "Show the first step", "Explain my mistake"];
  if (ctx?.choices?.length) base.push("Eliminate a wrong choice");
  if (ctx?.subject === "reading") base.push("Point to a line as evidence");
  if (ctx?.subject === "vocab") base.push("Test the best synonym in the sentence");
  return base.slice(0, 4);
}

function trimMessages(msgs, maxTurns = 12) {
  const only = msgs.filter(m => m.role === "user" || m.role === "assistant");
  return only.slice(-maxTurns);
}

function fallbackReply(ctx) {
  const subj = ctx?.subject ? ` (${ctx.subject})` : "";
  return `Let’s reason it out${subj}. First, restate the question. What is it asking for? If choices, which can you eliminate and why?`;
}

function truncate(s, n) {
  s = String(s || "");
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
