import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // Selected match
  activeMatchId: null,
  setActiveMatch: (id) => set({ activeMatchId: id }),

  // Active sport tab
  activeSport: 'cricket',
  setActiveSport: (sport) => set({ activeSport: sport }),

  // Mobile sidebar
  sidebarOpen: false,
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  // Last refresh time
  lastRefresh: null,
  setLastRefresh: (t) => set({ lastRefresh: t }),

  // API quota banner
  quotaWarning: false,
  setQuotaWarning: (v) => set({ quotaWarning: v }),
}));
