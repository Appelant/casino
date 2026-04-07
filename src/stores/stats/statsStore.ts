import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StatsState } from '@/types';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys';

/**
 * État initial des statistiques
 */
const INITIAL_STATE: StatsState = {
  totalWagered: 0,
  totalWon: 0,
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  biggestWin: 0,
  currentStreak: 0,
  bestWinStreak: 0,
  bestLossStreak: 0,
  sessionStart: Date.now(),
  lastPlayedAt: null,
};

/**
 * Interface complète du store stats avec actions et sélecteurs
 */
export interface StatsStore extends StatsState {
  recordGame: (won: number, wagered: number) => void;
  resetStats: () => void;
  // Sélecteurs
  rtp: number;
  winRate: number;
  sessionDuration: number;
  streakStatus: 'hot' | 'cold' | 'neutral';
  averageBet: number;
}

/**
 * Store Zustand pour les statistiques
 */
export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // Actions pour mettre à jour les stats
      recordGame: (won: number, wagered: number) => {
        const current = get();
        const isWin = won > wagered;
        const newStreak = isWin
          ? Math.max(1, current.currentStreak + 1)
          : Math.min(-1, current.currentStreak - 1);

        set({
          totalWagered: current.totalWagered + wagered,
          totalWon: current.totalWon + won,
          totalGames: current.totalGames + 1,
          totalWins: current.totalWins + (isWin ? 1 : 0),
          totalLosses: current.totalLosses + (isWin ? 0 : 1),
          biggestWin: Math.max(current.biggestWin, won),
          currentStreak: newStreak,
          bestWinStreak: isWin ? Math.max(current.bestWinStreak, newStreak) : current.bestWinStreak,
          bestLossStreak: !isWin ? Math.max(current.bestLossStreak, Math.abs(newStreak)) : current.bestLossStreak,
          lastPlayedAt: Date.now(),
        });
      },

      /**
       * Réinitialise toutes les statistiques
       */
      resetStats: () => {
        set({
          ...INITIAL_STATE,
          sessionStart: Date.now(),
        });
      },

      // Sélecteurs
      get rtp() {
        const state = get();
        if (state.totalWagered === 0) return 100;
        return (state.totalWon / state.totalWagered) * 100;
      },

      get winRate() {
        const state = get();
        if (state.totalGames === 0) return 0;
        return (state.totalWins / state.totalGames) * 100;
      },

      get sessionDuration() {
        return Date.now() - get().sessionStart;
      },

      get streakStatus() {
        const streak = get().currentStreak;
        if (streak >= 3) return 'hot';
        if (streak <= -3) return 'cold';
        return 'neutral';
      },

      get averageBet() {
        const state = get();
        if (state.totalGames === 0) return 0;
        return state.totalWagered / state.totalGames;
      },
    }),
    {
      name: STORAGE_KEYS.STATS,
    }
  )
);
