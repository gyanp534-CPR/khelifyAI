// utils/scoreParser.js

export function parseScore(score) {
  try {
    if (!score) return null;

    // Case 1: Already structured
    if (typeof score === "object") {
      return {
        runs: score.runs ?? 0,
        wickets: score.wickets ?? 0,
        overs: parseOvers(score.overs ?? "0"),
      };
    }

    // Case 2: String "180/3 (15.2)"
    const match = score.match(/(\d+)\/(\d+)\s*\(([\d.]+)\)/);

    if (!match) return null;

    return {
      runs: parseInt(match[1]),
      wickets: parseInt(match[2]),
      overs: parseOvers(match[3]),
    };
  } catch (err) {
    return null; // NEVER CRASH
  }
}

// Convert 15.2 -> 15 overs + 2 balls = 15.333
function parseOvers(oversStr) {
  const [overs, balls] = oversStr.split(".").map(Number);
  return overs + (balls || 0) / 6;
}
