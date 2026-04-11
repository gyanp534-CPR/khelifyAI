// ===============================
// 🧠 AI ENGINE V3 (STABLE)
// ===============================

// -------------------------------
// 🔧 SAFE SCORE PARSER
// -------------------------------
function parseScore(scoreArr) {
  try {
    if (!Array.isArray(scoreArr) || scoreArr.length === 0) return null;

    const first = scoreArr[0];

    // Case 1: string → "212/2"
    if (typeof first === 'string') {
      const parts = first.split('/');
      return {
        runs: Number(parts[0]) || 0,
        wickets: Number(parts[1]) || 0,
      };
    }

    // Case 2: object → { r: 212, w: 2 }
    if (typeof first === 'object') {
      return {
        runs: Number(first.r) || 0,
        wickets: Number(first.w) || 0,
      };
    }

    return null;

  } catch (e) {
    return null;
  }
}

// -------------------------------
// 1️⃣ WIN PROBABILITY
// -------------------------------
function calculateWinProbability(match) {
  try {
    const parsed = parseScore(match.score);

    if (!parsed) return null;

    const { runs, wickets } = parsed;

    let probability = 50;

    if (runs > 180) probability += 25;
    else if (runs > 150) probability += 15;
    else if (runs < 100) probability -= 20;

    if (wickets >= 5) probability -= 15;
    if (wickets >= 8) probability -= 25;

    return Math.max(5, Math.min(95, probability));

  } catch {
    return null;
  }
}

// -------------------------------
// 2️⃣ MOMENTUM ENGINE
// -------------------------------
function calculateMomentum(match) {
  try {
    const parsed = parseScore(match.score);

    if (!parsed) return "neutral";

    const { wickets } = parsed;

    if (wickets <= 1) return "batting-strong";
    if (wickets >= 5) return "bowling-dominant";

    return "balanced";

  } catch {
    return "neutral";
  }
}

// -------------------------------
// 3️⃣ PLAYER IMPACT
// -------------------------------
function estimatePlayerImpact(match) {
  try {
    const parsed = parseScore(match.score);

    if (!parsed) return null;

    const { runs, wickets } = parsed;

    if (runs > 180) return "batting-dominant";
    if (wickets >= 5) return "bowling-dominant";

    return "average";

  } catch {
    return null;
  }
}

// -------------------------------
// 4️⃣ INSIGHTS GENERATOR
// -------------------------------
function generateInsights(match) {
  const insights = [];

  try {
    const status = (match.status || "").toLowerCase();
    const parsed = parseScore(match.score);

    if (status.includes('live')) {
      insights.push("🔥 Match is live");
    }

    if (!parsed) {
      insights.push("⏳ Match yet to start");
      return insights;
    }

    if (parsed.wickets <= 1) {
      insights.push("⚡ Strong opening start");
    }

    if (parsed.wickets >= 5) {
      insights.push("💥 Batting under pressure");
    }

  } catch {
    insights.push("⚠ Unable to analyze match");
  }

  return insights;
}

// -------------------------------
// 🔥 MAIN AI PIPELINE
// -------------------------------
function enrichMatch(match) {
  try {
    return {
      ...match,
      winProbability: calculateWinProbability(match),
      momentum: calculateMomentum(match),
      playerImpact: estimatePlayerImpact(match),
      insights: generateInsights(match),
    };
  } catch (e) {
    console.warn('[AI] Failed to enrich match:', match?.id);
    return match; // NEVER break API
  }
}

// -------------------------------
module.exports = {
  enrichMatch
};
