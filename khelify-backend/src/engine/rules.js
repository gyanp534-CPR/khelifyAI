/**
 * KHELIFY RULE ENGINE
 * Pure rule-based cricket intelligence — zero AI cost, high perceived value.
 * Every rule fires based on match state and returns a natural-language insight.
 * 
 * Future: log every rule trigger + final match outcome → training dataset for ML.
 */

// ─── UTILITY ────────────────────────────────────────────────────────────────
function pct(val, total) {
  return total > 0 ? Math.round((val / total) * 100) : 0;
}

// ─── POWERPLAY RULES (overs 1–10) ──────────────────────────────────────────
function analyzePowerplay(state) {
  const { runs, wickets, over, crr } = state;
  if (over > 10) return null;

  const insights = [];

  if (over <= 10 && wickets === 0 && runs > 70)
    insights.push({ type: 'positive', text: `Dream powerplay — ${runs} runs without loss. Platform set for 340+.` });

  if (over <= 10 && wickets === 0 && runs < 40)
    insights.push({ type: 'warning', text: `Subdued powerplay. Only ${runs}/${wickets} in ${over} overs — batting side playing cautiously.` });

  if (over <= 10 && wickets >= 3)
    insights.push({ type: 'danger', text: `Powerplay disaster — ${wickets} wickets already gone. Batting side in serious trouble early.` });

  if (over <= 6 && runs > 55 && wickets === 0)
    insights.push({ type: 'positive', text: `Explosive opening — ${runs} in just ${over} overs. Fielding restrictions being fully exploited.` });

  return insights.length ? insights : null;
}

// ─── MIDDLE OVERS RULES (11–35) ────────────────────────────────────────────
function analyzeMiddleOvers(state) {
  const { runs, wickets, over, crr, totalOvers } = state;
  if (over < 11 || over > 35) return null;

  const insights = [];

  if (crr < 5.0 && wickets < 4)
    insights.push({ type: 'warning', text: `Dot ball pressure in middle overs. Run rate at ${crr.toFixed(1)} — spinners controlling the game.` });

  if (crr > 8.0 && wickets < 3)
    insights.push({ type: 'positive', text: `Exceptional middle-over batting. ${crr.toFixed(1)} RR with wickets in hand — on track for massive total.` });

  if (wickets >= 5 && over < 30)
    insights.push({ type: 'danger', text: `${wickets} wickets down by over ${over} — batting side in freefall. Lower order must survive.` });

  if (over >= 20 && over <= 30 && wickets >= 4 && crr < 6)
    insights.push({ type: 'danger', text: `Classic middle-over collapse scenario — wickets + slow run rate is a double pressure.` });

  return insights.length ? insights : null;
}

// ─── DEATH OVER RULES (36–50) ──────────────────────────────────────────────
function analyzeDeathOvers(state) {
  const { runs, wickets, over, crr, totalOvers, projected } = state;
  if (over < 36) return null;

  const insights = [];

  if (over >= 45 && wickets < 6 && crr > 9)
    insights.push({ type: 'positive', text: `Explosive finish loading — batting with power hitters and wickets in hand in the death overs.` });

  if (over >= 40 && wickets >= 8)
    insights.push({ type: 'warning', text: `Tail batting in the death — every run is bonus territory now.` });

  if (over >= 44 && crr < 7 && wickets > 6)
    insights.push({ type: 'danger', text: `Below-par finish — losing wickets in death overs has hurt the run rate significantly.` });

  if (over === totalOvers - 1 && wickets < 5)
    insights.push({ type: 'positive', text: `Last over with wickets in hand — expect 15–20 runs in the final over.` });

  if (over >= 40 && over <= 47 && wickets < 5 && crr >= 6 && crr < 9)
    insights.push({ type: 'positive', text: `Strong position in the death — ${10 - wickets} wickets remaining past over ${Math.floor(over)}. Final push incoming.` });

  if (over >= 36 && wickets >= 6 && crr < 6.5)
    insights.push({ type: 'warning', text: `Wickets lost in the death are costing runs — batting side struggling to accelerate.` });

  return insights.length ? insights : null;
}

