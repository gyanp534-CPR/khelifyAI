export function calcRunRate(runs, overs) {
  if (!overs || overs === 0) return 0;
  return +(runs / overs).toFixed(2);
}

export function calcRequiredRunRate(target, currentRuns, oversLeft) {
  if (!oversLeft || oversLeft <= 0) return 0;
  const runsNeeded = target - currentRuns;
  return +(runsNeeded / oversLeft).toFixed(2);
}

export function getMatchPhase(overs) {
  if (overs <= 6) return "powerplay";
  if (overs <= 15) return "middle-overs";
  return "death-overs";
}

export function getOversLeft(totalOvers, currentOvers) {
  return +(totalOvers - currentOvers).toFixed(2);
}
