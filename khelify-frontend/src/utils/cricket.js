import { formatDistanceToNow } from 'date-fns';

export function formatOvers(o) {
  if (!o && o !== 0) return '—';
  const overs = Math.floor(o);
  const balls = Math.round((o - overs) * 10);
  return balls === 0 ? `${overs}.0` : `${overs}.${balls}`;
}

export function calcCRR(runs, overs) {
  if (!overs || overs === 0) return 0;
  return (runs / overs).toFixed(2);
}

export function calcRRR(target, runs, overs, totalOvers = 50) {
  const remaining = target - runs;
  const oversLeft = totalOvers - overs;
  if (oversLeft <= 0 || remaining <= 0) return 0;
  return (remaining / oversLeft).toFixed(2);
}

export function calcProjected(runs, overs, totalOvers = 50) {
  if (!overs || overs === 0) return 0;
  return Math.round((runs / overs) * totalOvers);
}

export function getMatchPhase(over, totalOvers = 50) {
  const pct = over / totalOvers;
  if (pct <= 0.2) return 'powerplay';
  if (pct <= 0.7) return 'middle';
  return 'death';
}

export function isMatchLive(status = '') {
  const s = status.toLowerCase();
  return s.includes('live') || s.includes('innings') || s.includes('over') || s.includes('bat');
}

export function getInsightColor(type) {
  return { positive: 'var(--green)', danger: 'var(--red)', warning: 'var(--amber)', turning_point: 'var(--accent)' }[type] || 'var(--t2)';
}

export function getInsightBg(type) {
  return { positive: 'var(--green-dim)', danger: 'var(--red-dim)', warning: 'var(--amber-dim)', turning_point: 'var(--accent-dim)' }[type] || 'transparent';
}

export function getWinProbColor(prob) {
  if (prob >= 70) return 'var(--green)';
  if (prob >= 45) return 'var(--amber)';
  return 'var(--red)';
}

export function timeAgo(dateString) {
  try { return formatDistanceToNow(new Date(dateString), { addSuffix: true }); }
  catch { return ''; }
}

export function getTeamShort(name = '') {
  const map = {
    'india': 'IND', 'pakistan': 'PAK', 'australia': 'AUS',
    'england': 'ENG', 'south africa': 'SA', 'new zealand': 'NZ',
    'west indies': 'WI', 'sri lanka': 'SL', 'bangladesh': 'BAN',
    'afghanistan': 'AFG', 'zimbabwe': 'ZIM', 'ireland': 'IRE',
    'mumbai indians': 'MI', 'chennai super kings': 'CSK',
    'royal challengers': 'RCB', 'kolkata knight riders': 'KKR',
    'delhi capitals': 'DC', 'punjab kings': 'PBKS',
    'rajasthan royals': 'RR', 'sunrisers hyderabad': 'SRH',
    'gujarat titans': 'GT', 'lucknow super giants': 'LSG',
  };
  return map[name.toLowerCase()] || name.slice(0, 3).toUpperCase();
}

export function getTeamFlag(name = '') {
  const map = {
    'india': '🇮🇳', 'pakistan': '🇵🇰', 'australia': '🇦🇺',
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'south africa': '🇿🇦', 'new zealand': '🇳🇿',
    'west indies': '🏝️', 'sri lanka': '🇱🇰', 'bangladesh': '🇧🇩',
    'afghanistan': '🇦🇫', 'zimbabwe': '🇿🇼', 'ireland': '🇮🇪',
  };
  return map[name.toLowerCase()] || '🏏';
}

export function gradeColor(grade) {
  return { 'A+': 'var(--green)', 'A': 'var(--green)', 'B+': 'var(--teal)', 'B': 'var(--blue)', 'C': 'var(--amber)', 'D': 'var(--red)' }[grade] || 'var(--t2)';
}
