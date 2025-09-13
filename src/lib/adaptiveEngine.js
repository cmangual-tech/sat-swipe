// src/lib/adaptiveEngine.js
// Lightweight adaptive engine for SAT Swipe (no backend)
// - Tracks user mastery per topic (ELO-like rating, 400–1600)
// - Tracks item stats (seen/correct/wrong/lastSeen)
// - Chooses next items by matching difficulty to user topic rating, with randomness
// - Builds an adaptive "playlist" (ordered feed) per subject
// - Exposes a dashboard summary for UI

const LS_KEY = "satx_user_model_v1";

// ---------- Public API ----------

export const Adaptive = {
  initModel,
  recordResult,            // (item, wasCorrect) -> void
  nextItem,                // (subject, lessons, opts?) -> item
  buildAdaptiveFeed,       // (subject, lessons, {count, completed}) -> ordered items
  getDashboard,            // () -> { topics[], overall, weaknesses[], strengths[] }
  resetModel,              // () -> void
};

// ---------- Core model ----------

function initModel(lessons) {
  const m = _read() || _empty();
  // seed topics from current lessons
  const topics = new Set();
  lessons.forEach(it => {
    if (it.type === "quiz") {
      const t = _topicKey(it);
      if (t) topics.add(t);
    }
  });
  topics.forEach(tk => {
    if (!m.topics[tk]) {
      m.topics[tk] = _newTopicState();
    }
  });
  _write(m);
  return m;
}

function resetModel() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

function recordResult(item, wasCorrect) {
  const m = _read() || _empty();
  const id = item?.id;
  const tk = _topicKey(item);
  const now = Date.now();

  if (!id) return;
  if (!m.items[id]) m.items[id] = _newItemState();

  // Update item stats
  const it = m.items[id];
  it.seen = (it.seen || 0) + 1;
  it.lastSeen = now;
  if (wasCorrect) it.correct = (it.correct || 0) + 1;
  else it.wrong = (it.wrong || 0) + 1;

  // Update topic rating (ELO-like)
  if (tk) {
    if (!m.topics[tk]) m.topics[tk] = _newTopicState();
    const topic = m.topics[tk];

    // Infer item difficulty (400–1600). Prefer explicit difficulty if present.
    const diff = _inferDifficulty(item, topic.rating);

    // ELO update: expected score vs. actual
    const expected = 1 / (1 + Math.pow(10, (diff - topic.rating) / 400));
    const actual = wasCorrect ? 1 : 0;
    const k = wasCorrect ? 22 : 28; // learn faster when wrong
    topic.rating = _clamp(Math.round(topic.rating + k * (actual - expected)), 400, 1600);

    // Counters
    topic.seen = (topic.seen || 0) + 1;
    topic.correct = (topic.correct || 0) + (wasCorrect ? 1 : 0);
    topic.wrong = (topic.wrong || 0) + (wasCorrect ? 0 : 1);

    // Simple spaced repetition signal (lower = needs review)
    const delta = wasCorrect ? -0.15 : +0.35;
    topic.fatigue = _clamp((topic.fatigue || 0) + delta, -1, 2);
    topic.last = now;
  }

  // History (cap length)
  m.history.push({
    id,
    subject: item.subject || null,
    topic: tk,
    correct: !!wasCorrect,
    ts: now,
  });
  if (m.history.length > 500) m.history = m.history.slice(-500);

  _write(m);
}

function nextItem(subject, lessons, opts = {}) {
  // Returns ONE next item for a given subject
  // Strategy:
  // 1) pick a topic: weighted toward weaker topics + freshness
  // 2) pick an item near the topic rating (target difficulty)
  // 3) avoid repeats from last few shown; add light randomness
  const m = initModel(lessons);

  const pool = lessons.filter(it => it.subject === subject && it.type === "quiz");
  if (pool.length === 0) return null;

  // Build topic buckets for this subject
  const topics = _topicsForSubject(pool);
  if (topics.length === 0) return _randomFrom(pool);

  // Weight topics: lower mastery (rating), higher wrong%, older last-seen → higher weight
  const weighted = topics.map(tk => {
    const st = m.topics[tk] || _newTopicState();
    const mastery = st.rating; // 400–1600
    const wrongRate = st.seen ? (st.wrong || 0) / st.seen : 0.4; // assume some weakness if unseen
    const staleness = _stalenessBoost(st.last); // 1..1.5
    // weight ↓ with mastery, ↑ with wrongRate & staleness
    const w = (1.2 - (mastery - 400) / 1600) * (0.7 + wrongRate) * staleness;
    return { tk, w: _clamp(w, 0.05, 3) };
  });

  const topicPicked = _weightedPick(weighted);
  const topicState = m.topics[topicPicked] || _newTopicState();
  const target = topicState.rating; // target difficulty

  // Candidate items in topic
  const candidates = pool.filter(it => _topicKey(it) === topicPicked);
  if (candidates.length === 0) return _randomFrom(pool);

  // Avoid immediate repeats: last 5 from history
  const avoid = new Set(m.history.slice(-5).map(h => h.id));
  const ranked = candidates
    .filter(it => !avoid.has(it.id))
    .map(it => {
      const diff = _inferDifficulty(it, target);
      const gap = Math.abs(diff - target);
      const seen = (m.items[it.id]?.seen || 0);
      const penalty = seen > 0 ? 0.05 * seen : 0;         // de-prioritize overexposed items
      const spice = Math.random() * 30;                   // keep it a bit fresh
      const score = gap + penalty + spice;                // lower is better
      return { it, score };
    })
    .sort((a, b) => a.score - b.score);

  // Occasionally inject a review item from weakest topic (~15% time)
  if (Math.random() < 0.15) {
    const weakTk = _weakestTopic(topics.map(tk => ({ tk, st: m.topics[tk] || _newTopicState() })));
    const weakPool = pool.filter(it => _topicKey(it) === weakTk && !avoid.has(it.id));
    if (weakPool.length) {
      return _randomFrom(weakPool);
    }
  }

  return ranked.length ? ranked[0].it : _randomFrom(candidates);
}