// ─── CHASE RULES ───────────────────────────────────────────────────────────
function analyzeChase(state) {
  const { runs, wickets, over, crr, rrr, target, totalOvers } = state;
  if (!target || target === 0) return null;

  const remaining = target - runs;
  const oversLeft = totalOvers - over;
  const insights = [];

  const pressure = rrr - crr;

  if (pressure > 4 && over > 20)
    insights.push({ type: 'danger', text: `Chase almost over — need ${rrr.toFixed(1)} RRR vs ${crr.toFixed(1)} current. Requires 2 miraculous overs.` });

  if (pressure > 2 && pressure <= 4 && over > 25)
    insights.push({ type: 'warning', text: `Chase heating up. Need ${rrr.toFixed(1)} per over with ${wickets} wickets down — tight but possible.` });

  if (pressure < 0.5 && over > 20 && wickets < 5)
    insights.push({ type: 'positive', text: `Comfortable chase — run rate under control, wickets in hand. Favourites to win.` });

  if (remaining <= 30 && oversLeft >= 3 && wickets < 7)
    insights.push({ type: 'positive', text: `${remaining} needed off ${oversLeft} overs — chase essentially done.` });

  if (remaining <= 50 && oversLeft === 1)
    insights.push({ type: remaining <= 18 ? 'positive' : 'danger', text: `Nail-biting last over — ${remaining} needed off 6 balls. ${remaining <= 18 ? 'Possible!' : 'Near impossible.'}` });

  if (over >= 40 && wickets <= 2 && pressure <= 1)
    insights.push({ type: 'positive', text: `Chase cruising. Two set batsmen, manageable target — this match is done.` });

  return insights.length ? insights : null;
}

// ─── TURNING POINT DETECTOR ────────────────────────────────────────────────
function detectTurningPoint(overHistory = []) {
  if (overHistory.length < 5) return null;

  // Find biggest 3-over swing (drop in run rate)
  let worstSwing = null;
  let worstDrop = 0;

  for (let i = 2; i < overHistory.length - 2; i++) {
    const before = (overHistory[i - 2].runs + overHistory[i - 1].runs) / 2;
    const after  = (overHistory[i + 1].runs + overHistory[i + 2].runs) / 2;
    const drop   = before - after;
    const wicketsInWindow = (overHistory[i].wickets || 0) + (overHistory[i + 1]?.wickets || 0);

    if (drop > 3 && wicketsInWindow >= 1 && drop > worstDrop) {
      worstDrop = drop;
      worstSwing = {
        fromOver: i - 1,
        toOver:   i + 2,
        runDrop:  Math.round(drop * 10) / 10,
        wickets:  wicketsInWindow,
      };
    }
  }

  if (!worstSwing) return null;

  return {
    type: 'turning_point',
    text: `Match shifted in overs ${worstSwing.fromOver}–${worstSwing.toOver} where run rate dropped by ${worstSwing.runDrop} and ${worstSwing.wickets} wicket(s) fell.`,
    data: worstSwing,
  };
}

// ─── PLAYER IMPACT SCORER ──────────────────────────────────────────────────
function scorePlayerImpact(player, matchContext = {}) {
  let score = 0;
  const factors = [];

  // Batting impact
  if (player.runs !== undefined) {
    const sr = player.strikeRate || (player.balls > 0 ? (player.runs / player.balls) * 100 : 0);
    if (player.runs > 100) { score += 4.5; factors.push('century'); }
    else if (player.runs > 50) { score += 2.5; factors.push('half-century'); }
    else if (player.runs > 30) { score += 1.5; factors.push('useful knock'); }

    if (sr > 150) { score += 2.5; factors.push('explosive SR'); }
    else if (sr > 120) { score += 1.5; factors.push('good SR'); }
    else if (sr > 100) { score += 0.8; factors.push('solid SR'); }
    else if (sr < 70 && player.balls > 20) { score -= 0.5; factors.push('slow SR'); }
  }

  // Bowling impact
  if (player.wickets !== undefined) {
    if (player.wickets >= 4) { score += 3.5; factors.push('4-wicket haul'); }
    else if (player.wickets >= 3) { score += 2.5; factors.push('3-wicket haul'); }
    else if (player.wickets >= 2) { score += 1.5; factors.push('2 wickets'); }
    else if (player.wickets === 1) { score += 0.8; factors.push('1 wicket'); }

    const eco = player.economy || 0;
    if (eco < 5 && player.overs >= 4) { score += 1.5; factors.push('tight economy'); }
    else if (eco > 10) { score -= 0.5; factors.push('expensive'); }
  }

  // Fielding
  if (player.catches >= 2) { score += 0.5; factors.push('key catches'); }

  const finalScore = Math.min(10, Math.max(0, Math.round(score * 10) / 10));
  return { score: finalScore, factors, grade: scoreToGrade(finalScore) };
}

function scoreToGrade(score) {
  if (score >= 8)   return 'A+';
  if (score >= 6.5) return 'A';
  if (score >= 5)   return 'B+';
  if (score >= 3.5) return 'B';
  if (score >= 2)   return 'C';
  return 'D';
}

