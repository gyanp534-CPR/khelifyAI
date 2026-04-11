// engine/aiEngineV4.js

import { calcRunRate, calcRequiredRunRate, getMatchPhase, getOversLeft } from "../utils/matchUtils.js";

export function aiEngineV4(match) {
  try {
    const {
      teamA,
      teamB,
      scoreA,
      scoreB,
      totalOvers = 20,
      target,
    } = match;

    if (!scoreA) return null;

    const currentRR = calcRunRate(scoreA.runs, scoreA.overs);
    const phase = getMatchPhase(scoreA.overs);

    let requiredRR = null;
    let winProbability = 50;

    if (target) {
      const oversLeft = getOversLeft(totalOvers, scoreA.overs);
      requiredRR = calcRequiredRunRate(target, scoreA.runs, oversLeft);

      // Win probability logic (simple but scalable)
      const rrDiff = currentRR - requiredRR;

      winProbability = Math.max(
        5,
        Math.min(95, 50 + rrDiff * 10 - scoreA.wickets * 2)
      );
    }

    // Momentum logic
    let momentum = "neutral";
    if (currentRR > 9 && scoreA.wickets <= 3) momentum = "batting-strong";
    else if (scoreA.wickets >= 6) momentum = "bowling-dominant";

    // Turning point detection
    let turningPoint = null;
    if (scoreA.wickets >= 3 && scoreA.overs < 10) {
      turningPoint = "Early collapse shifted momentum";
    } else if (phase === "death-overs" && currentRR > 10) {
      turningPoint = "Late acceleration changed match dynamics";
    }

    // Insight generator
    const insight = generateInsight({
      phase,
      momentum,
      currentRR,
      requiredRR,
    });

    // Commentary generator
    const commentary = generateCommentary({
      teamA,
      teamB,
      momentum,
      phase,
    });

    return {
      winProbability: Math.round(winProbability),
      momentum,
      phase,
      currentRunRate: currentRR,
      requiredRunRate: requiredRR,
      insight,
      commentary,
      turningPoint,
    };
  } catch (err) {
    console.error("AI Engine V4 Error:", err);
    return null; // FAIL SAFE
  }
}

// ------------------------

function generateInsight({ phase, momentum, currentRR, requiredRR }) {
  if (momentum === "batting-strong") {
    return `Batting side dominating in ${phase} with RR ${currentRR}`;
  }

  if (requiredRR && requiredRR > currentRR) {
    return `Pressure building as required RR (${requiredRR}) exceeds current pace`;
  }

  return `Balanced contest in ${phase}`;
}

function generateCommentary({ teamA, teamB, momentum, phase }) {
  if (momentum === "batting-strong") {
    return `${teamA} is accelerating brilliantly in the ${phase}.`;
  }

  if (momentum === "bowling-dominant") {
    return `${teamB} has pulled things back with crucial wickets.`;
  }

  return `Both teams are fighting hard in the ${phase}.`;
}
