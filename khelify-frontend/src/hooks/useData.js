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

      // ✅ FIX: Ensure correct structure
      if (!res || !res.success) return [];

      return res.matches || [];
    },

    refetchInterval: 120000,
    staleTime: 110000,
  });
}

// ===============================
// MATCH (LOCAL FROM LIVE DATA)
// ===============================
export function useMatch(id) {
  const { data: matches = [], isLoading, isError } = useLiveMatches();

  const match = matches.find(m => String(m.id) === String(id));

  return {
    data: { match },
    isLoading,
    isError: isError || !match
  };
}

// ===============================
// PLAYER
// ===============================
export function usePlayer(id) {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => cricketApi.getPlayer(id),
    enabled: !!id,
    staleTime: 300000,
  });
}
