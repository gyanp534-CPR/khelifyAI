// ===============================
// 🧠 AI ENGINE V3
// ===============================

// -------------------------------
// 1️⃣ WIN PROBABILITY
// -------------------------------
function calculateWinProbability(match) {
  try {
    const score = match.score || [];

    if (!score.length) return null;

    const raw = score[0] || "";
    const [runs, wickets] = raw.split('/').map(Number);

    if (!runs) return null;

    // Simple heuristic model
    let probability = 50;

    if (runs > 180) probability += 25;
    else if (runs > 150) probability += 15;
    else if (runs < 100) probability -= 20;

    if (wickets >= 5) probability -= 15;
    if (wickets >= 8) probability -= 25;

    return Math.max(5, Math.min(95, probability));
  } catch (err) {
    return null;
  }
}

// -------------------------------
// 2️⃣ MOMENTUM ENGINE
// -------------------------------
function calculateMomentum(match) {
  const score = JSON.stringify(match.score || "");

  if (!score) return "neutral";

  if (score.includes('/0') || score.includes('/1')) return "batting-strong";
  if (score.includes('/5') || score.includes('/6')) return "bowling-dominant";

  return "balanced";
}

// -------------------------------
// 3️⃣ PLAYER IMPACT (BASIC)
// -------------------------------
function estimatePlayerImpact(match) {
  const score = match.score || [];

  if (!score.length) return null;

  const raw = score[0] || "";
  const [runs, wickets] = raw.split('/').map(Number);

  let impact = "average";

  if (runs > 180) impact = "batting-dominant";
  if (wickets >= 5) impact = "bowling-dominant";

  return impact;
}

// -------------------------------
// 4️⃣ INSIGHTS GENERATOR
// -------------------------------
function generateInsights(match) {
  const insights = [];

  const status = (match.status || "").toLowerCase();
  const score = JSON.stringify(match.score || "");

  if (status.includes('live')) {
    insights.push("🔥 Match is live");
  }

  if (score.includes('/0') || score.includes('/1')) {
    insights.push("⚡ Strong opening start");
  }

  if (score.includes('/5') || score.includes('/6')) {
    insights.push("💥 Pressure on batting side");
  }

  if (!match.score || match.score.length === 0) {
    insights.push("⏳ Match yet to start");
  }

  return insights;
}

// -------------------------------
// 🔥 MAIN AI PIPELINE
// -------------------------------
function enrichMatch(match) {
  return {
    ...match,
    winProbability: calculateWinProbability(match),
    momentum: calculateMomentum(match),
    playerImpact: estimatePlayerImpact(match),
    insights: generateInsights(match),
  };
}

// -------------------------------
module.exports = {
  enrichMatch
};