function buildAdaptiveFeed(subject, lessons, { count = 20, completed } = {}) {
  // Builds an ORDERED list of items for the feed (quiz + lessons it finds).
  // Uses nextItem repeatedly; keeps dedup; mixes intro/summary if present.
  const m = initModel(lessons);
  const intro = lessons.find(it => it.subject === subject && it.type === "lesson" && /intro/i.test(it.id || it.title || ""));
  const summary = lessons.find(it => it.subject === subject && it.type === "lesson" && /^summary:/i.test(it.title || "") || /-end$/.test(it.id || ""));

  const out = [];
  if (intro) out.push(intro);

  const used = new Set();
  if (completed && completed.size) {
    for (const id of completed) used.add(id);
  }

  let guard = 0;
  while (out.filter(x => x.type === "quiz").length < count && guard < count * 10) {
    guard++;
    const item = nextItem(subject, lessons);
    if (!item) break;
    if (used.has(item.id)) continue;
    used.add(item.id);
    out.push(item);
  }

  if (summary) out.push(summary);
  return out;
}

function getDashboard(lessons) {
  const m = initModel(lessons);
  const topics = Object.entries(m.topics).map(([tk, st]) => {
    const { subject, topic } = _splitTopicKey(tk);
    const level = _levelFor(st.rating);
    const acc = st.seen ? Math.round(((st.correct || 0) / st.seen) * 100) : null;
    return {
      key: tk,
      subject,
      topic,
      rating: st.rating,
      level,         // Bronze / Silver / Gold / Platinum
      seen: st.seen || 0,
      correct: st.correct || 0,
      wrong: st.wrong || 0,
      accuracy: acc, // %
      last: st.last || null,
    };
  });

  // Overall (simple mean rating over topics with at least 3 seen, else over all)
  const used = topics.filter(t => t.seen >= 3);
  const pool = used.length ? used : topics;
  const avg = pool.length ? Math.round(pool.reduce((s, t) => s + t.rating, 0) / pool.length) : 800;

  const weaknesses = [...topics].sort((a, b) => a.rating - b.rating).slice(0, 3);
  const strengths  = [...topics].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return { topics, overall: { rating: avg, level: _levelFor(avg) }, weaknesses, strengths };
}

// ---------- Helpers ----------

function _empty() {
  return { topics: {}, items: {}, history: [] };
}
function _read() {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function _write(m) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(m)); } catch {}
}

function _newTopicState() {
  return {
    rating: 800,   // start around “Silver-” range
    seen: 0,
    correct: 0,
    wrong: 0,
    fatigue: 0,
    last: null,
  };
}
function _newItemState() {
  return { seen: 0, correct: 0, wrong: 0, lastSeen: null };
}

function _topicKey(it) {
  const subj = (it?.subject || "").toLowerCase();
  const top  = (it?.topic || "general").toLowerCase();
  if (!subj) return null;
  return `${subj}::${top}`;
}
function _splitTopicKey(tk) {
  const [subject, topic] = (tk || "").split("::");
  return { subject, topic };
}

function _topicsForSubject(pool) {
  const set = new Set();
  pool.forEach(it => set.add(_topicKey(it)));
  return Array.from(set).filter(Boolean);
}

function _inferDifficulty(item, fallback = 800) {
  // Priority: explicit difficulty on item (400–1600)
  if (typeof item.difficulty === "number") {
    return _clamp(Math.round(item.difficulty), 400, 1600);
  }
  // Heuristic by topic
  const t = (item.topic || "").toLowerCase();
  if (/quadratic|exponent|system|function/.test(t)) return 950;
  if (/percent|ratio|proportion|slope|linear/.test(t)) return 800;
  if (/inference|evidence|logic|consistency|function \(reading\)/.test(t)) return 900;
  if (/vocab|context|connotation|tone|precision/.test(t)) return 750;

  // Otherwise: mild randomization around fallback
  return _clamp(Math.round(fallback + (Math.random() * 120 - 60)), 400, 1600);
}

function _stalenessBoost(lastTs) {
  if (!lastTs) return 1.4;               // never seen → review boost
  const days = (Date.now() - lastTs) / 86400000;
  if (days > 7)  return 1.4;
  if (days > 3)  return 1.25;
  if (days > 1)  return 1.1;
  return 1.0;
}

function _weightedPick(arr) {
  const sum = arr.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * sum;
  for (const x of arr) {
    if ((r -= x.w) <= 0) return x.tk;
  }
  return arr[0]?.tk;
}

function _weakestTopic(arr) {
  // arr: [{tk, st}]
  return arr
    .map(x => ({ tk: x.tk, rating: (x.st?.rating ?? 800) }))
    .sort((a, b) => a.rating - b.rating)[0]?.tk;
}

function _randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function _clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function _levelFor(r) {
  if (r < 700)  return "Bronze";
  if (r < 900)  return "Silver";
  if (r < 1100) return "Gold";
  return "Platinum";
}
