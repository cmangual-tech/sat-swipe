// src/lessons.js
// Finalized content for MVP:
// - 3 subjects (math, reading, vocab)
// - For each subject: 1 intro lesson, 10 quizzes, 1 summary lesson
// - IDs are unique, topics are consistent for Adaptive engine
// - Reading passages ~70–120 words, SAT-style question types
// - Vocab single-blank sentence completions (tone/fit matters)

export const lessons = [
  /* ---------------------------- MATH ---------------------------- */
  {
    type: "lesson",
    subject: "math",
    id: "math-intro",
    title: "Quick Tip: Predict the Step",
    caption:
      "Before you touch numbers, name the next move: isolate x? convert percent? set up a proportion? Predicting reduces careless errors.",
    // src: "/videos/math-intro-15s.mp4"
  },

  // Linear equations / distributing / combining like terms
  {
    type: "quiz",
    subject: "math",
    id: "m1-linear-distribute",
    topic: "Linear equations",
    prompt: "Solve for x: 3(x + 2) – 2x = 11",
    choices: ["x = 5", "x = 1", "x = –1", "x = 7"],
    answerIndex: 0,
    explanation: "3(x+2)–2x = 3x+6–2x = x+6; x+6 = 11 → x = 5.",
  },

  // Percents
  {
    type: "quiz",
    subject: "math",
    id: "m2-percent-increase",
    topic: "Percent",
    prompt: "A price increases from $80 to $92. What is the percent increase?",
    choices: ["12%", "15%", "8%", "10%"],
    answerIndex: 1,
    explanation: "Increase = 12; 12/80 = 0.15 = 15%.",
  },

  // Systems (substitution)
  {
    type: "quiz",
    subject: "math",
    id: "m3-systems-sub",
    topic: "Systems of equations",
    prompt: "Solve the system: y = 2x + 3 and x + y = 18",
    choices: ["x = 5, y = 13", "x = 6, y = 12", "x = 7, y = 11", "x = 8, y = 10"],
    answerIndex: 0,
    explanation: "x + (2x+3) = 18 → 3x = 15 → x=5; y=13.",
  },

  // Exponents (product rule)
  {
    type: "quiz",
    subject: "math",
    id: "m4-exponents-product",
    topic: "Exponents",
    prompt: "Simplify: (2x^3)(3x^2)",
    choices: ["6x^5", "5x^6", "6x^6", "5x^5"],
    answerIndex: 0,
    explanation: "Multiply coefficients (6) and add exponents (x^(3+2)).",
  },

  // Function evaluation
  {
    type: "quiz",
    subject: "math",
    id: "m5-functions-eval",
    topic: "Functions",
    prompt: "If f(x) = x^2 − 4x + 1, what is f(−2)?",
    choices: ["13", "9", "1", "5"],
    answerIndex: 0,
    explanation: "f(−2)=4 + 8 + 1 = 13.",
  },

  // Slope meaning
  {
    type: "quiz",
    subject: "math",
    id: "m6-slope-meaning",
    topic: "Slope",
    prompt: "In y = mx + b, what does m represent?",
    choices: ["The y-intercept", "The slope", "An average of x and y", "A constant with no meaning"],
    answerIndex: 1,
    explanation: "m is the rate of change (slope).",
  },

  // Unit rate
  {
    type: "quiz",
    subject: "math",
    id: "m7-rate",
    topic: "Rate problems",
    prompt: "A car travels 180 miles in 3 hours at a constant speed. What is the speed?",
    choices: ["50 mph", "55 mph", "60 mph", "65 mph"],
    answerIndex: 2,
    explanation: "Distance/time = 60 mph.",
  },

  // Quadratic roots (factoring)
  {
    type: "quiz",
    subject: "math",
    id: "m8-quadratic-factor",
    topic: "Quadratics",
    prompt: "Solve: x^2 − 5x + 6 = 0",
    choices: ["x = −2 or −3", "x = 2 or 3", "x = 1 or 6", "x = −1 or −6"],
    answerIndex: 1,
    explanation: "(x−2)(x−3)=0 → x=2 or x=3.",
  },

  // Proportions
  {
    type: "quiz",
    subject: "math",
    id: "m9-proportion",
    topic: "Proportions",
    prompt: "If 4 pencils cost $3, how much do 10 pencils cost (same rate)?",
    choices: ["$6.50", "$7.50", "$8.00", "$7.25"],
    answerIndex: 1,
    explanation: "Unit cost = 3/4; 10×0.75 = 7.50.",
  },

  // Linear word problem
  {
    type: "quiz",
    subject: "math",
    id: "m10-linear-word",
    topic: "Linear equations",
    prompt:
      "A gym charges a joining fee of $25 plus $15 per month. Which equation gives total cost C after m months?",
    choices: ["C = 25m + 15", "C = 15m + 25", "C = 15(m − 25)", "C = 25(m − 15)"],
    answerIndex: 1,
    explanation: "Fixed fee 25, then 15 each month → C = 15m + 25.",
  },

  {
    type: "lesson",
    subject: "math",
    id: "math-summary",
    title: "Summary: Math",
    caption:
      "Nice run! Ready for another track or a tougher set? Use Tutor Chat for hints; keep building streaks."
  },

  /* -------------------------- READING -------------------------- */
  {
    type: "lesson",
    subject: "reading",
    id: "reading-intro",
    title: "Reading Tip: Predict, Then Match",
    caption:
      "Before choices, say the answer in your own words. Then pick the choice that best matches that idea—no extra claims.",
  },

  // Main idea
  {
    type: "quiz",
    subject: "reading",
    id: "r1-main-idea",
    topic: "Main idea",
    passage:
      "As urban parks have grown in popularity, managers face a paradox: success leads to strain. Crowds compact soil, trample native plants, and encourage litter, but these spaces also build community and improve public health. The question is not whether parks should be popular—they should—but how to guide use so that popularity does not undercut the very benefits that draw people in.",
    prompt: "Which choice best states the main purpose of the paragraph?",
    choices: [
      "To argue that parks should limit access to reduce damage",
      "To explain a tension between park popularity and park health",
      "To show that parks offer no health benefits",
      "To describe how to measure soil compaction"
    ],
    answerIndex: 1,
    explanation: "It introduces a tension and frames a management question—not a ban.",
  },

  // Evidence
  {
    type: "quiz",
    subject: "reading",
    id: "r2-evidence",
    topic: "Evidence",
    passage:
      "As urban parks have grown in popularity, managers face a paradox: success leads to strain. Crowds compact soil, trample native plants, and encourage litter, but these spaces also build community and improve public health. The question is not whether parks should be popular—they should—but how to guide use so that popularity does not undercut the very benefits that draw people in.",
    prompt: "Which line best supports the idea that popularity causes strain?",
    choices: [
      "“build community and improve public health”",
      "“success leads to strain”",
      "“The question is not whether parks should be popular”",
      "“but how to guide use”"
    ],
    answerIndex: 1,
    explanation: "The phrase directly links popularity (success) to strain.",
  },

  // Inference
  {
    type: "quiz",
    subject: "reading",
    id: "r3-inference-museum",
    topic: "Inference",
    passage:
      "Many small museums rely on volunteer labor and irregular donations. When a sudden expense arises—a leaky roof or a failed climate-control unit—directors must choose between short-term patches and long-term fixes. Those choices, while unglamorous, determine whether collections are merely stored or truly preserved.",
    prompt: "What can be reasonably inferred about the directors’ priorities?",
    choices: [
      "They prefer to close rather than repair buildings.",
      "They must balance immediate needs with preservation goals.",
      "They spend most funds on marketing events.",
      "They believe collections should be frequently replaced."
    ],
    answerIndex: 1,
    explanation: "The short-term vs. long-term contrast implies balancing priorities.",
  },

  // Vocab-in-context
  {
    type: "quiz",
    subject: "reading",
    id: "r4-vocab-tentative",
    topic: "Vocab in context",
    passage:
      "When the researcher called the result “tentative,” she did not mean it was unimportant; rather, the sample was small, and replication was needed before any firm claims.",
    prompt: "As used in the passage, “tentative” most nearly means:",
    choices: ["insignificant", "uncertain", "accidental", "obvious"],
    answerIndex: 1,
    explanation: "Provisional/uncertain pending replication.",
  },

  // Function of sentence
  {
    type: "quiz",
    subject: "reading",
    id: "r5-function-gardens",
    topic: "Function",
    passage:
      "Critics sometimes frame community gardens as nostalgic throwbacks. Yet the gardeners themselves tend to be pragmatic; they want fresh produce, not sepia-toned memories. The supposed nostalgia is, at most, a bonus.",
    prompt: "The second sentence primarily serves to:",
    choices: [
      "provide an example that confirms the critics’ view",
      "present a practical counterpoint to an assumption",
      "argue that nostalgia is harmful",
      "define the word ‘nostalgia’"
    ],
    answerIndex: 1,
    explanation: "It counters critics by emphasizing practicality.",
  },

  // Detail
  {
    type: "quiz",
    subject: "reading",
    id: "r6-detail-crows",
    topic: "Detail",
    passage:
      "In field studies of crows, researchers noticed juveniles engaging in ‘practice caching’—hiding pebbles in the soil and later retrieving them. While the behavior does not store food, it may build spatial memory and dexterity used in real caching.",
    prompt: "According to the passage, what is ‘practice caching’ hypothesized to develop?",
    choices: ["Vocal mimicry", "Spatial memory and dexterity", "Migration timing", "Mate selection"],
    answerIndex: 1,
    explanation: "The last sentence states the hypothesized function.",
  },

  // Quantitative (verbal description of chart)
  {
    type: "quiz",
    subject: "reading",
    id: "r7-quant-libraries",
    topic: "Quantitative",
    passage:
      "A study tracked library visits over 4 years: Year 1: 1.2M; Year 2: 1.1M; Year 3: 1.4M; Year 4: 1.6M.",
    prompt: "Which statement is best supported by the data?",
    choices: [
      "Visits fell every year.",
      "Year 3 marked a rebound after a dip.",
      "Year 2 had the highest visits.",
      "Year 4 saw fewer visits than Year 1."
    ],
    answerIndex: 1,
    explanation: "There’s a dip (Y2) and rebound (Y3→Y4).",
  },

  // Purpose
  {
    type: "quiz",
    subject: "reading",
    id: "r8-purpose-device",
    topic: "Purpose",
    passage:
      "While the device’s early reviews focused on novelty, subsequent studies emphasized its reliability under field conditions, an unglamorous trait that nonetheless drives adoption.",
    prompt: "The author’s primary purpose is to show that the device’s adoption is driven mainly by:",
    choices: ["advertising", "reliability", "novelty", "low cost"],
    answerIndex: 1,
    explanation: "Reliability is emphasized as the driver of adoption.",
  },

  // Logical consistency
  {
    type: "quiz",
    subject: "reading",
    id: "r9-logic-seasonal",
    topic: "Logic",
    passage:
      "The chef insists the menu is strictly seasonal, yet tomatoes—out of season locally—appear in several dishes. She responds that those tomatoes are greenhouse-grown within the region.",
    prompt: "Which choice best resolves the apparent inconsistency?",
    choices: [
      "The chef admits the menu isn’t seasonal after all.",
      "Greenhouse-grown regional tomatoes can be considered seasonal.",
      "Tomatoes are always in season everywhere.",
      "The menu avoids tomatoes entirely."
    ],
    answerIndex: 1,
    explanation: "Regional greenhouse supply aligns with the seasonal claim.",
  },

  // Tone
  {
    type: "quiz",
    subject: "reading",
    id: "r10-tone-pragmatic",
    topic: "Tone",
    passage:
      "The essay’s conclusion does not herald a revolution; it offers a modest checklist of next steps, the kind of practical measures that rarely make headlines.",
    prompt: "The tone toward the conclusion is best described as:",
    choices: ["reverent", "triumphant", "pragmatic", "sarcastic"],
    answerIndex: 2,
    explanation: "Language implies pragmatic, modest steps.",
  },

  {
    type: "lesson",
    subject: "reading",
    id: "reading-summary",
    title: "Summary: Reading",
    caption:
      "Great work. Want another pass or a different subject? Use Tutor Chat to practice evidence and inference one step at a time."
  },

  /* --------------------------- VOCAB --------------------------- */
  {
    type: "lesson",
    subject: "vocab",
    id: "vocab-intro",
    title: "Vocab Tip: Check Tone + Fit",
    caption:
      "Substitute the answer in the sentence. Does tone and meaning fit perfectly? If not, eliminate it.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v1-tentative",
    topic: "Context",
    prompt: "The scientist’s explanation was ___: careful, provisional, and open to revision.",
    choices: ["dogmatic", "tentative", "grandiose", "superfluous"],
    answerIndex: 1,
    explanation: "‘Tentative’ matches careful/provisional.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v2-perfunctory",
    topic: "Connotation",
    prompt: "The CEO’s praise sounded ___, more like a rehearsed speech than genuine appreciation.",
    choices: ["candid", "effusive", "perfunctory", "laudatory"],
    answerIndex: 2,
    explanation: "‘Perfunctory’ = minimal effort; insincere tone.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v3-scrupulous",
    topic: "Precision",
    prompt: "The historian was admired for her ___ use of sources, never stretching evidence beyond its limits.",
    choices: ["scrupulous", "capricious", "florid", "glib"],
    answerIndex: 0,
    explanation: "‘Scrupulous’ = careful and exact.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v4-trenchant",
    topic: "Tone",
    prompt: "Although he seemed shy, his remarks were surprisingly ___, cutting straight to the issue.",
    choices: ["diffuse", "trenchant", "vacuous", "wistful"],
    answerIndex: 1,
    explanation: "‘Trenchant’ = incisive.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v5-measured",
    topic: "Nuance",
    prompt: "Her review was ___, pointing out flaws without seeming harsh.",
    choices: ["scathing", "measured", "bombastic", "elliptical"],
    answerIndex: 1,
    explanation: "Balanced, restrained tone.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v6-derivative",
    topic: "Context",
    prompt: "The plan was ambitious but hardly ___; it followed a proven template.",
    choices: ["novel", "derivative", "untenable", "inchoate"],
    answerIndex: 1,
    explanation: "‘Derivative’ = based on something else.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v7-anomalous",
    topic: "Word choice",
    prompt: "Because the measurements were ___, the team repeated the trial to reduce error.",
    choices: ["redundant", "anomalous", "meticulous", "spurious"],
    answerIndex: 1,
    explanation: "Irregular results → repeat trials.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v8-lucid",
    topic: "Register",
    prompt: "The tone of the memo was refreshingly ___, avoiding jargon in favor of plain speech.",
    choices: ["arcane", "lucid", "esoteric", "turgid"],
    answerIndex: 1,
    explanation: "‘Lucid’ = clear.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v9-indifferent",
    topic: "Opposites",
    prompt: "Once celebrated as a prodigy, the violinist now faced a more ___ audience.",
    choices: ["rapturous", "indifferent", "credulous", "ardent"],
    answerIndex: 1,
    explanation: "Indifferent contrasts with earlier praise.",
  },

  {
    type: "quiz",
    subject: "vocab",
    id: "v10-extraneous",
    topic: "Precision",
    prompt: "The editor removed any ___ phrasing to keep the article tight and focused.",
    choices: ["ostentatious", "pellucid", "extraneous", "sonorous"],
    answerIndex: 2,
    explanation: "‘Extraneous’ = unnecessary.",
  },

  {
    type: "lesson",
    subject: "vocab",
    id: "vocab-summary",
    title: "Summary: Vocab",
    caption:
      "Strong finish. Keep testing tone and fit by substitution—your accuracy will climb fast."
  },
];
