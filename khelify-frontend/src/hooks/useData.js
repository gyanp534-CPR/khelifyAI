import { useQuery } from '@tanstack/react-query';
import { cricketApi } from '../services/api';

// ===============================
// LIVE MATCHES
// ===============================
export function useLiveMatches() {
  return useQuery({
    queryKey: ['live-matches'],

    queryFn: async () => {
      const res = await cricketApi.getLive();
      return res?.matches || [];
    },

    refetchInterval: 120_000, // 🔥 reduced API spam (2 min)
    staleTime: 110_000,
  });
}

// ===============================
// MATCH (LOCAL FROM LIVE DATA)
// ===============================
export function useMatch(id) {
  const { data: matches = [] } = useLiveMatches();

  return {
    data: {
      match: matches.find(m => m.id === id)
    },
    isLoading: false,
    isError: false
  };
}

// ===============================
// PLAYERS (UNCHANGED)
// ===============================
export function usePlayer(id) {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => cricketApi.getPlayer(id),
    enabled: !!id,
    staleTime: 300_000,
  });
}
