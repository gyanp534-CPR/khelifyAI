import axios from 'axios';

export async function fetchESPNMatches() {
  const res = await axios.get(
    'https://site.api.espncricinfo.com/apis/site/v2/sports/cricket/matches/live'
  );

  return res.data.events || [];
}
