import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE, timeout: 10000 });

// Intercept errors globally
api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.error || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

export const cricketApi = {
  getLive:        ()         => api.get('/cricket/live'),
  getMatch:       (id)       => api.get(`/cricket/match/${id}`),
  getAnalysis:    (id)       => api.get(`/cricket/analysis/${id}`),
  getSeries:      ()         => api.get('/cricket/series'),
  getPlayer:      (id)       => api.get(`/cricket/player/${id}`),
  searchPlayers:  (q)        => api.get(`/cricket/player/search?q=${q}`),
  getVideos:      (t1, t2, tournament) =>
    api.get(`/cricket/videos?team1=${encodeURIComponent(t1)}&team2=${encodeURIComponent(t2)}${tournament ? `&tournament=${encodeURIComponent(tournament)}` : ''}`),
};

export const systemApi = {
  getStatus: () => api.get('/status'),
  refresh:   () => api.post('/refresh'),
};

export default api;
