import { useQuery } from '@tanstack/react-query';
import { cricketApi, systemApi } from '../services/api';

// Live matches - refetch every 60s
export function useLiveMatches() {
  return useQuery({
    queryKey: ['live-matches'],
    queryFn:  cricketApi.getLive,
    refetchInterval: 60_000,
    staleTime: 55_000,
    select: d => d?.matches ?? [],
  });
}

// Single match detail
export function useMatch(id) {
  return useQuery({
    queryKey: ['match', id],
    queryFn:  () => cricketApi.getMatch(id),
    enabled:  !!id,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

// Rule-engine analysis for a match
export function useAnalysis(id) {
  return useQuery({
    queryKey: ['analysis', id],
    queryFn:  () => cricketApi.getAnalysis(id),
    enabled:  !!id,
    refetchInterval: 90_000,
    staleTime: 80_000,
  });
}

// Series list
export function useSeries() {
  return useQuery({
    queryKey: ['series'],
    queryFn:  cricketApi.getSeries,
    staleTime: 10 * 60_000,
    select: d => d?.series ?? [],
  });
}

// Player details
export function usePlayer(id) {
  return useQuery({
    queryKey: ['player', id],
    queryFn:  () => cricketApi.getPlayer(id),
    enabled:  !!id,
    staleTime: 30 * 60_000,
  });
}

// YouTube videos for a match
export function useMatchVideos(team1, team2, tournament) {
  return useQuery({
    queryKey: ['videos', team1, team2],
    queryFn:  () => cricketApi.getVideos(team1, team2, tournament),
    enabled:  !!(team1 && team2),
    staleTime: 30 * 60_000,
    select: d => d?.videos ?? { highlights: [], analysis: [], reactions: [] },
  });
}

// System status (quota)
export function useSystemStatus() {
  return useQuery({
    queryKey: ['system-status'],
    queryFn:  systemApi.getStatus,
    refetchInterval: 5 * 60_000,
    staleTime: 4 * 60_000,
  });
}
