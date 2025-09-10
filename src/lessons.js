// src/lessons.js
export const lessons = [

  /* ===================== MATH ===================== */
  { id: "m1", subject: "math", type: "lesson",
    title: "Quick Hack: Linear Equations",
    caption: "Undo operations in reverse order: add/subtract → multiply/divide." },

  { id: "m2", subject: "math", type: "quiz",
    prompt: "If 3x + 7 = 19, what is x?",
    choices: ["2", "3", "4", "5"],
    answerIndex: 1,
    explanation: "Subtract 7 (12), divide by 3 → x = 4. Trap: picking 2 by subtracting wrong."
  },

  { id: "m3", subject: "math", type: "lesson",
    title: "Trap Alert: Distribution",
    caption: "Always distribute across parentheses: a(b+c)=ab+ac." },

  { id: "m4", subject: "math", type: "quiz",
    prompt: "Simplify: 2(x+4) = 18. Solve for x.",
    choices: ["5", "7", "8", "14"],
    answerIndex: 0,
    explanation: "Distribute → 2x+8=18 → 2x=10 → x=5. Trap: forgetting to double the 4."
  },

  { id: "m5", subject: "math", type: "lesson",
    title: "Systems: Substitution",
    caption: "Isolate one variable, plug into the other equation." },

  { id: "m6", subject: "math", type: "quiz",
    prompt: "Solve: y = 2x+1 and x+y=7. What is x?",
    choices: ["2", "3", "4", "5"],
    answerIndex: 0,
    explanation: "x+(2x+1)=7 → 3x+1=7 → x=2. Trap: x=3 if you forgot the +1."
  },

  { id: "m7", subject: "math", type: "lesson",
    title: "Data: Slope & Rate",
    caption: "Slope = rise/run = rate of change." },

  { id: "m8", subject: "math", type: "quiz",
    prompt: "Line through (0,2) and (4,10): slope = ?",
    choices: ["2", "1/2", "8", "4"],
    answerIndex: 0,
    explanation: "Rise=8, run=4 → slope=2. Trap: 1/2 if you flipped rise/run."
  },

  { id: "m9", subject: "math", type: "quiz",
    prompt: "Function f(x)=2x²−3. What is f(3)?",
    choices: ["15", "12", "18", "21"],
    answerIndex: 2,
    explanation: "2(9)−3=18−3=15. Correct=15. Trap: 21 if you added instead."
  },

  { id: "m10", subject: "math", type: "quiz",
    prompt: "Right triangle legs 5 and 12. Hypotenuse = ?",
    choices: ["12", "13", "14", "17"],
    answerIndex: 1,
    explanation: "5²+12²=25+144=169 → √169=13. Trap: 17 from adding legs."
  },

  /* ==================== READING ==================== */
  { id: "r1", subject: "reading", type: "lesson",
    title: "Strategy: Evidence First",
    caption: "Prove answers with a line reference, not your gut." },

  { id: "r2", subject: "reading", type: "lesson",
    title: "Mini-Passage A",
    caption: "“Although wind farms require significant space, they provide clean energy that reduces long-term environmental costs.”" },

  { id: "r3", subject: "reading", type: "quiz",
    prompt: "Main purpose of Passage A?",
    choices: [
      "Argue against wind farms",
      "Highlight both costs and benefits",
      "Describe mechanics of turbines",
      "Promote fossil fuels"
    ],
    answerIndex: 1,
    explanation: "Acknowledges cost but emphasizes clean energy. Trap: choice 1 misreads."
  },

  { id: "r4", subject: "reading", type: "quiz",
    prompt: "Which phrase best supports your answer?",
    choices: [
      "require significant space",
      "provide clean energy",
      "reduces long-term costs",
      "both B and C"
    ],
    answerIndex: 3,
    explanation: "Both benefits support purpose. Trap: picking just one detail."
  },

  { id: "r5", subject: "reading", type: "lesson",
    title: "Mini-Passage B",
    caption: "“The researcher’s data contradicted the initial hypothesis; nevertheless, the unexpected pattern revealed a promising direction for future work.”" },

  { id: "r6", subject: "reading", type: "quiz",
    prompt: "Tone of Passage B?",
    choices: ["optimistic", "skeptical", "dismissive", "neutral"],
    answerIndex: 0,
    explanation: "Acknowledges setback but ends with hope. Trap: skeptical from first clause."
  },

  { id: "r7", subject: "reading", type: "quiz",
    prompt: "Function of 'nevertheless'?",
    choices: ["to concede a point", "to signal contrast", "to add evidence", "to define a term"],
    answerIndex: 1,
    explanation: "'Nevertheless' contrasts hypothesis vs. new direction."
  },

  { id: "r8", subject: "reading", type: "lesson",
    title: "Mini-Passage C",
    caption: "“The author admires Franklin’s ingenuity, yet critiques his failure to address social inequalities.”" },

  { id: "r9", subject: "reading", type: "quiz",
    prompt: "What best describes the author’s attitude toward Franklin?",
    choices: ["Wholly admiring", "Balanced: praise and critique", "Critical and dismissive", "Neutral"],
    answerIndex: 1,
    explanation: "Admires ingenuity but critiques failure. Trap: 'admiring only.'"
  },

  { id: "r10", subject: "reading", type: "quiz",
    prompt: "Evidence for your answer?",
    choices: [
      "admires ingenuity",
      "critiques failure",
      "both admiration and critique",
      "mentions Franklin"
    ],
    answerIndex: 2,
    explanation: "Both sides show balance. Trap: picking just one phrase."
  },

  /* ==================== VOCAB ==================== */
  { id: "v1", subject: "vocab", type: "lesson",
    title: "Context Clues: Contrast",
    caption: "Although/However signals opposite meaning." },

  { id: "v2", subject: "vocab", type: "quiz",
    prompt: "“Although the support was \"tepid\", the bill eventually passed.” In context, ‘tepid’ most nearly means:",
    choices: ["lukewarm/weak", "enthusiastic", "hostile", "confident"],
    answerIndex: 0,
    explanation: "‘Although’ → opposite of strong → weak support."
  },

  { id: "v3", subject: "vocab", type: "lesson",
    title: "Context Clues: Results",
    caption: "Therefore/Thus signal cause-effect." },

  { id: "v4", subject: "vocab", type: "quiz",
    prompt: "“The solution was **pragmatic**, focusing on realistic steps.” ‘Pragmatic’ most nearly means:",
    choices: ["idealistic", "practical", "hasty", "unrealistic"],
    answerIndex: 1,
    explanation: "Pragmatic = practical. Trap: idealistic (opposite)."
  },

  { id: "v5", subject: "vocab", type: "quiz",
    prompt: "“Her remarks were **succinct** yet complete.” ‘Succinct’ most nearly means:",
    choices: ["brief", "unclear", "wordy", "tentative"],
    answerIndex: 0,
    explanation: "Succinct = brief and to the point."
  },

  { id: "v6", subject: "vocab", type: "lesson",
    title: "Trap Alert: Fancy ≠ Correct",
    caption: "SAT rewards precise fit, not the fanciest word." },

  { id: "v7", subject: "vocab", type: "quiz",
    prompt: "“The therapy aims to **alleviate** pain.” ‘Alleviate’ most nearly means:",
    choices: ["reduce", "increase", "ignore", "celebrate"],
    answerIndex: 0,
    explanation: "Alleviate = lessen/reduce."
  },

  { id: "v8", subject: "vocab", type: "quiz",
    prompt: "“His remarks were **candid**.” ‘Candid’ most nearly means:",
    choices: ["honest", "secretive", "careful", "funny"],
    answerIndex: 0,
    explanation: "Candid = honest/open."
  },

  { id: "v9", subject: "vocab", type: "quiz",
    prompt: "“The student was **diligent**, finishing every assignment carefully.” ‘Diligent’ most nearly means:",
    choices: ["lazy", "careful", "enthusiastic", "casual"],
    answerIndex: 1,
    explanation: "Diligent = careful, hard-working."
  },

  { id: "v10", subject: "vocab", type: "quiz",
    prompt: "“The solution was **inevitable** given the evidence.” ‘Inevitable’ most nearly means:",
    choices: ["avoidable", "certain", "unlikely", "confusing"],
    answerIndex: 1,
    explanation: "Inevitable = certain/unavoidable."
  },
];