// ─── WIN PROBABILITY ───────────────────────────────────────────────────────
function calcWinProbability(state) {
  const { runs, wickets, over, crr, rrr, target, totalOvers, isFirstInnings, matchType } = state;

  if (isFirstInnings || !target) {
    // First innings — estimate based on projected vs par
    const par = matchType === "t20" ? 155 : 280;
    const projected = (runs / over) * totalOvers;
    const diff = projected - par;
    const base = 50 + Math.min(30, Math.max(-30, diff / 3));
    return { batting: Math.round(base), fielding: Math.round(100 - base) };
  }

  // Second innings chase
  const pressure = rrr - crr;
  const wicketFactor = wickets * 3;
  const overFactor = (over / totalOvers) * 10;
  const chanceOfWin = 50 - (pressure * 10) - wicketFactor + overFactor;
  const batting = Math.min(95, Math.max(5, Math.round(chanceOfWin)));

  return { batting, fielding: 100 - batting };
}

// ─── MATCH NARRATIVE GENERATOR ─────────────────────────────────────────────
function generateMatchNarrative(state) {
  const { team1, team2, runs, wickets, over, totalOvers, target, isFirstInnings } = state;
  const crr = runs / Math.max(1, over);

  let headline, summary;

  if (isFirstInnings) {
    const projected = Math.round(crr * totalOvers);

    const target1 = totalOvers === 20 ? 200 : 340;
    const target2 = totalOvers === 20 ? 170 : 280;
    if (projected > target1) {
      headline = `${team1} on course for a massive total`;
      summary = `At ${runs}/${wickets} in ${over} overs, ${team1} are batting brilliantly. Projected ${projected} — a challenging target awaits ${team2}.`;
    } else if (projected > target2) {
      headline = `Solid batting display by ${team1}`;
      summary = `${runs}/${wickets} in ${over} overs. Projected ${projected} — competitive but chaseable target shaping up.`;
    } else {
      headline = `${team1} struggling to build momentum`;
      summary = `Only ${runs}/${wickets} in ${over} overs. Below-par batting — ${team2} will back themselves to chase this.`;
    }
  } else {
    const remaining = target - runs;
    const rrrCalc   = remaining / Math.max(1, totalOvers - over);

    if (rrrCalc < 6 && wickets < 6) {
      headline = `${team1} cruising in the chase`;
      summary  = `Need ${remaining} off ${totalOvers - over} overs at ${rrrCalc.toFixed(1)} RRR. Comfortable with ${10 - wickets} wickets remaining.`;
    } else if (rrrCalc > 12) {
      headline = `${team2} on the verge of victory`;
      summary  = `${team1} need ${remaining} off ${totalOvers - over} overs — the required rate of ${rrrCalc.toFixed(1)} is almost impossible.`;
    } else {
      headline = `Tight chase — match in the balance`;
      summary  = `${team1} need ${remaining} off ${totalOvers - over} overs at ${rrrCalc.toFixed(1)} RRR with ${10 - wickets} wickets. Anyone's game.`;
    }
  }

  return { headline, summary };
}

// ─── MAIN ENGINE ENTRY POINT ────────────────────────────────────────────────
function analyzeMatch(matchData, overHistory = []) {
  const state = normalizeMatchState(matchData);

  const allInsights = [
    ...(analyzePowerplay(state) || []),
    ...(analyzeMiddleOvers(state) || []),
    ...(analyzeDeathOvers(state) || []),
    ...(analyzeChase(state) || []),
  ].slice(0, 5); // cap at 5 insights

  const turningPoint = detectTurningPoint(overHistory);
  const narrative    = generateMatchNarrative(state);
  const winProb      = calcWinProbability(state);

  return {
    insights:    allInsights,
    turningPoint,
    narrative,
    winProbability: winProb,
    matchState:  state,
    generatedAt: new Date().toISOString(),
  };
}

// Normalize raw CricAPI data into engine-friendly shape
function normalizeMatchState(raw) {
  const score = raw?.score?.[0] || {};

  return {
    team1:         raw.t1 || raw.teamInfo?.[0]?.name || 'Team A',
    team2:         raw.t2 || raw.teamInfo?.[1]?.name || 'Team B',
    runs:          score.r || 0,
    wickets:       score.w || 0,
    over:          parseFloat(score.o) || 0,
    totalOvers:    raw.matchType === 't20' ? 20 : 50,
    crr:           score.r && score.o ? score.r / parseFloat(score.o) : 0,
    rrr:           raw.rrr || 0,
    target:        raw.target || 0,
    isFirstInnings: !raw.target || raw.target === 0,
    matchType:     raw.matchType || 'odi',
    status:        raw.status || '',
    projected:     score.r && score.o ? Math.round((score.r / parseFloat(score.o)) * (raw.matchType === 't20' ? 20 : 50)) : 0,
  };
}

module.exports = {
  analyzeMatch,
  detectTurningPoint,
  scorePlayerImpact,
  calcWinProbability,
  generateMatchNarrative,
  normalizeMatchState,
  categorizeInsight: (i) => i.type,
};
